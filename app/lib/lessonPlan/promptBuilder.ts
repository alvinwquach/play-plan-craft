import { Curriculum, Source } from "@/app/types/lessonPlan";
import { getGradeCategory, validActivityTypes } from "./constants";

interface LessonContext {
  recentLessons: any[];
  similarLessons: any[];
}

interface PromptBuilderParams {
  lessonContext: LessonContext;
  curriculum: Curriculum;
  gradeLevel: string;
  subject: string;
  theme: string | null;
  duration: string;
  classroomSize: string;
  activityTypes: string[];
  learningIntention: string;
  successCriteria: string[];
  standardsFramework: string;
  standards: { code: string; description: string; source?: Source }[];
  sources: Source[];
}

export function buildLessonContextPrompt(
  lessonContext: LessonContext
): string {
  const { recentLessons, similarLessons } = lessonContext;

  if (recentLessons.length === 0 && similarLessons.length === 0) {
    return `
**FIRST LESSON**: This is the first lesson for this grade/subject combination. Focus on foundational concepts.
`;
  }

  return `
**PREVIOUS LESSONS CONTEXT** (Build upon these, don't repeat):

${
  recentLessons.length > 0
    ? `**Recent Lessons:**\n${recentLessons
        .map(
          (lesson, idx) => `
${idx + 1}. "${lesson.title}" (${new Date(lesson.created_at!).toLocaleDateString()})
   - Learning Intention: ${lesson.learning_intention || "N/A"}
   - Activities Used: ${lesson.activities.map((a: any) => `${a.title} (${a.type})`).join(", ") || "N/A"}
   - Success Criteria: ${lesson.success_criteria?.join("; ") || "N/A"}
`
        )
        .join("\n")}`
    : ""
}

${
  similarLessons.length > 0
    ? `**Similar Lessons (Avoid Repetition):**\n${similarLessons
        .map(
          (lesson: any, idx: number) => `
${idx + 1}. "${lesson.title}" (${(lesson.similarity * 100).toFixed(0)}% similar)
   - Learning Intention: ${lesson.learning_intention || "N/A"}
   - Success Criteria: ${lesson.success_criteria?.join("; ") || "N/A"}
`
        )
        .join("\n")}`
    : ""
}

**CRITICAL REQUIREMENTS**:
- Build upon concepts from previous lessons above
- DO NOT create lessons similar to those listed (especially ${similarLessons[0]?.title || "previous lessons"})
- Introduce NEW activities that progress from what students already learned
- Reference prior learning if relevant
- Ensure progression in difficulty and introduce new concepts
`;
}

export function buildLessonPlanPrompt(params: PromptBuilderParams): string {
  const {
    lessonContext,
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
  } = params;

  const gradeCategory = getGradeCategory(gradeLevel);
  const allowedActivityTypes = validActivityTypes[curriculum][gradeCategory];

  const contextPrompt = buildLessonContextPrompt(lessonContext);

  return `
        ${contextPrompt}

        You are an AI lesson planner for the ${curriculum} curriculum, designed to support educators from nurturing infants to managing high school projects. Generate a structured JSON response for a lesson plan tailored to the provided inputs.

        Create a ${duration}-minute lesson plan for ${gradeLevel} students focusing on ${subject?.toLowerCase()}${
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
}
