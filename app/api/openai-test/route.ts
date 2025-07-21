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
  engagementScore?: number;
  alignmentScore?: number;
  feasibilityScore?: number;
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
  alternateActivities?: { [activityType: string]: Activity[] };
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
    alternateActivities?: {
      [activityType: string]: (Partial<Activity> & { source?: Source })[];
    };
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
     !activityTypes.every((type: string) => allowedActivityTypes.includes(type))
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

**Activity Requirements**:
- Use the provided activity types: ${activityTypes.join(", ")}.
- For each activity type, generate **2-3 activity ideas** and select the **best one** to include in the "activities" array, based on:
 - Engagement: Score (0-100) based on how engaging the activity is for ${gradeLevel.toLowerCase()} students.
 - Alignment: Score (0-100) based on alignment with the subject (${subject.toLowerCase()})${
     theme ? ` and theme (${theme.toLowerCase()})` : ""
   }.
 - Feasibility: Score (0-100) based on practicality for a classroom of ${classroomSize} students and the given duration.
- Include the selected activity's "engagementScore", "alignmentScore", and "feasibilityScore" in the response.
- Include the non-selected activity ideas in an "alternateActivities" object, keyed by activity type, with their respective scores.
- Ensure **at least one activity per provided activity type** is included in the "activities" array.
- Distribute the total duration (${duration} minutes) across the activities in the "activities" array, ensuring the sum of activity durations approximately equals the total lesson duration.
- Each activity (in both "activities" and "alternateActivities") must include a detailed description with clear steps or instructions tailored to the grade level and subject.
- For each activity, assign a trusted source from the following list of preferred sources: ${JSON.stringify(
     sources
   )}. Cycle through the provided sources to assign one to each activity. Each activity must have a "source" object with:
 - "name": string (e.g., "Khan Academy")
 - "url": string (e.g., "https://www.khanacademy.org")
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
       : 'Include a "Learning Intention" (a clear statement of what students will learn, aligned with the subject and grade level).'
   }
- ${
     successCriteria && successCriteria.length > 0
       ? `Use these success criteria: ${successCriteria
           .map((c: string) => `"${c}"`)
           .join(", ")}.`
       : 'Include "Success Criteria" (a list of 3-5 measurable outcomes starting with "I can" statements, e.g., "I can identify properties of shapes").'
   }

**Development Goals**:
- Always include "developmentGoals" with at least two goals, each with a "name" and a detailed "description" tailored to the subject, theme, and grade level to support student growth (e.g., cognitive, social-emotional, or physical development).

**DRDP Domains (Preschool Only)**:
- If gradeLevel is "PRESCHOOL", automatically generate "drdpDomains" based on the activities and development goals. Use these DRDP domains:
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
- Include a "standards" array with each standard having a "code" (e.g., "CCSS.MATH.CONTENT.2.OA.A.1"), a "description" (e.g., "Use addition and subtraction within 100 to solve one- and two-step word problems"), and a "source" object with "name" (e.g., "Common Core") and "url" (e.g., "http://www.corestandards.org/Math/Content/2/OA/").
- Ensure activities and success criteria align with these standards.

**Source Metadata and Citation Score**:
- Include a "sourceMetadata" array containing all provided sources (or default sources if none provided). Each source should have:
 - "name": string
 - "url": string
 - "description": string
- Include a "citationScore" (0-100) indicating the reliability of the sources used, based on their authority (e.g., 90 for Common Core, 90 for NGSS, 85 for Khan Academy, 80 for NSTA). Calculate the citation score as an average of the scores of all sources used (assume provided sources have a score of 85 unless they match Common Core or NGSS).

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
     formattedAlternateActivities[type] = (alternateActivities[type] ?? []).map(
       (activity, index) => {
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
       }
     );
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
         }.`,
         durationMins: Math.floor(duration / activityTypes.length),
         source: sources[sourceIndex],
         engagementScore: 70,
         alignmentScore: 70,
         feasibilityScore: 70,
       });
       // Add placeholder alternate activities
       formattedAlternateActivities[type] = [
         {
           title: `Alternate Placeholder ${type} Activity 1`,
           activityType: type,
           description: `An alternate ${type.toLowerCase()} activity aligned with ${subject.toLowerCase()}${
             theme ? ` and ${theme.toLowerCase()} theme` : ""
           }.`,
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
           }.`,
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
     "Khan Academy": 85,
     NSTA: 80,
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
     learningIntention:
       lesson.learningIntention ??
       learningIntention ??
       "To learn key concepts of the subject",
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
       source: standard.source
         ? {
             name: standard.source.name ?? "Unknown Source",
             url: standard.source.url ?? "https://www.example.com",
             description:
               standard.source.description ??
               "Source used for standards alignment",
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