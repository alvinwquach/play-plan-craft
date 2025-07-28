import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { lessonPlans } from "../db/schema/table/lessonPlans";

export interface AlternateActivityGroup {
  activityType: string;
  activities: Activity[];
  groupName?: string;
}

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
  id?: string;
  title: string;
  activityType: string;
  description: string;
  durationMins: number;
  source?: Source;
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
  subject: string;
  learningIntention: string;
  createdByName?: string;
  created_by_id: string;
  successCriteria: string[];
  gradeLevel: string;
  theme?: string | null;
  status?: string;
  duration: number;
  classroomSize: number;
  scheduledDate?: string;
  curriculum: Curriculum;
  activities: Activity[];
  alternateActivities?: Record<string, Activity[]> | AlternateActivityGroup[];
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

export type LessonPlanDB = InferSelectModel<typeof lessonPlans>;
export type LessonPlanInsert = InferInsertModel<typeof lessonPlans>;

export type Notification = {
  id: string;
  senderId: string;
  organizationId: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RESOLVED";
  type:
    | "MESSAGE"
    | "ALERT"
    | "REMINDER"
    | "ASSISTANT_REQUEST"
    | "LESSON_DELETION_REQUEST"
    | "LESSON_RESCHEDULE_REQUEST"
    | "LESSON_RESCHEDULE_RESPONSE"
    | "EDUCATOR_REQUEST";
  createdAt: string;
  user: {
    email: string | null;
    name: string | null;
    image: string | null;
  };
};

export type NotificationPayload = {
  eventType: string;
  new: { status?: string } | null;
  old: { status?: string } | null;
};