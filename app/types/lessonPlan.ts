export type Curriculum = "US" | "AUS";

export interface Source {
  name: string;
  url: string;
  description: string;
}

export interface SourceMetadata {
  name: string;
  url: string;
  description: string;
}

export interface Supply {
  name: string;
  quantity: number;
  unit: string;
  note?: string | null;
  shoppingLink?: string;
}

export interface Activity {
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
  source: Source;
  engagementScore?: number;
  alignmentScore?: number;
  feasibilityScore?: number;
  supplies?: Supply[];
}

export interface DevelopmentGoal {
  name: string;
  description: string;
}

export interface DrdpDomain {
  code: string;
  name: string;
  description: string;
  strategies: string[];
}

export interface Standard {
  code: string;
  description: string;
  source?: Source;
}

export interface LessonPlan {
  id?: string;
  title: string;
  learningIntention: string;
  successCriteria: string[];
  gradeLevel: string;
  subject: string;
  theme?: string | null;
  status: string;
  duration: number;
  classroomSize: number;
  scheduledDate?: string;
  curriculum: Curriculum;
  activities: Activity[];
  alternateActivities?: Record<string, Activity[]>;
  supplies: Supply[];
  tags: string[];
  developmentGoals: DevelopmentGoal[];
  drdpDomains?: DrdpDomain[];
  standards?: Standard[];
  sourceMetadata?: SourceMetadata[];
  citationScore?: number;
}

export interface OpenAIResponse {
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

export type Retailer = "google" | "amazon" | "walmart";

export interface AlternateActivityGroup {
  activityType: string;
  activities: Activity[];
}