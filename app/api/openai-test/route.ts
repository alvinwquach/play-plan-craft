import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Activity {
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
}

interface Supply {
  name: string;
  quantity: number;
  unit: string;
  note: string | null;
}

interface DevelopmentGoal {
  name: string;
  description: string;
}

interface LessonPlan {
  title: string;
  ageGroup: string;
  subject: string;
  theme: string | null;
  status: string;
  duration: number;
  activities: Activity[];
  supplies: Supply[];
  tags: string[];
  developmentGoals: DevelopmentGoal[];
}

export async function POST(request: Request) {
  try {
    const { title, ageGroup, subject, theme, duration, activityTypes } =
      await request.json();

    const validAgeGroups = ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"];
    const validSubjects = [
      "LITERACY",
      "MATH",
      "SCIENCE",
      "ART",
      "MUSIC",
      "PHYSICAL_EDUCATION",
      "SOCIAL_EMOTIONAL",
    ];
    const validThemes = [
      "SEASONS",
      "NATURE",
      "HOLIDAYS",
      "EMOTIONS",
      "COMMUNITY",
      "ANIMALS",
      "TRANSPORTATION",
      "COLORS",
      "SHAPES",
      "NUMBERS",
    ];
    const validActivityTypes = [
      "STORYTELLING",
      "CRAFT",
      "MOVEMENT",
      "MUSIC",
      "EXPERIMENT",
      "FREE_PLAY",
      "OUTDOOR",
    ];

    if (!validAgeGroups.includes(ageGroup)) {
      return NextResponse.json(
        { success: false, error: `Invalid ageGroup: ${ageGroup}` },
        { status: 400 }
      );
    }
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { success: false, error: `Invalid subject: ${subject}` },
        { status: 400 }
      );
    }
    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json(
        { success: false, error: `Invalid theme: ${theme}` },
        { status: 400 }
      );
    }
    if (duration < 5 || duration > 120) {
      return NextResponse.json(
        { success: false, error: `Invalid duration: ${duration}` },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(activityTypes) ||
      activityTypes.length === 0 ||
      !activityTypes.every((type: string) => validActivityTypes.includes(type))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid activity types: ${activityTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const prompt = `
      Generate a ${duration}-minute lesson plan for ${ageGroup.toLowerCase()} children focusing on ${subject.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    }. 
      Use the following inputs:
      - Lesson plan title: ${
        title
          ? `"${title}"`
          : `Generate a title (e.g., "${ageGroup} ${subject} Lesson on ${
              theme || "General"
            }")`
      }
      - Activity types to include: ${activityTypes.join(", ")}
      Include:
      - A lesson plan title
      - A list of activities (each with title, activityType, description, and duration in minutes, using the provided activity types)
      - A list of required supplies with name, quantity, unit, and optional note
      - Relevant developmental goals for the age group
      - Tags for filtering (e.g., ENGAGING, EDUCATIONAL)
      - Status set to DRAFT
      Return the response in JSON format matching this structure...
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error("Invalid JSON response from OpenAI");
    }

    const lesson = parsed.lessonPlan;
    if (
      !lesson ||
      typeof lesson.title !== "string" ||
      typeof lesson.ageGroup !== "string" ||
      typeof lesson.subject !== "string" ||
      typeof lesson.status !== "string"
    ) {
      throw new Error("Incomplete lesson plan response");
    }

    const lessonPlan: LessonPlan = {
      title: lesson.title,
      ageGroup: lesson.ageGroup,
      subject: lesson.subject,
      theme: lesson.theme ?? null,
      status: lesson.status,
      duration: parseInt(
        lesson.duration?.toString().replace("minutes", "").trim() ?? "0",
        10
      ),
      activities: (lesson.activities ?? []).map((activity: any) => ({
        title: activity.title ?? "Untitled Activity",
        activityType: activity.activityType ?? "UNKNOWN",
        description: activity.description ?? "",
        durationMins: parseInt(
          activity.durationMins?.toString().replace("minutes", "").trim() ??
            "0",
          10
        ),
      })),
      supplies: (
        lesson.supplies ??
        parsed.lessonPlan?.requiredSupplies ??
        []
      ).map(
        (supply: any): Supply =>
          typeof supply === "string"
            ? { name: supply, quantity: 1, unit: "unit", note: null }
            : {
                name: supply.name ?? "Unnamed Supply",
                quantity: supply.quantity ?? 1,
                unit: supply.unit ?? "unit",
                note: supply.note ?? null,
              }
      ),
      tags: lesson.tags ?? ["ENGAGING", "EDUCATIONAL"],
      developmentGoals: lesson.developmentGoals ?? [
        {
          name: "Cognitive Development",
          description: "Enhance problem-solving and critical thinking",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      lessonPlan,
    });
  } catch (error: unknown) {
    console.error("Error generating lesson plan:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate lesson plan",
      },
      { status: 500 }
    );
  }
}
