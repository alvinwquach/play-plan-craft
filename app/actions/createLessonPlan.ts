"use server";

import {
  Activity,
  AlternateActivityGroup,
  Curriculum,
  LessonPlan,
  OpenAIResponse,
  Source,
} from "@/app/types/lessonPlan";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { revalidatePath } from "next/cache";

interface FormDataInput {
  title?: string;
  gradeLevel: string;
  subject: string;
  theme?: string | null;
  duration: string;
  activityTypes?: string[] | string;
  classroomSize: string;
  learningIntention?: string;
  successCriteria?: string[] | string;
  standardsFramework?: string;
  standards?:
    | { code: string; description: string; source?: Source }[]
    | string[];
  preferredSources?: Source[] | string;
  curriculum: Curriculum;
  scheduledDate?: string | null;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

type LessonPlanDB = InferSelectModel<typeof lessonPlans>;
type LessonPlanInsert = InferInsertModel<typeof lessonPlans>;

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

    const gradeLevelMap: { [key: string]: string } = {
      "1": "GRADE_1",
      "2": "GRADE_2",
      "3": "GRADE_3",
      "4": "GRADE_4",
      "5": "GRADE_5",
      "6": "GRADE_6",
      "7": "GRADE_7",
      "8": "GRADE_8",
      "9": "GRADE_9",
      "10": "GRADE_10",
      "11": "GRADE_11",
      "12": "GRADE_12",
      infant: "INFANT",
      toddler: "TODDLER",
      preschool: "PRESCHOOL",
      kindergarten: "KINDERGARTEN",
      grade_1: "GRADE_1",
      grade_2: "GRADE_2",
      grade_3: "GRADE_3",
      grade_4: "GRADE_4",
      grade_5: "GRADE_5",
      grade_6: "GRADE_6",
      grade_7: "GRADE_7",
      grade_8: "GRADE_8",
      grade_9: "GRADE_9",
      grade_10: "GRADE_10",
      grade_11: "GRADE_11",
      grade_12: "GRADE_12",
      "Grade 1": "GRADE_1",
      "Grade 2": "GRADE_2",
      "Grade 3": "GRADE_3",
      "Grade 4": "GRADE_4",
      "Grade 5": "GRADE_5",
      "Grade 6": "GRADE_6",
      "Grade 7": "GRADE_7",
      "Grade 8": "GRADE_8",
      "Grade 9": "GRADE_9",
      "Grade 10": "GRADE_10",
      "Grade 11": "GRADE_11",
      "Grade 12": "GRADE_12",
      INFANT: "INFANT",
      TODDLER: "TODDLER",
      PRESCHOOL: "PRESCHOOL",
      KINDERGARTEN: "KINDERGARTEN",
      GRADE_1: "GRADE_1",
      GRADE_2: "GRADE_2",
      GRADE_3: "GRADE_3",
      GRADE_4: "GRADE_4",
      GRADE_5: "GRADE_5",
      GRADE_6: "GRADE_6",
      GRADE_7: "GRADE_7",
      GRADE_8: "GRADE_8",
      GRADE_9: "GRADE_9",
      GRADE_10: "GRADE_10",
      GRADE_11: "GRADE_11",
      GRADE_12: "GRADE_12",
    };

    const validGradeLevels = [
      "INFANT",
      "TODDLER",
      "PRESCHOOL",
      "KINDERGARTEN",
      "GRADE_1",
      "GRADE_2",
      "GRADE_3",
      "GRADE_4",
      "GRADE_5",
      "GRADE_6",
      "GRADE_7",
      "GRADE_8",
      "GRADE_9",
      "GRADE_10",
      "GRADE_11",
      "GRADE_12",
    ];

    const inputGradeLevel = inputData.gradeLevel
      ?.toString()
      .toLowerCase()
      .trim();
    const normalizedGradeLevel =
      gradeLevelMap[inputGradeLevel?.toLowerCase().trim()];
    if (
      !normalizedGradeLevel ||
      !validGradeLevels.includes(normalizedGradeLevel)
    ) {
      throw new Error(`Invalid gradeLevel: ${inputGradeLevel}`);
    }

