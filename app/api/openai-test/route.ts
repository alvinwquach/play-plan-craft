import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Source {
  name: string;
  url: string;
  description: string;
}

interface Activity {
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
  source: Source;
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

interface DrdpDomain {
  code: string;
  name: string;
  description: string;
  strategies: string[];
}

interface Standard {
  code: string;
  description: string;
  source?: Source;
}

interface SourceMetadata {
  name: string;
  url: string;
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
  learningIntention: string;
  successCriteria: string[];
  drdpDomains?: DrdpDomain[];
  standards?: Standard[];
  sourceMetadata?: SourceMetadata[];
  citationScore?: number;
}

interface OpenAIResponse {
  lessonPlan: Partial<LessonPlan> & {
    activities?: (Partial<Activity> & { source?: Source })[];
    supplies?: (string | Partial<Supply>)[];
    requiredSupplies?: (string | Partial<Supply>)[];
    developmentGoals?: DevelopmentGoal[];
    tags?: string[];
    learningIntention?: string;
    successCriteria?: string[];
    drdpDomains?: DrdpDomain[];
    standards?: (Standard & { source?: Source })[];
    sourceMetadata?: SourceMetadata[];
    citationScore?: number;
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
      learningIntention,
      successCriteria,
      standardsFramework,
      standards,
      preferredSources,
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

    const validStandardsFrameworks = ["COMMON_CORE", "NGSS", "STATE_SPECIFIC"];
    if (
      standardsFramework &&
      !validStandardsFrameworks.includes(standardsFramework)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid standards framework: ${standardsFramework}`,
        },
        { status: 400 }
      );
    }
    if (
      standardsFramework &&
      (!Array.isArray(standards) || standards.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Standards must be provided when a standards framework is selected.",
        },
        { status: 400 }
      );
    }

    // Default sources if none provided
    const defaultSources: Source[] = [
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
    ];

    const sources =
      Array.isArray(preferredSources) && preferredSources.length > 0
        ? preferredSources
        : defaultSources;

    const prompt = `
You are an AI lesson planner. Generate a structured JSON response.

Create a ${duration}-minute lesson plan for ${gradeLevel.toLowerCase()} students focusing on ${subject.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    } for a classroom of ${classroomSize} students.

Use these activity types: ${activityTypes.join(", ")}.
${
  learningIntention
    ? `Use this learning intention: "${learningIntention}".`
    : 'Generate a "Learning Intention" (a clear statement of what students will learn).'
}
${
  successCriteria && successCriteria.length > 0
    ? `Use these success criteria: ${successCriteria
        .map((c: string) => `"${c}"`)
        .join(", ")}.`
    : 'Generate "Success Criteria" (a list of measurable outcomes starting with "I can" statements, e.g., "I can identify properties of shapes").'
}

Adjust the quantities of supplies to be appropriate for ${classroomSize} students. For example, for craft activities, provide enough materials for each student, and for shared items like books or tools, provide a reasonable number for group use.

Always include "developmentGoals" with at least two goals, each with a "name" and a detailed "description" tailored to the subject, theme, and grade level to support student growth (e.g., cognitive, social-emotional, or physical development).

If gradeLevel is "PRESCHOOL", automatically generate "drdpDomains" based on the activities and development goals. Use these DRDP domains:
- ATL-REG (Approaches to Learning–Self-Regulation)
- SED (Social and Emotional Development)
- LLD (Language and Literacy Development)
- COG (Cognition, including Math and Science)
- PD-HLTH (Physical Development–Health)

Map activities to DRDP domains as follows:
- STORYTELLING: LLD, SED
- CRAFT: COG, PD-HLTH
- MOVEMENT: PD-HLTH, ATL-REG
- MUSIC: LLD, SED
- FREE_PLAY: SED, ATL-REG
- OUTDOOR (e.g., Chalk Art): COG, PD-HLTH, LLD, SED
- Ensure each domain includes a "code", "name", "description" (tailored to the activities), and a "strategies" array with at least two specific strategies to support development in that domain.

For all other grade levels, include "drdpDomains" only if relevant, with generic developmental strategies if applicable.

If a standards framework is provided (e.g., ${
      standardsFramework || "none"
    }), align the lesson plan with the specified standards: ${
      standards?.join(", ") || "none"
    }. Include a "standards" array with each standard having a "code" (e.g., "CCSS.MATH.CONTENT.2.OA.A.1"), a "description" (e.g., "Use addition and subtraction within 100 to solve one- and two-step word problems"), and a "source" object with "name" (e.g., "Common Core") and "url" (e.g., "http://www.corestandards.org/Math/Content/2/OA/").

For each activity, assign a trusted source from the following list of preferred sources: ${JSON.stringify(
      sources
    )}. Cycle through the provided sources to assign one to each activity. If no preferred sources are provided, use default sources: ${JSON.stringify(
      defaultSources
    )}. Each activity must have a "source" object with:
- "name": string (e.g., "Khan Academy")
- "url": string (e.g., "https://www.khanacademy.org")
- "description": string (brief explanation of how the source was used, e.g., "Provided activity inspiration")

Include a "sourceMetadata" array containing all provided sources (or default sources if none provided). Each source should have:
- "name": string
- "url": string
- "description": string

Include a "citationScore" (0-100) indicating the reliability of the sources used, based on their authority (e.g., 90 for Common Core, 85 for Khan Academy, 80 for NSTA). Calculate the citation score as an average of the scores of all sources used (assume provided sources have a score of 85 unless they match Common Core or NGSS, which are 90).

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
    "learningIntention": string,
    "successCriteria": [string],
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
        }
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
    "tags": [string],
    "drdpDomains": [
      {
        "code": string,
        "name": string,
        "description": string,
        "strategies": [string]
      }
    ],
    "standards": [
      {
        "code": string,
        "description": string,
        "source": {
          "name": string,
          "url": string
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

    const activitiesWithSources = (lesson.activities ?? []).map(
      (activity, index) => {
        const sourceIndex = index % sources.length;
        const source = activity.source ?? sources[sourceIndex];
        return {
          title: activity.title ?? "Untitled Activity",
          activityType: activity.activityType ?? "UNKNOWN",
          description: activity.description ?? "",
          durationMins: parseInt(
            activity.durationMins?.toString().replace("minutes", "").trim() ??
              "0",
            10
          ),
          source: {
            name: source.name ?? "Unknown Source",
            url: source.url ?? "https://www.example.com",
            description:
              source.description ?? "Source used for activity inspiration",
          },
        };
      }
    );

    const sourceScores: { [key: string]: number } = {
      "Common Core": 90,
      NGSS: 90,
      "Khan Academy": 85,
      NSTA: 80,
    };
    const usedSources = [
      ...new Set(
        [
          ...activitiesWithSources.map((a) => a.source.name),
          ...(lesson.sourceMetadata?.map((s) => s.name) ?? []),
          ...(lesson.standards
            ?.map((s) => s.source?.name)
            .filter((name): name is string => !!name) ?? []),
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
      learningIntention:
        lesson.learningIntention ??
        learningIntention ??
        "To learn key concepts of the subject",
      successCriteria: lesson.successCriteria ??
        successCriteria ?? ["I can demonstrate understanding of the lesson"],
      activities: activitiesWithSources,
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
        {
          name: "Social Development",
          description: "Foster collaboration and communication skills",
        },
      ],
      drdpDomains:
        lesson.drdpDomains && gradeLevel === "PRESCHOOL"
          ? lesson.drdpDomains
          : [],
      standards: (lesson.standards ?? []).map((standard) => ({
        code: standard.code ?? "UNKNOWN",
        description: standard.description ?? "",
        source: standard.source ?? undefined,
      })),
      sourceMetadata: lesson.sourceMetadata ?? sources,
      citationScore: lesson.citationScore ?? citationScore,
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