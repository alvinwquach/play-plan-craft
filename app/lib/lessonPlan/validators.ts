import { Curriculum, Source } from "@/app/types/lessonPlan";
import {
  gradeLevelMap,
  validGradeLevels,
  subjectMap,
  validSubjectsList,
  themeMap,
  validThemesList,
  validCurriculums,
  getGradeCategory,
  validSubjects,
  validThemes,
  validActivityTypes,
  getValidStandardsFrameworks,
} from "./constants";

export interface FormDataInput {
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

export interface NormalizedData {
  title: string;
  gradeLevel: string;
  subject: string;
  theme: string | null;
  duration: string;
  activityTypes: string[];
  classroomSize: string;
  learningIntention: string;
  successCriteria: string[];
  standardsFramework: string;
  standards: { code: string; description: string; source?: Source }[];
  preferredSources: Source[];
  curriculum: Curriculum;
  scheduledDate: string | null | undefined;
}

export function normalizeGradeLevel(inputGradeLevel: string): string {
  const normalizedGradeLevel =
    gradeLevelMap[inputGradeLevel?.toLowerCase().trim()];
  if (
    !normalizedGradeLevel ||
    !validGradeLevels.includes(normalizedGradeLevel)
  ) {
    throw new Error(`Invalid gradeLevel: ${inputGradeLevel}`);
  }
  return normalizedGradeLevel;
}

export function normalizeSubject(inputSubject: string): string {
  const upperCaseSubject = inputSubject?.toString().trim().toUpperCase();
  const normalizedSubject = upperCaseSubject
    ? subjectMap[upperCaseSubject] ?? upperCaseSubject
    : undefined;
  if (!normalizedSubject || !validSubjectsList.includes(normalizedSubject)) {
    throw new Error(`Invalid subject: ${inputSubject || "undefined"}`);
  }
  return normalizedSubject;
}

export function normalizeTheme(inputTheme?: string | null): string | null {
  if (!inputTheme) return null;

  const upperCaseTheme = inputTheme.toString().trim().toUpperCase();
  const normalizedTheme = upperCaseTheme
    ? themeMap[upperCaseTheme.toLowerCase()] ||
      (upperCaseTheme === "OTHER" ? null : upperCaseTheme)
    : null;

  if (normalizedTheme && !validThemesList.includes(normalizedTheme)) {
    throw new Error(`Invalid theme: ${inputTheme}`);
  }

  return normalizedTheme;
}

export function normalizeFormData(inputData: FormDataInput): NormalizedData {
  const normalizedGradeLevel = normalizeGradeLevel(inputData.gradeLevel);
  const normalizedSubject = normalizeSubject(inputData.subject);
  const normalizedTheme = normalizeTheme(inputData.theme);

  return {
    title: inputData.title || "Untitled Lesson",
    gradeLevel: normalizedGradeLevel,
    subject: normalizedSubject,
    theme: normalizedTheme,
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
    scheduledDate: inputData.scheduledDate,
  };
}

export function validateCurriculum(curriculum: Curriculum): void {
  if (!validCurriculums.includes(curriculum)) {
    throw new Error(`Invalid curriculum: ${curriculum}`);
  }
}

export function validateGradeAndSubject(
  gradeLevel: string,
  subject: string,
  curriculum: Curriculum
): void {
  if (!validGradeLevels.includes(gradeLevel)) {
    console.error(`Invalid gradeLevel received: ${gradeLevel}`);
    throw new Error(`Invalid gradeLevel: ${gradeLevel}`);
  }

  const gradeCategory = getGradeCategory(gradeLevel);
  const allowedSubjects = validSubjects[curriculum][gradeCategory];

  if (!allowedSubjects.includes(subject)) {
    throw new Error(
      `Invalid subject for ${gradeLevel} in ${curriculum} curriculum: ${subject}`
    );
  }
}

export function validateTheme(
  theme: string | null,
  gradeLevel: string,
  curriculum: Curriculum
): void {
  if (!theme || theme === "OTHER") return;

  const gradeCategory = getGradeCategory(gradeLevel);
  const allowedThemes = validThemes[curriculum][gradeCategory];

  if (!allowedThemes.includes(theme)) {
    throw new Error(
      `Invalid theme for ${gradeLevel} in ${curriculum} curriculum: ${theme}`
    );
  }
}

export function validateDuration(duration: string): void {
  const durationNum = parseInt(duration, 10);
  if (durationNum < 5 || durationNum > 120) {
    throw new Error(`Invalid duration: ${duration}`);
  }
}

export function validateClassroomSize(classroomSize: string): void {
  const classroomSizeNum = parseInt(classroomSize, 10);
  if (classroomSizeNum < 1 || classroomSizeNum > 100) {
    throw new Error(
      `Invalid classroom size: ${classroomSize}. Must be between 1 and 100.`
    );
  }
}

export function validateActivityTypes(
  activityTypes: string[],
  gradeLevel: string,
  curriculum: Curriculum
): void {
  if (!Array.isArray(activityTypes)) {
    throw new Error(`Invalid activityTypes: must be an array`);
  }

  if (activityTypes.length === 0) return;

  const gradeCategory = getGradeCategory(gradeLevel);
  const allowedActivityTypes = validActivityTypes[curriculum][gradeCategory];

  const hasInvalidTypes = !activityTypes.every((type) => {
    const isValidType = allowedActivityTypes.includes(type);
    const isCustomType = !Object.values(validActivityTypes[curriculum]).some(
      (category) => category.includes(type)
    );
    return isValidType || isCustomType;
  });

  if (hasInvalidTypes) {
    throw new Error(
      `Invalid activity types for ${gradeLevel} in ${curriculum} curriculum: ${activityTypes.join(
        ", "
      )}`
    );
  }
}

export function validateStandardsFramework(
  standardsFramework: string | undefined,
  standards: any[],
  curriculum: Curriculum
): void {
  const validStandardsFrameworks = getValidStandardsFrameworks(curriculum);

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
}

export function validateAllInputs(data: NormalizedData): void {
  validateCurriculum(data.curriculum);
  validateGradeAndSubject(data.gradeLevel, data.subject, data.curriculum);
  validateTheme(data.theme, data.gradeLevel, data.curriculum);
  validateDuration(data.duration);
  validateClassroomSize(data.classroomSize);
  validateActivityTypes(data.activityTypes, data.gradeLevel, data.curriculum);
  validateStandardsFramework(
    data.standardsFramework,
    data.standards,
    data.curriculum
  );
}