    const subjectMap: { [key: string]: string } = {
      literacy: "LITERACY",
      math: "MATH",
      science: "SCIENCE",
      Science: "SCIENCE",
      art: "ART",
      music: "MUSIC",
      physical_education: "PHYSICAL_EDUCATION",
      social_emotional: "SOCIAL_EMOTIONAL",
      history: "HISTORY",
      geography: "GEOGRAPHY",
      stem: "STEM",
      foreign_language: "FOREIGN_LANGUAGE",
      computer_science: "COMPUTER_SCIENCE",
      "computer science": "COMPUTER_SCIENCE",
      "Computer Science": "COMPUTER_SCIENCE",
      civics: "CIVICS",
      english: "ENGLISH",
      mathematics: "MATHEMATICS",
      the_arts: "THE_ARTS",
      health_pe: "HEALTH_PE",
      humanities_social_sciences: "HUMANITIES_SOCIAL_SCIENCES",
      technologies: "TECHNOLOGIES",
      languages: "LANGUAGES",
      civics_citizenship: "CIVICS_CITIZENSHIP",
      sensory_development: "SENSORY_DEVELOPMENT",
      fine_motor_skills: "FINE_MOTOR_SKILLS",
      language_development: "LANGUAGE_DEVELOPMENT",
      social_studies: "SOCIAL_STUDIES",
      drama: "DRAMA",
      dance: "DANCE",
      health_and_wellness: "HEALTH_AND_WELLNESS",
      character_education: "CHARACTER_EDUCATION",
      community_service: "COMMUNITY_SERVICE",
      engineering: "ENGINEERING",
      business: "BUSINESS",
      economics: "ECONOMICS",
      philosophy: "PHILOSOPHY",
      LITERACY: "LITERACY",
      MATH: "MATH",
      SCIENCE: "SCIENCE",
      ART: "ART",
      MUSIC: "MUSIC",
      PHYSICAL_EDUCATION: "PHYSICAL_EDUCATION",
      SOCIAL_EMOTIONAL: "SOCIAL_EMOTIONAL",
      HISTORY: "HISTORY",
      GEOGRAPHY: "GEOGRAPHY",
      STEM: "STEM",
      FOREIGN_LANGUAGE: "FOREIGN_LANGUAGE",
      COMPUTER_SCIENCE: "COMPUTER_SCIENCE",
      CIVICS: "CIVICS",
      ENGLISH: "ENGLISH",
      MATHEMATICS: "MATHEMATICS",
      THE_ARTS: "THE_ARTS",
      HEALTH_PE: "HEALTH_PE",
      HUMANITIES_SOCIAL_SCIENCES: "HUMANITIES_SOCIAL_SCIENCES",
      TECHNOLOGIES: "TECHNOLOGIES",
      LANGUAGES: "LANGUAGES",
      CIVICS_CITIZENSHIP: "CIVICS_CITIZENSHIP",
      SENSORY_DEVELOPMENT: "SENSORY_DEVELOPMENT",
      FINE_MOTOR_SKILLS: "FINE_MOTOR_SKILLS",
      LANGUAGE_DEVELOPMENT: "LANGUAGE_DEVELOPMENT",
      SOCIAL_STUDIES: "SOCIAL_STUDIES",
      DRAMA: "DRAMA",
      DANCE: "DANCE",
      HEALTH_AND_WELLNESS: "HEALTH_AND_WELLNESS",
      CHARACTER_EDUCATION: "CHARACTER_EDUCATION",
      COMMUNITY_SERVICE: "COMMUNITY_SERVICE",
      ENGINEERING: "ENGINEERING",
      BUSINESS: "BUSINESS",
      ECONOMICS: "ECONOMICS",
      PHILOSOPHY: "PHILOSOPHY",
    };

    const validSubjectsList = [
      "LITERACY",
      "MATH",
      "SCIENCE",
      "ART",
      "MUSIC",
      "PHYSICAL_EDUCATION",
      "SOCIAL_EMOTIONAL",
      "HISTORY",
      "GEOGRAPHY",
      "STEM",
      "FOREIGN_LANGUAGE",
      "COMPUTER_SCIENCE",
      "CIVICS",
      "ENGLISH",
      "MATHEMATICS",
      "THE_ARTS",
      "HEALTH_PE",
      "HUMANITIES_SOCIAL_SCIENCES",
      "TECHNOLOGIES",
      "LANGUAGES",
      "CIVICS_CITIZENSHIP",
      "SENSORY_DEVELOPMENT",
      "FINE_MOTOR_SKILLS",
      "LANGUAGE_DEVELOPMENT",
      "SOCIAL_STUDIES",
      "DRAMA",
      "DANCE",
      "HEALTH_AND_WELLNESS",
      "CHARACTER_EDUCATION",
      "COMMUNITY_SERVICE",
      "ENGINEERING",
      "BUSINESS",
      "ECONOMICS",
      "PHILOSOPHY",
    ];

    const inputSubject = inputData.subject?.toString().trim();
    console.log("Input subject:", inputSubject);
    const normalizedSubject = inputSubject
      ? subjectMap[inputSubject]
      : undefined;
    console.log("Normalized subject:", normalizedSubject);
    if (!normalizedSubject || !validSubjectsList.includes(normalizedSubject)) {
      throw new Error(`Invalid subject: ${inputSubject || "undefined"}`);
    }

    const normalizedData = {
      title: inputData.title || "Untitled Lesson",
      gradeLevel: normalizedGradeLevel,
      subject: normalizedSubject,
      theme: inputData.theme === "" ? null : inputData.theme ?? null,
      duration: inputData.duration,
      activityTypes: Array.isArray(inputData.activityTypes)
        ? inputData.activityTypes
        : typeof inputData.activityTypes === "string"
        ? inputData.activityTypes.split(",").map((s) => s.trim())
        : [],
      classroomSize: inputData.classroomSize,
      learningIntention: inputData.learningIntention || "",
      successCriteria: Array.isArray(inputData.successCriteria)
        ? inputData.successCriteria
        : typeof inputData.successCriteria === "string"
        ? inputData.successCriteria.split(",").map((s) => s.trim())
        : [],
      standardsFramework: inputData.standardsFramework || "",
      standards: Array.isArray(inputData.standards)
        ? inputData.standards.map((s) =>
            typeof s === "string"
              ? { code: s, description: "", source: undefined }
              : s
          )
        : [],
      preferredSources: Array.isArray(inputData.preferredSources)
        ? inputData.preferredSources
        : typeof inputData.preferredSources === "string"
        ? JSON.parse(inputData.preferredSources)
        : [],
      curriculum: inputData.curriculum,
      scheduledDate:
        inputData.scheduledDate === null ? inputData.scheduledDate : undefined,
    };

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

