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
    const { ageGroup, subject, theme, duration, activityTypes } =
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
You are a lesson planner AI. Generate a structured JSON response.

Create a ${duration}-minute lesson plan for ${ageGroup.toLowerCase()} children focusing on ${subject.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    }.

Use these activity types: ${activityTypes.join(", ")}.

Ensure the JSON is strictly in this format:

{
  "lessonPlan": {
    "title": string,
    "ageGroup": "${ageGroup}",
    "subject": "${subject}",
    "theme": "${theme || null}",
    "status": "DRAFT",
    "duration": ${duration},
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

    console.log("OpenAI raw response content:", content);

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
      typeof lesson.ageGroup !== "string" ||
      typeof lesson.subject !== "string" ||
      typeof lesson.status !== "string"
    ) {
      throw new Error("Incomplete lesson plan response");
    }

    const lessonPlan: LessonPlan = {
      title: lesson.title ?? "Untitled Lesson",
      ageGroup: lesson.ageGroup ?? ageGroup,
      subject: lesson.subject ?? subject,
      theme: lesson.theme ?? theme ?? null,
      status: lesson.status ?? "DRAFT",
      duration: parseInt(
        lesson.duration?.toString().replace("minutes", "").trim() ?? "0",
        10
      ),
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
