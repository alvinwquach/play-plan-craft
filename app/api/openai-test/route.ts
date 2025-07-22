import {
  Activity,
  Curriculum,
  LessonPlan,
  OpenAIResponse,
  Source,
} from "@/app/types/lessonPlan";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      curriculum,
    } = await request.json();

    const validCurriculums = ["US", "AUS"];
    if (!validCurriculums.includes(curriculum)) {
      return NextResponse.json(
        { success: false, error: `Invalid curriculum: ${curriculum}` },
        { status: 400 }
      );
    }

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

    const validThemes = {
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

    const validActivityTypes = {
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

    let allowedSubjects: string[];
    let allowedThemes: string[];
    let allowedActivityTypes: string[];

    if (earlyGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects[curriculum as Curriculum].early;
      allowedThemes = validThemes[curriculum as Curriculum].early;
      allowedActivityTypes = validActivityTypes[curriculum as Curriculum].early;
    } else if (elementaryGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects[curriculum as Curriculum].elementary;
      allowedThemes = validThemes[curriculum as Curriculum].elementary;
      allowedActivityTypes =
        validActivityTypes[curriculum as Curriculum].elementary;
    } else if (middleSchoolGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects[curriculum as Curriculum].middle;
      allowedThemes = validThemes[curriculum as Curriculum].middle;
      allowedActivityTypes =
        validActivityTypes[curriculum as Curriculum].middle;
    } else if (highSchoolGrades.includes(gradeLevel)) {
      allowedSubjects = validSubjects[curriculum as Curriculum].high;
      allowedThemes = validThemes[curriculum as Curriculum].high;
      allowedActivityTypes = validActivityTypes[curriculum as Curriculum].high;
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
          error: `Invalid subject for ${gradeLevel} in ${curriculum} curriculum: ${subject}`,
        },
        { status: 400 }
      );
    }
    if (theme && !allowedThemes.includes(theme)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid theme for ${gradeLevel} in ${curriculum} curriculum: ${theme}`,
        },
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
          error: `Invalid activity types for ${gradeLevel} in ${curriculum} curriculum: ${activityTypes.join(
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

    const validStandardsFrameworks =
      curriculum === "US"
        ? ["COMMON_CORE", "NGSS", "STATE_SPECIFIC"]
        : ["ACARA"];
    if (
      standardsFramework &&
      !validStandardsFrameworks.includes(standardsFramework)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid standards framework for ${curriculum} curriculum: ${standardsFramework}`,
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

    const sources =
      Array.isArray(preferredSources) && preferredSources.length > 0
        ? preferredSources
        : defaultSources;

    const prompt = `
 You are an AI lesson planner for the ${curriculum} curriculum. Generate a structured JSON response.
 
 
 Create a ${duration}-minute lesson plan for ${gradeLevel.toLowerCase()} students focusing on ${subject.toLowerCase()}${
      theme ? ` with a ${theme.toLowerCase()} theme` : ""
    } for a classroom of ${classroomSize} students, aligned with the ${curriculum} curriculum.
 
 
 **Curriculum Details**:
 - Curriculum: ${curriculum}
 - For US curriculum, align with frameworks like Common Core or NGSS if specified.
 - For Australian curriculum, align with ACARA standards (e.g., AC9M4N01 for Mathematics Year 4).
 - Ensure activities, subjects, and themes are appropriate for the ${curriculum} curriculum.
 
 
 **Activity Requirements**:
 - Use the provided activity types: ${activityTypes.join(", ")}.
 - For each activity type, generate **2-3 activity ideas** and select the **best one** to include in the "activities" array, based on:
 - Engagement: Score (0-100) based on how engaging the activity is for ${gradeLevel.toLowerCase()} students.
 - Alignment: Score (0-100) based on alignment with the subject (${subject.toLowerCase()})${
      theme ? ` and theme (${theme.toLowerCase()})` : ""
    } and the ${curriculum} curriculum.
 - Feasibility: Score (0-100) based on practicality for a classroom of ${classroomSize} students and the given duration.
 - Include the selected activity's "engagementScore", "alignmentScore", and "feasibilityScore" in the response.
 - Include the non-selected activity ideas in an "alternateActivities" object, keyed by activity type, with their respective scores.
 - Ensure **at least one activity per provided activity type** is included in the "activities" array.
 - Distribute the total duration (${duration} minutes) across the activities in the "activities" array, ensuring the sum of activity durations approximately equals the total lesson duration.
 - Each activity (in both "activities" and "alternateActivities") must include a detailed description with clear steps or instructions tailored to the grade level, subject, and ${curriculum} curriculum.
 - For each activity, assign a trusted source from the following list of preferred sources: ${JSON.stringify(
   sources
 )}. Cycle through the provided sources to assign one to each activity. Each activity must have a "source" object with:
 - "name": string (e.g., "${curriculum === "US" ? "Khan Academy" : "ACARA"}")
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
   successCriteria && successCriteria.length > 0
     ? `Use these success criteria: ${successCriteria
         .map((c: string) => `"${c}"`)
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
 - OUTDOOR (e.g., Chalk Art): COG, PD-HLTH, LLD, SED
 - Ensure each domain includes a "code", "name", "description" (tailored to the activities), and a "strategies" array with at least two specific strategies to support development in that domain.
 
 
 **Standards (if provided)**:
 - If a standards framework is provided (e.g., ${
   standardsFramework || "none"
 }), align the lesson plan with the specified standards: ${
      standards?.join(", ") || "none"
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
 - Include a "citationScore" (0-100) indicating the reliability of the sources used, based on their authority (e.g., 90 for Common Core, 90 for NGSS, 90 for ACARA, 85 for Khan Academy, 80 for NSTA , 85 for Scootle). Calculate the citation score as an average of the scores of all sources used (assume provided sources have a score of 85 unless they match known sources).
 
 
 **Tags**:
 - Include a "tags" array with 3-5 relevant tags (e.g., "ENGAGING", "HANDS_ON", "COLLABORATIVE") based on the activities and subject.
 
 
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
 "curriculum": "${curriculum}",
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
 },
 "engagementScore": number,
 "alignmentScore": number,
 "feasibilityScore": number
 }
 ],
 "alternateActivities": {
 "${activityTypes.join('", "')}": [
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
                  )}. Ensure all requested activity types (${activityTypes.join(
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
    } while (retryCount < maxRetries);

    if (!parsed) {
      throw new Error("Failed to generate a valid lesson plan after retries");
    }

    const lesson = parsed.lessonPlan;

    const activitiesWithSources = (lesson.activities ?? []).map(
      (activity, index) => {
        const sourceIndex = index % sources.length;
        const source = activity.source ?? sources[sourceIndex];
        return {
          title: activity.title ?? "Untitled Activity",
          activityType: activity.activityType ?? activityTypes[0] ?? "UNKNOWN",
          description: activity.description ?? "",
          durationMins: parseInt(
            activity.durationMins?.toString().replace("minutes", "").trim() ??
              `${Math.floor(duration / activityTypes.length)}`,
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

    const alternateActivities = lesson.alternateActivities ?? {};
    const formattedAlternateActivities: { [key: string]: Activity[] } = {};
    activityTypes.forEach((type) => {
      formattedAlternateActivities[type] = (
        alternateActivities[type] ?? []
      ).map((activity, index) => {
        const sourceIndex =
          (activitiesWithSources.length + index) % sources.length;
        const source = activity.source ?? sources[sourceIndex];
        return {
          title: activity.title ?? `Alternate ${type} Activity ${index + 1}`,
          activityType: type,
          description: activity.description ?? "",
          durationMins: parseInt(
            activity.durationMins?.toString().replace("minutes", "").trim() ??
              `${Math.floor(duration / activityTypes.length)}`,
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
      });
    });

    if (missingActivityTypes.length > 0) {
      console.warn(
        "Fallback: Adding placeholder activities for missing types:",
        missingActivityTypes.join(", ")
      );
      missingActivityTypes.forEach((type) => {
        const sourceIndex = activitiesWithSources.length % sources.length;
        activitiesWithSources.push({
          title: `Placeholder ${type} Activity`,
          activityType: type,
          description: `A ${type.toLowerCase()} activity aligned with ${subject.toLowerCase()}${
            theme ? ` and ${theme.toLowerCase()} theme` : ""
          } in the ${curriculum} curriculum.`,
          durationMins: Math.floor(duration / activityTypes.length),
          source: sources[sourceIndex],
          engagementScore: 70,
          alignmentScore: 70,
          feasibilityScore: 70,
        });

        formattedAlternateActivities[type] = [
          {
            title: `Alternate Placeholder ${type} Activity 1`,
            activityType: type,
            description: `An alternate ${type.toLowerCase()} activity aligned with ${subject.toLowerCase()}${
              theme ? ` and ${theme.toLowerCase()} theme` : ""
            } in the ${curriculum} curriculum.`,
            durationMins: Math.floor(duration / activityTypes.length),
            source: sources[(sourceIndex + 1) % sources.length],
            engagementScore: 65,
            alignmentScore: 65,
            feasibilityScore: 65,
          },
          {
            title: `Alternate Placeholder ${type} Activity 2`,
            activityType: type,
            description: `Another alternate ${type.toLowerCase()} activity aligned with ${subject.toLowerCase()}${
              theme ? ` and ${theme.toLowerCase()} theme` : ""
            } in the ${curriculum} curriculum.`,
            durationMins: Math.floor(duration / activityTypes.length),
            source: sources[(sourceIndex + 2) % sources.length],
            engagementScore: 60,
            alignmentScore: 60,
            feasibilityScore: 60,
          },
        ];
      });
    }

    const totalActivityDuration = activitiesWithSources.reduce(
      (sum, activity) => sum + activity.durationMins,
      0
    );
    if (totalActivityDuration !== duration) {
      const scalingFactor = duration / totalActivityDuration;
      activitiesWithSources.forEach((activity) => {
        activity.durationMins = Math.round(
          activity.durationMins * scalingFactor
        );
      });
      const finalTotal = activitiesWithSources.reduce(
        (sum, activity) => sum + activity.durationMins,
        0
      );
      if (finalTotal !== duration && activitiesWithSources.length > 0) {
        activitiesWithSources[activitiesWithSources.length - 1].durationMins +=
          duration - finalTotal;
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
          ...activitiesWithSources.map((a) => a.source.name),
          ...Object.values(formattedAlternateActivities)
            .flat()
            .map((a) => a.source.name),
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
        lesson.duration?.toString().replace("minutes", "").trim() ??
          `${duration}`,
        10
      ),
      classroomSize: lesson.classroomSize ?? classroomSize,
      curriculum: curriculum,
      learningIntention:
        lesson.learningIntention ??
        learningIntention ??
        `To learn key concepts of ${subject.toLowerCase()} in the ${curriculum} curriculum`,
      successCriteria: lesson.successCriteria ??
        successCriteria ?? ["I can demonstrate understanding of the lesson"],
      activities: activitiesWithSources,
      alternateActivities: formattedAlternateActivities,
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
          ? lesson.drdpDomains
          : [],
      standards: (lesson.standards ?? []).map((standard) => ({
        code: standard.code ?? "UNKNOWN",
        description: standard.description ?? "",
        source: standard.source
          ? {
              name:
                standard.source.name ?? curriculum === "US"
                  ? "Common Core"
                  : "ACARA",
              url:
                standard.source.url ??
                (curriculum === "US"
                  ? "http://www.corestandards.org"
                  : "https://www.australiancurriculum.edu.au"),
              description:
                standard.source.description ??
                `Source used for standards alignment in ${curriculum} curriculum`,
            }
          : undefined,
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