    const validCurriculums: Curriculum[] = ["US", "AUS"];
    if (!validCurriculums.includes(curriculum)) {
      throw new Error(`Invalid curriculum: ${curriculum}`);
    }

    if (!validGradeLevels.includes(gradeLevel)) {
      console.error(`Invalid gradeLevel received: ${gradeLevel}`);
      throw new Error(`Invalid gradeLevel: ${gradeLevel}`);
    }
    const earlyGrades = ["INFANT", "TODDLER", "PRESCHOOL", "KINDERGARTEN"];
    const elementaryGrades = [
      "GRADE_1",
      "GRADE_2",
      "GRADE_3",
      "GRADE_4",
      "GRADE_5",
    ];
    const middleSchoolGrades = ["GRADE_6", "GRADE_7", "GRADE_8"];
    const highSchoolGrades = ["GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"];

    type GradeCategory = "early" | "elementary" | "middle" | "high";

    const validSubjects: Record<Curriculum, Record<GradeCategory, string[]>> = {
      US: {
        early: [
          "LITERACY",
          "MATH",
          "SCIENCE",
          "ART",
          "MUSIC",
          "PHYSICAL_EDUCATION",
          "SOCIAL_EMOTIONAL",
        ],
        elementary: [
          "LITERACY",
          "MATH",
          "SCIENCE",
          "ART",
          "MUSIC",
          "PHYSICAL_EDUCATION",
          "SOCIAL_EMOTIONAL",
          "HISTORY",
          "GEOGRAPHY",
        ],
        middle: [
          "LITERACY",
          "MATH",
          "SCIENCE",
          "ART",
          "MUSIC",
          "PHYSICAL_EDUCATION",
          "SOCIAL_EMOTIONAL",
          "HISTORY",
          "LITERATURE",
          "GEOGRAPHY",
          "STEM",
        ],
        high: [
          "LITERACY",
          "MATH",
          "SCIENCE",
          "ART",
          "MUSIC",
          "PHYSICAL_EDUCATION",
          "SOCIAL_EMOTIONAL",
          "HISTORY",
          "LITERATURE",
          "GEOGRAPHY",
          "STEM",
          "FOREIGN_LANGUAGE",
          "COMPUTER_SCIENCE",
          "CIVICS",
        ],
      },
      AUS: {
        early: [
          "ENGLISH",
          "MATHEMATICS",
          "SCIENCE",
          "THE_ARTS",
          "HEALTH_PE",
          "SOCIAL_EMOTIONAL",
        ],
        elementary: [
          "ENGLISH",
          "MATHEMATICS",
          "SCIENCE",
          "THE_ARTS",
          "HEALTH_PE",
          "SOCIAL_EMOTIONAL",
          "HUMANITIES_SOCIAL_SCIENCES",
          "TECHNOLOGIES",
        ],
        middle: [
          "ENGLISH",
          "MATHEMATICS",
          "SCIENCE",
          "THE_ARTS",
          "HEALTH_PE",
          "SOCIAL_EMOTIONAL",
          "HUMANITIES_SOCIAL_SCIENCES",
          "TECHNOLOGIES",
          "LANGUAGES",
        ],
        high: [
          "ENGLISH",
          "MATHEMATICS",
          "SCIENCE",
          "THE_ARTS",
          "HEALTH_PE",
          "SOCIAL_EMOTIONAL",
          "HUMANITIES_SOCIAL_SCIENCES",
          "TECHNOLOGIES",
          "LANGUAGES",
          "CIVICS_CITIZENSHIP",
        ],
      },
    };

    const validThemes: Record<Curriculum, Record<GradeCategory, string[]>> = {
      US: {
        early: [
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
        ],
        elementary: [
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
          "CULTURE",
          "HISTORY",
        ],
        middle: [
          "SEASONS",
          "NATURE",
          "HOLIDAYS",
          "EMOTIONS",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORTATION",
          "CULTURE",
          "HISTORY",
          "SCIENCE_FICTION",
          "TECHNOLOGY",
        ],
        high: [
          "SEASONS",
          "NATURE",
          "HOLIDAYS",
          "EMOTIONS",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORTATION",
          "CULTURE",
          "HISTORY",
          "SCIENCE_FICTION",
          "GLOBAL_ISSUES",
          "TECHNOLOGY",
          "LITERATURE",
        ],
      },
      AUS: {
        early: [
          "SEASONS",
          "NATURE",
          "INDIGENOUS_CULTURE",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORT",
          "COLOURS",
          "SHAPES",
          "NUMBERS",
        ],
        elementary: [
          "SEASONS",
          "NATURE",
          "INDIGENOUS_CULTURE",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORT",
          "COLOURS",
          "SHAPES",
          "NUMBERS",
          "AUSTRALIAN_HISTORY",
          "SUSTAINABILITY",
        ],
        middle: [
          "SEASONS",
          "NATURE",
          "INDIGENOUS_CULTURE",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORT",
          "AUSTRALIAN_HISTORY",
          "SUSTAINABILITY",
          "TECHNOLOGY",
        ],
        high: [
          "SEASONS",
          "NATURE",
          "INDIGENOUS_CULTURE",
          "COMMUNITY",
          "ANIMALS",
          "TRANSPORT",
          "AUSTRALIAN_HISTORY",
          "SUSTAINABILITY",
          "GLOBAL_ISSUES",
          "TECHNOLOGY",
          "LITERATURE",
        ],
      },
    };

