"use server";

import { OpenAIResponse, Source } from "@/app/types/lessonPlan";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateEmbedding, createLessonSummary } from "@/app/lib/embeddings";
import {
  FormDataInput,
  normalizeFormData,
  validateAllInputs,
} from "@/app/lib/lessonPlan/validators";
import { getDefaultSources, validActivityTypes, getGradeCategory } from "@/app/lib/lessonPlan/constants";
import { buildLessonPlanPrompt } from "@/app/lib/lessonPlan/promptBuilder";
import {
  processLessonPlan,
  addPlaceholderActivities,
} from "@/app/lib/lessonPlan/responseProcessor";
import {
  findSimilarLessons,
  getRecentLessons,
  insertLessonPlan,
  createSchedule,
} from "@/app/lib/lessonPlan/database";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createLessonPlan(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const rawData = Object.fromEntries(formData) as unknown;
    const inputData: FormDataInput = rawData as FormDataInput;

    const normalizedData = normalizeFormData(inputData);
    validateAllInputs(normalizedData);

    const {
      title,
      gradeLevel,
      subject,
      theme,
      duration,
      activityTypes,
      classroomSize,
      learningIntention,
      successCriteria,
      standardsFramework,
      standards,
      preferredSources,
      curriculum,
      scheduledDate,
    } = normalizedData;

    // Get sources from preferred sources or default sources
    const defaultSources = getDefaultSources(curriculum);
    const sources: Source[] = Array.isArray(preferredSources)
      ? preferredSources.map((source) => ({
          name: source.name || "Unnamed Source",
          url: source.url || "https://www.example.com",
          description:
            source.description || "Source used for activity inspiration",
        }))
      : defaultSources;

    // Generate preliminary embedding for similarity search
    const preliminarySummary = await createLessonSummary({
      title: title || "Lesson",
      subject: subject,
      gradeLevel: gradeLevel,
      learningIntention: learningIntention,
      successCriteria: successCriteria,
      theme: theme,
    });
    // Generate embedding for similarity search
    const queryEmbedding = await generateEmbedding(preliminarySummary);
    // Get recent lessons and similar lessons
    const [recentLessons, similarLessons] = await Promise.all([
      getRecentLessons(gradeLevel, subject, user.id, 3),
      findSimilarLessons(queryEmbedding, gradeLevel, subject, user.id, 0.75, 3),
    ]);

    // Build the OpenAI prompt
    const prompt = buildLessonPlanPrompt({
      lessonContext: { recentLessons, similarLessons },
      curriculum,
      gradeLevel,
      subject,
      theme,
      duration,
      classroomSize,
      activityTypes,
      learningIntention,
      successCriteria,
      standardsFramework,
      standards,
      sources,
    });

    let parsed: OpenAIResponse | null = null;
    let missingActivityTypes: string[] = [];
    const maxRetries = 3;
    let retryCount = 0;

    const gradeCategory = getGradeCategory(gradeLevel);
    const allowedActivityTypes = validActivityTypes[curriculum][gradeCategory];
    const defaultActivityTypes =
      activityTypes.length === 0
        ? allowedActivityTypes.slice(0, 2)
        : activityTypes;

    do {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content:
              retryCount > 0
                ? `${prompt}\n\nPrevious attempt missing activity types: ${missingActivityTypes.join(
                    ", "
                  )}. Ensure all requested activity types (${defaultActivityTypes.join(
                    ", "
                  )}) are included in the "activities" array, with 2-3 alternate ideas per type in "alternateActivities".`
                : prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Invalid JSON response from OpenAI");
      }

      const lesson = parsed?.lessonPlan;

      if (
        !lesson ||
        typeof lesson.title !== "string" ||
        typeof lesson.gradeLevel !== "string" ||
        typeof lesson.subject !== "string" ||
        typeof lesson.classroomSize !== "number"
      ) {
        throw new Error("Incomplete lesson plan response");
      }

      if (activityTypes.length > 0) {
        const generatedActivityTypes = new Set(
          (lesson.activities ?? []).map((a) => a.activityType)
        );
        missingActivityTypes = activityTypes.filter(
          (type) => !generatedActivityTypes.has(type)
        );
        if (missingActivityTypes.length > 0) {
          console.warn(
            `Attempt ${retryCount + 1}: Missing activities for types:`,
            missingActivityTypes.join(", ")
          );
          retryCount++;
        } else {
          break;
        }
      } else {
        break;
      }
    } while (retryCount < maxRetries);

    if (!parsed) {
      throw new Error("Failed to generate a valid lesson plan after retries");
    }

    const lessonPlan = processLessonPlan({
      parsed,
      title,
      gradeLevel,
      subject,
      theme,
      duration,
      classroomSize,
      activityTypes,
      learningIntention,
      successCriteria,
      standards,
      curriculum,
      sources,
      userId: user.id,
    });

    if (
      activityTypes.length > 0 &&
      missingActivityTypes.length > 0 &&
      lessonPlan.alternateActivities &&
      Array.isArray(lessonPlan.alternateActivities)
    ) {
      addPlaceholderActivities(
        missingActivityTypes,
        lessonPlan.activities,
        lessonPlan.alternateActivities,
        subject,
        theme,
        duration,
        activityTypes,
        curriculum,
        sources
      );
    }

    const lessonSummary = await createLessonSummary({
      title: lessonPlan.title,
      subject: lessonPlan.subject,
      gradeLevel: lessonPlan.gradeLevel,
      learningIntention: lessonPlan.learningIntention,
      successCriteria: lessonPlan.successCriteria,
      theme: lessonPlan.theme,
    });
    const embedding = await generateEmbedding(lessonSummary);


    const newLessonPlan = await insertLessonPlan(lessonPlan, embedding, theme);

    if (scheduledDate) {
      await createSchedule(scheduledDate, newLessonPlan.id, lessonPlan.duration, user.id);
    } else {
    
    }

    revalidatePath("/calendar", "page");
    return {
      success: true,
      data: newLessonPlan,
    };
    
  } catch (error: unknown) {
    console.error("Error generating lesson plan:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate lesson plan",
    };
  }
}