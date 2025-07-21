export interface Source {
  name: string;
  url: string;
  description: string;
}

export interface Supply {
  name: string;
  quantity: number;
  unit: string;
  note?: string;
  shoppingLink?: string;
}

export interface Activity {
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
  source?: Source;
  supplies?: Supply[];
  engagementScore: number;
  alignmentScore: number;
  feasibilityScore: number;
}

export interface DevelopmentalGoal {
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
  id: number;
  title: string;
  learningIntention: string;
  successCriteria: string[];
  gradeLevel: string;
  subject: string;
  theme?: string;
  status: string;
  duration: number;
  classroomSize: number;
  scheduledDate?: string;
  activities: Activity[];
  alternateActivities?: Record<string, Activity[]>;
  supplies: Supply[];
  tags: string[];
  developmentGoals: DevelopmentalGoal[];
  drdpDomains?: DrdpDomain[];
  standards?: Standard[];
  sourceMetadata?: Source[];
  citationScore?: number;
}