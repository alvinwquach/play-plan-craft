import {
  Activity,
  AlternateActivityGroup,
  Curriculum,
  LessonPlan,
  OpenAIResponse,
  Source,
  SourceMetadata,
  Standard,
  DrdpDomain,
  Supply,
} from "@/app/types/lessonPlan";
import { sourceScores, validActivityTypes, getGradeCategory } from "./constants";

interface ProcessResponseParams {
  parsed: OpenAIResponse;
  title: string;
  gradeLevel: string;
  subject: string;
  theme: string | null;
  duration: string;
  classroomSize: string;
  activityTypes: string[];
  learningIntention: string;
  successCriteria: string[];
  standards: { code: string; description: string; source?: Source }[];
  curriculum: Curriculum;
  sources: Source[];
  userId: string;
}

export function processActivitiesWithSources(
  activities: (Partial<Activity> & { source?: Source })[] = [],
  activityTypes: string[],
  duration: string,
  sources: Source[]
): Activity[] {
  const durationNum = parseInt(duration, 10);

  const activitiesWithSources: Activity[] = activities.map((activity, index) => {
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
  });

  return activitiesWithSources;
}

export function processAlternateActivities(
  alternateActivities: { [key: string]: (Partial<Activity> & { source?: Source })[] } = {},
  defaultActivityTypes: string[],
  activitiesWithSources: Activity[],
  duration: string,
  sources: Source[]
): AlternateActivityGroup[] {
  const durationNum = parseInt(duration, 10);

  return defaultActivityTypes.map((type) => {
    const activities = (alternateActivities[type] ?? []).map((activity, index) => {
      const sourceIndex = (activitiesWithSources.length + index) % sources.length;
      const source = activity.source ?? sources[sourceIndex];
      return {
        title: activity.title ?? `Alternate ${type} Activity ${index + 1}`,
        activityType: type,
        description: activity.description ?? "",
        durationMins: parseInt(
          activity.durationMins?.toString().replace("minutes", "").trim() ??
            `${Math.floor(durationNum / (defaultActivityTypes.length || 2))}`,
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
    return {
      activityType: type,
      activities,
    };
  });
}

export function addPlaceholderActivities(
  missingActivityTypes: string[],
  activitiesWithSources: Activity[],
  formattedAlternateActivities: AlternateActivityGroup[],
  subject: string,
  theme: string | null,
  duration: string,
  activityTypes: string[],
  curriculum: Curriculum,
  sources: Source[]
): void {
  const durationNum = parseInt(duration, 10);

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
          durationMins: Math.floor(durationNum / (activityTypes.length || 1)),
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
          durationMins: Math.floor(durationNum / (activityTypes.length || 1)),
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

export function normalizeActivityDurations(
  activitiesWithSources: Activity[],
  duration: string
): void {
  const durationNum = parseInt(duration, 10);
  const totalActivityDuration = activitiesWithSources.reduce(
    (sum, activity) => sum + activity.durationMins,
    0
  );

  if (totalActivityDuration !== durationNum) {
    const scalingFactor = durationNum / totalActivityDuration;
    activitiesWithSources.forEach((activity) => {
      activity.durationMins = Math.round(activity.durationMins * scalingFactor);
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
}

export function calculateCitationScore(
  activitiesWithSources: Activity[],
  formattedAlternateActivities: AlternateActivityGroup[],
  lesson: Partial<LessonPlan> & {
    sourceMetadata?: SourceMetadata[];
    standards?: Standard[];
  }
): number {
  const usedSources = [
    ...new Set(
      [
        ...activitiesWithSources.map((a) => a?.source?.name),
        ...formattedAlternateActivities
          .flatMap((group) => group.activities)
          .map((a) => a?.source?.name),
        ...(lesson.sourceMetadata?.map((s: SourceMetadata) => s.name) ?? []),
        ...(lesson.standards?.map((s: Standard) => s?.source?.name) ?? []),
      ].filter((name): name is string => !!name)
    ),
  ];

  return usedSources.length > 0
    ? Math.round(
        usedSources
          .map((name) => sourceScores[name] ?? 85)
          .reduce((sum, score) => sum + score, 0) / usedSources.length
      )
    : 80;
}

export function processLessonPlan(params: ProcessResponseParams): LessonPlan {
  const {
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
    userId,
  } = params;

  const lesson = parsed.lessonPlan;
  const durationNum = parseInt(duration, 10);
  const classroomSizeNum = parseInt(classroomSize, 10);

  const gradeCategory = getGradeCategory(gradeLevel);
  const allowedActivityTypes = validActivityTypes[curriculum][gradeCategory];
  const defaultActivityTypes =
    activityTypes.length === 0 ? allowedActivityTypes.slice(0, 2) : activityTypes;

  const activitiesWithSources = processActivitiesWithSources(
    lesson.activities,
    activityTypes,
    duration,
    sources
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

  const formattedAlternateActivities = processAlternateActivities(
    lesson.alternateActivities,
    defaultActivityTypes,
    activitiesWithSources,
    duration,
    sources
  );

  normalizeActivityDurations(activitiesWithSources, duration);

  const citationScore = calculateCitationScore(
    activitiesWithSources,
    formattedAlternateActivities,
    lesson
  );

  return {
    title: lesson.title ?? title,
    gradeLevel: gradeLevel,
    subject: subject,
    createdAt: lesson.createdAt,
    theme: lesson.theme === "" ? null : lesson.theme ?? theme,
    duration: parseInt(
      lesson.duration?.toString().replace("minutes", "").trim() ?? `${durationNum}`,
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
    supplies: (lesson.supplies ?? []).map((supply: string | Partial<Supply>) =>
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
        ? lesson.drdpDomains.map((domain: Partial<DrdpDomain>) => ({
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
    created_by_id: userId,
    createdBy: "",
  };
}
