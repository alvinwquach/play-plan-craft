export interface Activity {
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
}

export interface Supply {
  name: string;
  quantity: number;
  unit: string;
  note: string | null;
  shoppingLink?: string;
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
}

export interface LessonPlan {
  id?: string;
  title: string;
  gradeLevel: string;
  subject: string;
  theme: string | null;
  status: string;
  duration: number;
  classroomSize: number;
  learningIntention: string;
  successCriteria: string[];
  activities: Activity[];
  supplies: Supply[];
  tags: string[];
  developmentGoals: DevelopmentGoal[];
  drdpDomains?: DrdpDomain[];
  standards?: Standard[];
  scheduledDate?: string;
}