    const validActivityTypes: Record<
      Curriculum,
      Record<GradeCategory, string[]>
    > = {
      US: {
        early: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "FREE_PLAY",
          "OUTDOOR",
        ],
        elementary: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "FREE_PLAY",
          "OUTDOOR",
          "WRITING",
          "PROJECT",
        ],
        middle: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "OUTDOOR",
          "GROUP_DISCUSSION",
          "PROJECT",
          "PRESENTATION",
          "WRITING",
        ],
        high: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "OUTDOOR",
          "GROUP_DISCUSSION",
          "PROJECT",
          "PRESENTATION",
          "WRITING",
          "RESEARCH",
          "DEBATE",
          "CODING",
        ],
      },
      AUS: {
        early: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "FREE_PLAY",
          "OUTDOOR",
          "INDIGENOUS_STORY",
        ],
        elementary: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "FREE_PLAY",
          "OUTDOOR",
          "WRITING",
          "PROJECT",
          "INDIGENOUS_STORY",
        ],
        middle: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "OUTDOOR",
          "GROUP_DISCUSSION",
          "PROJECT",
          "PRESENTATION",
          "WRITING",
          "INDIGENOUS_STORY",
        ],
        high: [
          "STORYTELLING",
          "CRAFT",
          "MOVEMENT",
          "MUSIC",
          "EXPERIMENT",
          "OUTDOOR",
          "GROUP_DISCUSSION",
          "PROJECT",
          "PRESENTATION",
          "WRITING",
          "RESEARCH",
          "DEBATE",
          "CODING",
          "INDIGENOUS_STORY",
        ],
      },
    };

    let gradeCategory: GradeCategory;
    if (earlyGrades.includes(gradeLevel)) {
      gradeCategory = "early";
    } else if (elementaryGrades.includes(gradeLevel)) {
      gradeCategory = "elementary";
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      gradeCategory = "middle";
    } else if (highSchoolGrades.includes(gradeLevel)) {
      gradeCategory = "high";
    } else {
      throw new Error(`Invalid gradeLevel: ${gradeLevel}`);
    }

    const typedCurriculum = curriculum as Curriculum;
    const allowedSubjects = validSubjects[typedCurriculum][gradeCategory];
    const allowedThemes = validThemes[typedCurriculum][gradeCategory];
    const allowedActivityTypes =
      validActivityTypes[typedCurriculum][gradeCategory];

    if (!validGradeLevels.includes(gradeLevel)) {
      throw new Error(`Invalid gradeLevel: ${gradeLevel}`);
    }
    if (!allowedSubjects.includes(subject as any)) {
      throw new Error(
        `Invalid subject for ${gradeLevel} in ${curriculum} curriculum: ${subject}`
      );
    }
    if (theme && theme !== "OTHER" && !allowedThemes.includes(theme)) {
      throw new Error(
        `Invalid theme for ${gradeLevel} in ${curriculum} curriculum: ${theme}`
      );
    }
    const durationNum = parseInt(duration, 10);
    if (durationNum < 5 || durationNum > 120) {
      throw new Error(`Invalid duration: ${duration}`);
    }
    const classroomSizeNum = parseInt(classroomSize, 10);
    if (classroomSizeNum < 1 || classroomSizeNum > 100) {
      throw new Error(
        `Invalid classroom size: ${classroomSize}. Must be between 1 and 100.`
      );
    }
    if (!Array.isArray(activityTypes)) {
      throw new Error(`Invalid activityTypes: must be an array`);
    }
    if (
      activityTypes.length > 0 &&
      !activityTypes.every((type) => {
        const isValidType = allowedActivityTypes.includes(type);
        const isCustomType = !Object.values(
          validActivityTypes[typedCurriculum]
        ).some((category) => category.includes(type));
        return isValidType || isCustomType;
      })
    ) {
      throw new Error(
        `Invalid activity types for ${gradeLevel} in ${curriculum} curriculum: ${activityTypes.join(
          ", "
        )}`
      );
    }

    const validStandardsFrameworks =
      curriculum === "US"
        ? ["COMMON_CORE", "NGSS", "STATE_SPECIFIC"]
        : ["ACARA"];
    if (
      standardsFramework &&
      !validStandardsFrameworks.includes(standardsFramework)
    ) {
      throw new Error(
        `Invalid standards framework for ${curriculum} curriculum: ${standardsFramework}`
      );
    }
    if (
      standardsFramework &&
      (!Array.isArray(standards) || standards.length === 0)
    ) {
      throw new Error(
        "Standards must be provided when a standards framework is selected."
      );
    }

    const defaultSources: Source[] =
      curriculum === "US"
        ? [
            {
              name: "Khan Academy",
              url: "https://www.khanacademy.org",
              description: "Used for activity ideas and educational content",
            },
            {
              name: "NSTA",
              url: "https://www.nsta.org",
              description: "Used for science education resources",
            },
          ]
        : [
            {
              name: "ACARA",
              url: "https://www.australiancurriculum.edu.au",
              description:
                "Used for Australian curriculum standards and resources",
            },
            {
              name: "Scootle",
              url: "https://www.scootle.edu.au",
              description: "Used for Australian educational resources",
            },
          ];

    const sources: Source[] = Array.isArray(preferredSources)
      ? preferredSources.map((source) => ({
          name: source.name || "Unnamed Source",
          url: source.url || "https://www.example.com",
          description:
            source.description || "Source used for activity inspiration",
        }))
      : defaultSources;

    const prompt = `
        You are an AI lesson planner for the ${curriculum} curriculum, designed to support educators from nurturing infants to managing high school projects. Generate a structured JSON response for a lesson plan tailored to the provided inputs.
        
        Create a ${duration}-minute lesson plan for ${normalizedGradeLevel} students focusing on ${normalizedSubject?.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    } for a classroom of ${classroomSize} students, aligned with the ${curriculum} curriculum.
        
        **Curriculum Details**:
        - Curriculum: ${curriculum}
        - For US curriculum, align with frameworks like Common Core or NGSS if specified.
        - For Australian curriculum, align with ACARA standards (e.g., AC9M4N01 for Mathematics Year 4).
        - Ensure activities, subjects, and themes are appropriate for the ${curriculum} curriculum.
        
        **Activity Requirements**:
        - ${
          activityTypes.length > 0
            ? `Use the provided activity types: ${activityTypes.join(
                ", "
              )}. If custom activity types are provided (not in standard list), treat them as valid and design activities accordingly.`
            : "No specific activity types provided. Select 2-3 appropriate activity types from the following based on grade level and subject: " +
              allowedActivityTypes.join(", ") +
              "."
        }
        - For each activity type, generate **2-3 activity ideas** and select the **best one** to include in the "activities" array, based on:
          - Engagement: Score (0-100) based on how engaging the activity is for ${gradeLevel.toLowerCase()} students.
          - Alignment: Score (0-100) based on alignment with the subject (${subject?.toLowerCase()})${
      theme ? ` and theme (${theme.toLowerCase()})` : ""
    } and the ${curriculum} curriculum.
          - Feasibility: Score (0-100) based on practicality for a classroom of ${classroomSize} students and the given duration.
        - Include the selected activity's "engagementScore", "alignmentScore", and "feasibilityScore" in the response.
        - Include the non-selected activity ideas in an "alternateActivities" object, keyed by activity type, with their respective scores.
        - ${
          activityTypes.length > 0
            ? `Ensure **at least one activity per provided activity type** is included in the "activities" array.`
            : "Ensure 2-3 activities are included in the 'activities' array, appropriate for the grade level and subject."
        }
        - Distribute the total duration (${duration} minutes) across the activities in the "activities" array, ensuring the sum of activity durations approximately equals the total lesson duration.
        - Each activity (in both "activities" and "alternateActivities") must include a detailed description with clear steps or instructions tailored to the grade level, subject, and ${curriculum} curriculum.
        - For each activity, assign a trusted source from the following list of preferred sources: ${JSON.stringify(
          sources
        )}. Cycle through the provided sources to assign one to each activity. Each activity must have a "source" object with:
          - "name": string (e.g., "${
            curriculum === "US" ? "Khan Academy" : "ACARA"
          }")
          - "url": string (e.g., "${
            curriculum === "US"
              ? "https://www.khanacademy.org"
              : "https://www.australiancurriculum.edu.au"
          }")
          - "description": string (brief explanation of how the source was used, e.g., "Provided activity inspiration")
        
        **Supplies**:
        - Adjust the quantities of supplies to be appropriate for ${classroomSize} students. For example:
          - For individual activities (e.g., crafts), provide one item per student.
          - For shared items (e.g., books, tools), provide a reasonable number for group use (e.g., 1 per 4-6 students).
        - Include a "note" field for supplies when additional context is needed (e.g., specific book titles, sizes, or types).
        
        **Learning Intention and Success Criteria**:
        - ${
          learningIntention
            ? `Use this learning intention: "${learningIntention}".`
            : `Include a "Learning Intention" (a clear statement of what students will learn, aligned with the subject, grade level, and ${curriculum} curriculum).`
        }
        - ${
          successCriteria.length > 0
            ? `Use these success criteria: ${successCriteria
                .map((c) => `"${c}"`)
                .join(", ")}.`
            : `Include "Success Criteria" (a list of 3-5 measurable outcomes starting with "I can" statements, e.g., "I can identify properties of shapes" for US or "I can describe number patterns" for AUS).`
        }
        
        **Development Goals**:
        - Always include "developmentGoals" with at least two goals, each with a "name" and a detailed "description" tailored to the subject, theme, grade level, and ${curriculum} curriculum to support student growth (e.g., cognitive, social-emotional, or physical development).
        
        **DRDP Domains (Preschool Only, US Curriculum)**:
        - If gradeLevel is "PRESCHOOL" and curriculum is "US", automatically generate "drdpDomains" based on the activities and development goals. Use these DRDP domains:
          - ATL-REG (Approaches to Learning–Self-Regulation)
          - SED (Social and Emotional Development)
          - LLD (Language and Literacy Development)
          - COG (Cognition, including Math and Science)
          - PD-HLTH (Physical Development–Health)
        - Map activities to DRDP domains as follows:
          - STORYTELLING: LLD, SED
          - CRAFT: COG, PD-HLTH
          - MOVEMENT: PD-HLTH, ATL-REG
          - MUSIC: LLD, SED
          - FREE_PLAY: SED, ATL-REG
          - OUTDOOR: COG, PD-HLTH, LLD, SED
          - For custom activity types, map to relevant domains based on activity description or default to COG and SED.
        - Ensure each domain includes a "code", "name", "description" (tailored to the activities), and a "strategies" array with at least two specific strategies to support development in that domain.
        
        **Standards (if provided)**:
        - If a standards framework is provided (e.g., ${
          standardsFramework || "none"
        }), align the lesson plan with the specified standards: ${
      standards.length > 0 ? standards.map((s) => s.code).join(", ") : "none"
    }.
        - For US curriculum, use standards like "CCSS.MATH.CONTENT.2.OA.A.1" or NGSS codes.
        - For Australian curriculum, use ACARA codes like "AC9M4N01".
        - Include a "standards" array with each standard having a "code" (e.g., ${
          curriculum === "US" ? '"CCSS.MATH.CONTENT.2.OA.A.1"' : '"AC9M4N01"'
        }), a "description" (e.g., ${
      curriculum === "US"
        ? '"Use addition and subtraction within 100 to solve one- and two-step word problems"'
        : '"Recognise, represent and order numbers to at least tens of thousands"'
    }), and a "source" object with "name" (e.g., ${
      curriculum === "US" ? '"Common Core"' : '"ACARA"'
    }) and "url" (e.g., ${
      curriculum === "US"
        ? '"http://www.corestandards.org/Math/Content/2/OA/"'
        : '"https://www.australiancurriculum.edu.au"'
    }).
        - Ensure activities and success criteria align with these standards.
        
        **Source Metadata and Citation Score**:
        - Include a "sourceMetadata" array containing all provided sources (or default sources if none provided). Each source should have:
          - "name": string
          - "url": string
          - "description": string
        - Include a "citationScore" (0-100) indicating the reliability of the sources used, based on their authority (e.g., 90 for Common Core, 90 for NGSS, 90 for ACARA, 85 for Khan Academy, 80 for NSTA, 85 for Scootle). Calculate the citation score as an average of the scores of all sources used (assume provided sources have a score of 85 unless they match known sources).
        
        **Tags**:
        - Include a "tags" array with 3-5 relevant tags (e.g., "ENGAGING", "HANDS_ON", "COLLABORATIVE") based on the activities and subject.
        
        Ensure the JSON is strictly in this format:
        
        {
          "lessonPlan": {
            "title": string,
            "gradeLevel": string,
            "subject": string,
            "theme": string | null,
            "status": string,
            "duration": number,
            "classroomSize": number,
            "curriculum": string,
            "learningIntention": string,
            "successCriteria": string[],
            "activities": [
              {
                "title": string,
                "activityType": string,
                "description": string,
                "durationMins": number,
                "source": {
                  "name": string,
                  "url": string,
                  "description": string
                },
                "engagementScore": number,
                "alignmentScore": number,
                "feasibilityScore": number
              }
            ],
            "alternateActivities": {
              ${
                activityTypes.length > 0
                  ? `"${activityTypes.join('", "')}"`
                  : '"GENERIC"'
              }: [
                {
                  "title": string,
                  "activityType": string,
                  "description": string,
                  "durationMins": number,
                  "source": {
                    "name": string,
                    "url": string,
                    "description": string
                  },
                  "engagementScore": number,
                  "alignmentScore": number,
                  "feasibilityScore": number
                }
              ]
            },
            "supplies": [
              {
                "name": string,
                "quantity": number,
                "unit": string,
                "note": string | null
              }
            ],
            "developmentGoals": [
              {
                "name": string,
                "description": string
              }
            ],
            "tags": string[],
            "drdpDomains": [
              {
                "code": string,
                "name": string,
                "description": string,
                "strategies": string[]
              }
            ],
            "standards": [
              {
                "code": string,
                "description": string,
                "source": {
                  "name": string,
                  "url": string,
                  "description": string
                }
              }
            ],
            "sourceMetadata": [
              {
                "name": string,
                "url": string,
                "description": string
              }
            ],
            "citationScore": number
          }
        }
        
        Only output a valid JSON object. No markdown or extra text.
        `;

    let parsed: OpenAIResponse | null = null;
    let missingActivityTypes: string[] = [];
    const maxRetries = 3;
    let retryCount = 0;

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
        typeof lesson.status !== "string" ||
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

    const lesson = parsed.lessonPlan;

    const activitiesWithSources: Activity[] = (lesson.activities ?? []).map(
      (activity, index) => {
        const sourceIndex = index % sources.length;
        const source = activity.source ?? sources[sourceIndex];
        return {
          title: activity.title ?? `Activity ${index + 1}`,
          activityType:
            activity.activityType ??
            (activityTypes.length > 0
              ? activityTypes[index % activityTypes.length]
              : "GENERIC"),
          description: activity.description ?? "",
          durationMins: parseInt(
            activity.durationMins?.toString().replace("minutes", "").trim() ??
              `${Math.floor(durationNum / (activityTypes.length || 2))}`,
            10
          ),
          source: {
            name: source.name ?? "Unknown Source",
            url: source.url ?? "https://www.example.com",
            description:
              source.description ?? "Source used for activity inspiration",
          },
          engagementScore: activity.engagementScore ?? 80,
          alignmentScore: activity.alignmentScore ?? 80,
          feasibilityScore: activity.feasibilityScore ?? 80,
        };
      }
    );

    if (activitiesWithSources.length === 0) {
      const sourceIndex = 0;
      activitiesWithSources.push({
        title: `Default Activity`,
        activityType: defaultActivityTypes[0] ?? "GENERIC",
        description: `A default activity aligned with ${subject?.toLowerCase()}${
          theme ? ` and ${theme.toLowerCase()} theme` : ""
        } in the ${curriculum} curriculum.`,
        durationMins: durationNum,
        source: sources[sourceIndex],
        engagementScore: 70,
        alignmentScore: 70,
        feasibilityScore: 70,
      });
    }

    const alternateActivities: {
      [key: string]: (Partial<Activity> & { source?: Source })[];
    } = lesson.alternateActivities ?? {};
    const formattedAlternateActivities: AlternateActivityGroup[] =
      defaultActivityTypes.map((type) => {
        const activities = (alternateActivities[type] ?? []).map(
          (activity, index) => {
            const sourceIndex =
              (activitiesWithSources.length + index) % sources.length;
            const source = activity.source ?? sources[sourceIndex];
            return {
              title:
                activity.title ?? `Alternate ${type} Activity ${index + 1}`,
              activityType: type,
              description: activity.description ?? "",
              durationMins: parseInt(
                activity.durationMins
                  ?.toString()
                  .replace("minutes", "")
                  .trim() ??
                  `${Math.floor(
                    durationNum / (defaultActivityTypes.length || 2)
                  )}`,
                10
              ),
              source: {
                name: source.name ?? "Unknown Source",
                url: source.url ?? "https://www.example.com",
                description:
                  source.description ?? "Source used for activity inspiration",
              },
              engagementScore: activity.engagementScore ?? 75,
              alignmentScore: activity.alignmentScore ?? 75,
              feasibilityScore: activity.feasibilityScore ?? 75,
            };
          }
        );
        return {
          activityType: type,
          activities,
        };
      });

    if (activityTypes.length > 0 && missingActivityTypes.length > 0) {
      console.warn(
        "Fallback: Adding placeholder activities for missing types:",
        missingActivityTypes.join(", ")
      );
      missingActivityTypes.forEach((type) => {
        const sourceIndex = activitiesWithSources.length % sources.length;
        activitiesWithSources.push({
          title: `Placeholder ${type} Activity`,
          activityType: type,
          description: `A ${type.toLowerCase()} activity aligned with ${subject?.toLowerCase()}${
            theme ? ` and ${theme.toLowerCase()} theme` : ""
          } in the ${curriculum} curriculum.`,
          durationMins: Math.floor(durationNum / (activityTypes.length || 1)),
          source: sources[sourceIndex],
          engagementScore: 70,
          alignmentScore: 70,
          feasibilityScore: 70,
        });

        const alternateGroup: AlternateActivityGroup = {
          activityType: type,
          activities: [
            {
              title: `Alternate Placeholder ${type} Activity 1`,
              activityType: type,
              description: `An alternate ${type.toLowerCase()} activity aligned with ${subject?.toLowerCase()}${
                theme ? ` and ${theme.toLowerCase()} theme` : ""
              } in the ${curriculum} curriculum.`,
              durationMins: Math.floor(
                durationNum / (activityTypes.length || 1)
              ),
              source: sources[(sourceIndex + 1) % sources.length],
              engagementScore: 65,
              alignmentScore: 65,
              feasibilityScore: 65,
            },
            {
              title: `Alternate Placeholder ${type} Activity 2`,
              activityType: type,
              description: `Another alternate ${type.toLowerCase()} activity aligned with ${subject?.toLowerCase()}${
                theme ? ` and ${theme.toLowerCase()} theme` : ""
              } in the ${curriculum} curriculum.`,
              durationMins: Math.floor(
                durationNum / (activityTypes.length || 1)
              ),
              source: sources[(sourceIndex + 2) % sources.length],
              engagementScore: 60,
              alignmentScore: 60,
              feasibilityScore: 60,
            },
          ],
        };
        formattedAlternateActivities.push(alternateGroup);
      });
    }

    const totalActivityDuration = activitiesWithSources.reduce(
      (sum, activity) => sum + activity.durationMins,
      0
    );
    if (totalActivityDuration !== durationNum) {
      const scalingFactor = durationNum / totalActivityDuration;
      activitiesWithSources.forEach((activity) => {
        activity.durationMins = Math.round(
          activity.durationMins * scalingFactor
        );
      });
      const finalTotal = activitiesWithSources.reduce(
        (sum, activity) => sum + activity.durationMins,
        0
      );
      if (finalTotal !== durationNum && activitiesWithSources.length > 0) {
        activitiesWithSources[activitiesWithSources.length - 1].durationMins +=
          durationNum - finalTotal;
      }
    }

    const sourceScores: { [key: string]: number } = {
      "Common Core": 90,
      NGSS: 90,
      ACARA: 90,
      "Khan Academy": 85,
      NSTA: 80,
      Scootle: 85,
    };
    const usedSources = [
      ...new Set(
        [
          ...activitiesWithSources.map((a) => a?.source?.name),
          ...formattedAlternateActivities
            .flatMap((group) => group.activities)
            .map((a) => a?.source?.name),
          ...(lesson.sourceMetadata?.map((s) => s.name) ?? []),
          ...(lesson.standards?.map((s) => s?.source?.name) ?? []),
        ].filter((name): name is string => !!name)
      ),
    ];
    const citationScore =
      usedSources.length > 0
        ? Math.round(
            usedSources
              .map((name) => sourceScores[name] ?? 85)
              .reduce((sum, score) => sum + score, 0) / usedSources.length
          )
        : 80;

    const lessonPlan: LessonPlan = {
      title: lesson.title ?? title,
      gradeLevel: lesson.gradeLevel ?? gradeLevel,
      subject: normalizedSubject,
      theme: lesson.theme === "" ? null : lesson.theme ?? theme,
      duration: parseInt(
        lesson.duration?.toString().replace("minutes", "").trim() ??
          `${durationNum}`,
        10
      ),
      classroomSize: lesson.classroomSize ?? classroomSizeNum,
      curriculum: curriculum,
      learningIntention:
        (lesson.learningIntention ?? learningIntention) ||
        `To learn key concepts of ${subject?.toLowerCase()} in the ${curriculum} curriculum`,
      successCriteria:
        lesson.successCriteria ??
        (successCriteria.length > 0
          ? successCriteria
          : [
              `I can demonstrate understanding of ${subject?.toLowerCase()}`,
              `I can apply ${subject?.toLowerCase()} concepts in activities`,
              `I can collaborate effectively in class`,
            ]),
      activities: activitiesWithSources,
      alternateActivities: formattedAlternateActivities,
      supplies: (lesson.supplies ?? []).map((supply) =>
        typeof supply === "string"
          ? {
              name: supply,
              quantity: classroomSizeNum,
              unit: "unit",
              note: null,
            }
          : {
              name: supply.name ?? "Unnamed Supply",
              quantity: supply.quantity ?? classroomSizeNum,
              unit: supply.unit ?? "unit",
              note: supply.note ?? null,
            }
      ),
      tags: lesson.tags ?? ["ENGAGING", "HANDS_ON", "COLLABORATIVE"],
      developmentGoals: lesson.developmentGoals ?? [
        {
          name: "Cognitive Development",
          description: `Enhance problem-solving and critical thinking in the ${curriculum} curriculum`,
        },
        {
          name: "Social Development",
          description: "Foster collaboration and communication skills",
        },
      ],
      drdpDomains:
        lesson.drdpDomains && gradeLevel === "PRESCHOOL" && curriculum === "US"
          ? lesson.drdpDomains.map((domain) => ({
              code: domain.code ?? "UNKNOWN",
              name: domain.name ?? "Unknown Domain",
              description: domain.description ?? "",
              strategies: domain.strategies ?? [],
            }))
          : [],
      standards: standards.map((standard) => ({
        code: standard.code ?? "UNKNOWN",
        description: standard.description ?? "",
        source: standard.source
          ? {
              name:
                standard.source.name ??
                (curriculum === "US" ? "Common Core" : "ACARA"),
              url:
                standard.source.url ??
                (curriculum === "US"
                  ? "http://www.corestandards.org"
                  : "https://www.australiancurriculum.edu.au"),
              description:
                standard.source.description ??
                `Source used for standards alignment in ${curriculum} curriculum`,
            }
          : {
              name: curriculum === "US" ? "Common Core" : "ACARA",
              url:
                curriculum === "US"
                  ? "http://www.corestandards.org"
                  : "https://www.australiancurriculum.edu.au",
              description: `Source used for standards alignment in ${curriculum} curriculum`,
            },
      })),
      sourceMetadata: lesson.sourceMetadata ?? sources,
      citationScore: lesson.citationScore ?? citationScore,
    };

    const newLessonPlans = await db
      .insert(lessonPlans)
      .values([
        {
          title: lessonPlan.title,
          age_group: lessonPlan.gradeLevel,
          subject: lessonPlan.subject,
          theme: lessonPlan.theme,
          status: lessonPlan.status,
          created_at: new Date(),
          created_by_id: user.id,
          curriculum: lessonPlan.curriculum,
          duration: lessonPlan.duration,
          classroom_size: lessonPlan.classroomSize,
          learning_intention: lessonPlan.learningIntention,
          success_criteria: lessonPlan.successCriteria,
          standards: lessonPlan.standards,
          drdp_domains: lessonPlan.drdpDomains,
          source_metadata: lessonPlan.sourceMetadata,
          citation_score: lessonPlan.citationScore,
          alternate_activities: lessonPlan.alternateActivities,
          supplies: lessonPlan.supplies,
          tags: lessonPlan.tags,
        } as LessonPlanInsert,
      ])
      .returning();

    if (!newLessonPlans.length) {
      throw new Error("Failed to insert lesson plan into database");
    }

    const newLessonPlan: LessonPlanDB = newLessonPlans[0];

    if (scheduledDate) {
      const start = new Date(scheduledDate);
      const end = new Date(start.getTime() + lessonPlan.duration * 60 * 1000);
      await db.insert(schedules).values({
        userId: user.id,
        lessonPlanId: newLessonPlan.id,
        date: start,
        startTime: start,
        endTime: end,
      });
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
