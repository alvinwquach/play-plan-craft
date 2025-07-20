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
  gradeLevel: string;
  subject: string;
  theme: string | null;
  status: string;
  duration: number;
  classroomSize: number;
  activities: Activity[];
  supplies: Supply[];
  tags: string[];
  developmentGoals: DevelopmentGoal[];
}

interface OpenAIResponse {
  lessonPlan: Partial<LessonPlan> & {
    activities?: Partial<Activity>[];
    supplies?: (string | Partial<Supply>)[];
    requiredSupplies?: (string | Partial<Supply>)[];
    developmentGoals?: DevelopmentGoal[];
    tags?: string[];
  };
}

export async function POST(request: Request) {
  try {
    const {
      gradeLevel,
      subject,
      theme,
      duration,
      activityTypes,
      classroomSize,
    } = await request.json();

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

    const validSubjects = {
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
    };

    const validThemes = {
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
    };

    const validActivityTypes = {
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
    };

    let allowedSubjects: string[];
    let allowedThemes: string[];
    let allowedActivityTypes: string[];

    if (earlyGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects.early;
      allowedThemes = validThemes.early;
      allowedActivityTypes = validActivityTypes.early;
    } else if (elementaryGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects.elementary;
      allowedThemes = validThemes.elementary;
      allowedActivityTypes = validActivityTypes.elementary;
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects.middle;
      allowedThemes = validThemes.middle;
      allowedActivityTypes = validActivityTypes.middle;
    } else if (highSchoolGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects.high;
      allowedThemes = validThemes.high;
      allowedActivityTypes = validActivityTypes.high;
    } else {
      return NextResponse.json(
        { success: false, error: `Invalid gradeLevel: ${gradeLevel}` },
        { status: 400 }
      );
    }

    if (!validGradeLevels.includes(gradeLevel)) {
      return NextResponse.json(
        { success: false, error: `Invalid gradeLevel: ${gradeLevel}` },
        { status: 400 }
      );
    }
    if (!allowedSubjects.includes(subject)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid subject for ${gradeLevel}: ${subject}`,
        },
        { status: 400 }
      );
    }
    if (theme && !allowedThemes.includes(theme)) {
      return NextResponse.json(
        { success: false, error: `Invalid theme for ${gradeLevel}: ${theme}` },
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
      !activityTypes.every((type: string) =>
        allowedActivityTypes.includes(type)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid activity types for ${gradeLevel}: ${activityTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }
    if (
      typeof classroomSize !== "number" ||
      classroomSize < 1 ||
      classroomSize > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid classroom size: ${classroomSize}. Must be between 1 and 100.`,
        },
        { status: 400 }
      );
    }

    const prompt = `
You are a lesson planner AI. Generate a structured JSON response.

Create a ${duration}-minute lesson plan for ${gradeLevel.toLowerCase()} students focusing on ${subject.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    } for a classroom of ${classroomSize} students.

Use these activity types: ${activityTypes.join(", ")}.

Adjust the quantities of supplies to be appropriate for ${classroomSize} students. For example, for craft activities, provide enough materials for each student, and for shared items like books or tools, provide a reasonable number for group use.

Ensure the JSON is strictly in this format:

{
  "lessonPlan": {
    "title": string,
    "gradeLevel": "${gradeLevel}",
    "subject": "${subject}",
    "theme": "${theme || null}",
    "status": "DRAFT",
    "duration": ${duration},
    "classroomSize": ${classroomSize},
    "activities": [
      {
        "title": string,
        "activityType": string,
        "description": string,
        "durationMins": number
      }
    ],
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
    "tags": [string]
  }
}

Only output a valid JSON object. No markdown or extra text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    let parsed: OpenAIResponse;
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
      typeof lesson.gradeLevel !== "string" ||
      typeof lesson.subject !== "string" ||
      typeof lesson.status !== "string" ||
      typeof lesson.classroomSize !== "number"
    ) {
      throw new Error("Incomplete lesson plan response");
    }

    const lessonPlan: LessonPlan = {
      title: lesson.title ?? "Untitled Lesson",
      gradeLevel: lesson.gradeLevel ?? gradeLevel,
      subject: lesson.subject ?? subject,
      theme: lesson.theme ?? theme ?? null,
      status: lesson.status ?? "DRAFT",
      duration: parseInt(
        lesson.duration?.toString().replace("minutes", "").trim() ?? "0",
        10
      ),
      classroomSize: lesson.classroomSize ?? classroomSize,
      activities: (lesson.activities ?? []).map((activity) => ({
        title: activity.title ?? "Untitled Activity",
        activityType: activity.activityType ?? "UNKNOWN",
        description: activity.description ?? "",
        durationMins: parseInt(
          activity.durationMins?.toString().replace("minutes", "").trim() ??
            "0",
          10
        ),
      })),
      supplies: (lesson.supplies ?? lesson.requiredSupplies ?? []).map(
        (supply) =>
          typeof supply === "string"
            ? {
                name: supply,
                quantity: classroomSize,
                unit: "unit",
                note: null,
              }
            : {
                name: supply.name ?? "Unnamed Supply",
                quantity: supply.quantity ?? classroomSize,
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