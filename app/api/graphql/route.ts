import { getLessonPlans } from "@/app/actions/getLessonPlans";
import { getNotifications } from "@/app/actions/getNotifications";
import { createSchema, createYoga } from "graphql-yoga";
import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users } from "@/app/db/schema/table/users";
import { notifications } from "@/app/db/schema/table/notifications";
import { organizations } from "@/app/db/schema/table/organizations";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { rescheduleLessonPlan } from "@/app/actions/rescheduleLessonPlan";
import { createLessonPlan } from "@/app/actions/createLessonPlan";

interface NextContext {
  params: Promise<Record<string, string>>;
}

const CustomResponse = Response as typeof Response & {
  json: (data: unknown, init?: ResponseInit) => Response;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

interface ActionResponse<T = unknown> {
  data?: T;
  error?: { message: string; code: string };
}

const { handleRequest } = createYoga<NextContext>({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      enum AgeGroup {
        INFANT
        TODDLER
        PRESCHOOL
        KINDERGARTEN
        GRADE_1
        GRADE_2
        GRADE_3
        GRADE_4
        GRADE_5
        GRADE_6
        GRADE_7
        GRADE_8
        GRADE_9
        GRADE_10
        GRADE_11
        GRADE_12
      }

      enum Subject {
        LITERACY
        MATH
        SCIENCE
        ART
        MUSIC
        PHYSICAL_EDUCATION
        SOCIAL_EMOTIONAL
        HISTORY
        GEOGRAPHY
        STEM
        FOREIGN_LANGUAGE
        COMPUTER_SCIENCE
        CIVICS
        ENGLISH
        MATHEMATICS
        THE_ARTS
        HEALTH_PE
        HUMANITIES_SOCIAL_SCIENCES
        TECHNOLOGIES
        LANGUAGES
        CIVICS_CITIZENSHIP
        SENSORY_DEVELOPMENT
        FINE_MOTOR_SKILLS
        LANGUAGE_DEVELOPMENT
        SOCIAL_STUDIES
        DRAMA
        DANCE
        HEALTH_AND_WELLNESS
        CHARACTER_EDUCATION
        COMMUNITY_SERVICE
        ENGINEERING
        BUSINESS
        ECONOMICS
        PHILOSOPHY
      }

      enum Theme {
        SEASONS
        NATURE
        HOLIDAYS
        EMOTIONS
        COMMUNITY
        ANIMALS
        TRANSPORTATION
        COLORS
        SHAPES
        NUMBERS
        CULTURE
        HISTORY
        SCIENCE_FICTION
        GLOBAL_ISSUES
        LITERATURE
        INDIGENOUS_CULTURE
        AUSTRALIAN_HISTORY
        SUSTAINABILITY
        COLOURS
        TRANSPORT
        SPACE
        OCEANS
        WEATHER
        FAMILY
        CULTURES
        HEROES
        IMAGINATION
        FRIENDSHIP
        HEALTH
        SAFETY
        SCIENCE
        GEOGRAPHY
        ENVIRONMENT
        TECHNOLOGY
        INNOVATION
        CITIZENSHIP
        DIVERSITY
        HERITAGE
        EXPLORATION
        PHYSICS
        BIOLOGY
        CHEMISTRY
        ECONOMICS
        GOVERNMENT
        SOCIALJUSTICE
        GLOBALISSUES
        PHILOSOPHY
        ETHICS
        RESEARCH
        ENTREPRENEURSHIP
        GLOBALCITIZENSHIP
        CAREERDEVELOPMENT
        LEADERSHIP
        CRITICALTHINKING
      }

      enum ActivityType {
        UNKNOWN
        STORYTELLING
        CRAFT
        MOVEMENT
        MUSIC
        EXPERIMENT
        FREE_PLAY
        OUTDOOR
        GROUP_DISCUSSION
        PROJECT
        PRESENTATION
        WRITING
        RESEARCH
        DEBATE
        CODING
        INDIGENOUS_STORY
        QUIZ
        PROJECT_BASED
        HANDS_ON
        DEMONSTRATION
        ROLE_PLAY
        CASE_STUDY
        TEST
        REVIEW_GAME
        FLASHCARDS
        SELF_ASSESSMENT
        PEER_REVIEW
        CLASS_DISCUSSION
        ONLINE_RESEARCH
        DIGITAL_PROJECT
        INTERACTIVE_SIMULATION
        VIRTUAL_FIELD_TRIP
        PROGRAMMING_EXERCISE
        MULTIMEDIA_PRESENTATION
        SCIENCE_FAIR
        ART_PORTFOLIO
        MUSIC_PERFORMANCE
        THEATER_PRODUCTION
        SPORTS_COMPETITION
        SCIENCE_COMPETITION
        RESEARCH_PROJECT
        SERVICE_LEARNING
        ENTREPRENEURSHIP
        ART_EXHIBITION
        MUSIC_RECRITAL
        STUDY_GROUP
        PRACTICE_EXERCISES
        REVIEW_SESSION
        QUIZ_GAME
        SCAVENGER_HUNT
        ESCAPE_ROOM
      }

      enum LessonStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
        PENDING_DELETION
      }

      enum UserRole {
        EDUCATOR
        ADMIN
        ASSISTANT
      }

      enum Curriculum {
        US
        AUS
      }

      enum NotificationStatus {
        PENDING
        APPROVED
        REJECTED
      }

      enum NotificationType {
        MESSAGE
        ALERT
        REMINDER
        ASSISTANT_REQUEST
        LESSON_DELETION_REQUEST
        LESSON_RESCHEDULE_REQUEST
        EDUCATOR_REQUEST
      }

      type User {
        id: ID!
        email: String!
        name: String!
        role: UserRole!
        createdAt: String!
        image: String
        organizationId: Int
        pendingApproval: Boolean!
        lessonPlans: [LessonPlan!]!
        schedules: [Schedule!]!
        lessonNotes: [LessonNote!]!
        organization: Organization
      }

      type Organization {
        id: ID!
        name: String!
        users: [User!]!
      }

      type Supply {
        name: String!
        quantity: Int!
        unit: String!
        note: String
      }

      type LessonPlan {
        id: ID!
        title: String!
        gradeLevel: String
        ageGroup: AgeGroup!
        subject: Subject!
        theme: Theme
        status: LessonStatus!
        createdAt: String!
        createdBy: User!
        curriculum: Curriculum!
        duration: Int!
        classroomSize: Int!
        learningIntention: String
        successCriteria: [String!]!
        activities: [Activity!]!
        alternateActivities: [AlternateActivityGroup!]!
        supplies: [Supply!]!
        developmentGoals: [DevelopmentGoal!]!
        lessonNotes: [LessonNote!]!
        standards: [Standard!]!
        drdpDomains: [DrdpDomain!]!
        sourceMetadata: [Source!]!
        citationScore: Int!
        tags: [String!]!
        created_by_id: String!
        createdByName: String!
        scheduledDate: String
      }

      type Activity {
        id: ID
        title: String!
        description: String!
        activityType: ActivityType!
        durationMins: Int!
        lessonPlan: LessonPlan!
        source: Source!
        engagementScore: Int!
        alignmentScore: Int!
        feasibilityScore: Int!
      }

      type AlternateActivityGroup {
        activityType: ActivityType!
        activities: [Activity!]!
      }

      type Schedule {
        id: ID!
        user: User!
        lessonPlan: LessonPlan!
        date: String!
        startTime: String!
        endTime: String!
      }

      type LessonNote {
        id: ID!
        user: User!
        lessonPlan: LessonPlan!
        note: String!
        createdAt: String!
      }

      type DevelopmentGoal {
        id: ID!
        name: String!
        description: String!
        ageGroup: AgeGroup!
        lessonPlans: [LessonPlan!]!
      }

      type Standard {
        code: String!
        description: String!
        source: Source
      }

      type DrdpDomain {
        code: String!
        name: String!
        description: String!
        strategies: [String!]!
      }

      type Source {
        name: String!
        url: String!
        description: String!
      }

      input StandardInput {
        code: String!
        description: String!
        source: SourceInput
      }

      input SourceInput {
        name: String!
        url: String!
        description: String!
      }

      type AuthResponse {
        accessToken: String!
        user: User!
      }

      type CreateEducatorOrganizationResponse {
        success: Boolean
        joined: Boolean
        organization: Organization
        error: CreateEducatorOrganizationError
      }

      type CreateEducatorOrganizationError {
        message: String!
        code: String!
      }

      input CreateEducatorOrganizationInput {
        userId: ID!
        userEmail: String!
        educatorEmail: String
      }

      type RequestAssistantRoleResponse {
        success: Boolean
        error: RequestAssistantRoleError
      }
      type RequestAssistantRoleError {
        message: String!
        code: String!
      }

      input RescheduleLessonPlanInput {
        lessonPlanId: ID!
        scheduledDate: String!
      }

      type RescheduleLessonPlanResponse {
        success: Boolean!
        lessonPlan: LessonPlan
        error: Error
        requestSent: Boolean
      }

      type Error {
        message: String!
        code: String
      }

      type DeleteLessonPlanResponse {
        success: Boolean!
        error: DeleteLessonPlanError
        requestSent: Boolean
      }

      type DeleteLessonPlanError {
        message: String!
        code: String!
      }

      input DeleteLessonPlanInput {
        lessonPlanId: Int!
      }

      input RequestAssistantRoleInput {
        userId: ID!
        educatorEmail: String!
      }

      type LessonPlansResponse {
        lessonPlans: [LessonPlan!]!
        userRole: UserRole
        isOrganizationOwner: Boolean!
      }

      type CreateLessonPlanResponse {
        success: Boolean!
        lessonPlan: LessonPlan
        error: Error
      }

      input CreateLessonPlanInput {
        title: String
        gradeLevel: String!
        subject: String!
        theme: String
        duration: Int!
        activityTypes: [String!]
        classroomSize: Int!
        learningIntention: String
        successCriteria: [String!]
        standardsFramework: String
        standards: [StandardInput!]
        preferredSources: [SourceInput!]
        curriculum: Curriculum!
        scheduledDate: String
      }

      type Notification {
        id: ID!
        senderId: String!
        message: String!
        status: NotificationStatus!
        type: NotificationType!
        createdAt: String!
        user: User!
      }

      type NotificationsResponse {
        userId: String
        notifications: [Notification!]!
      }

      type Query {
        greetings: String
        lessonPlans: LessonPlansResponse!
        notifications(filter: String): NotificationsResponse!
      }

      input ApproveLessonDeletionInput {
        notificationId: ID!
        approve: Boolean!
      }

      type ApproveLessonDeletionResponse {
        success: Boolean!
        error: Error
      }

      type Mutation {
        requestAssistantRole(
          input: RequestAssistantRoleInput!
        ): RequestAssistantRoleResponse!
        createEducatorOrganization(
          input: CreateEducatorOrganizationInput!
        ): CreateEducatorOrganizationResponse
        deleteLessonPlan(
          input: DeleteLessonPlanInput!
        ): DeleteLessonPlanResponse!
        rescheduleLessonPlan(
          input: RescheduleLessonPlanInput!
        ): RescheduleLessonPlanResponse!
        createLessonPlan(
          input: CreateLessonPlanInput!
        ): CreateLessonPlanResponse!
        approveLessonDeletion(
          input: ApproveLessonDeletionInput!
        ): ApproveLessonDeletionResponse!
      }
    `,
    resolvers: {
      Query: {
        lessonPlans: async () => {
          try {
            const result = await getLessonPlans();

            const {
              success,
              lessonPlans,
              userRole,
              isOrganizationOwner,
              error,
            } = result;

            if (!success || !lessonPlans) {
              console.error("Lesson plans error:", error);
              throw new Error(error || "Failed to fetch lesson plans");
            }

            return {
              lessonPlans,
              userRole,
              isOrganizationOwner,
            };
          } catch (err) {
            console.error("lessonPlans resolver failed:", err);
            throw err;
          }
        },
        notifications: async (_, { filter }) => {
          try {
            const { userId, notifications } = await getNotifications(filter);
            if (!userId || !notifications) {
              throw new Error(
                "Failed to fetch notifications or user not authenticated"
              );
            }

            return {
              userId,
              notifications,
            };
          } catch (err) {
            console.error("Notifications resolver failed:", err);
            throw err;
          }
        },
      },
      Mutation: {
        createEducatorOrganization: async (
          _: unknown,
          {
            input,
          }: {
            input: {
              userId: string;
              userEmail: string;
              educatorEmail?: string;
            };
          }
        ): Promise<
          ActionResponse<
            | { success?: boolean; joined?: boolean }
            | typeof organizations.$inferSelect
          >
        > => {
          try {
            const supabase = await createClient();

            const { data: authUser, error: authError } =
              await supabase.auth.getUser();
            if (authError || !authUser || authUser.user.id !== input.userId) {
              console.error(
                "Auth error:",
                authError?.message || "User not found"
              );
              return {
                error: {
                  message: "User not found or unauthorized",
                  code: "401",
                },
              };
            }

            const userName = authUser.user.user_metadata?.full_name
              ? String(authUser.user.user_metadata.full_name)
              : "New User";

            return await db.transaction(async (tx) => {
              const [existingUser] = await tx
                .select({ id: users.id, email: users.email })
                .from(users)
                .where(eq(users.id, input.userId))
                .limit(1);

              if (!existingUser) {
                const userData = {
                  id: input.userId,
                  email: input.userEmail,
                  name: userName,
                  image: authUser.user.user_metadata?.avatar_url
                    ? String(authUser.user.user_metadata.avatar_url)
                    : null,
                  role: null as "EDUCATOR" | "ADMIN" | "ASSISTANT" | null,
                  createdAt: new Date(),
                  organizationId: null as number | null,
                  pendingApproval: false,
                };
                await tx.insert(users).values(userData);
                console.log(
                  `Inserted user ${input.userId} into users table as fallback`
                );
              }

              if (input.educatorEmail) {
                const [educatorData] = await tx
                  .select({
                    id: users.id,
                    organizationId: users.organizationId,
                  })
                  .from(users)
                  .where(eq(users.email, input.educatorEmail))
                  .limit(1);

                if (!educatorData || !educatorData.organizationId) {
                  return {
                    error: {
                      message:
                        "Educator email not found or not associated with an organization",
                      code: "404",
                    },
                  };
                }

                await tx
                  .update(users)
                  .set({
                    role: "EDUCATOR",
                    organizationId: educatorData.organizationId,
                    pendingApproval: true,
                  })
                  .where(eq(users.id, input.userId));

                await tx.insert(notifications).values({
                  userId: educatorData.id,
                  senderId: input.userId,
                  type: "EDUCATOR_REQUEST",
                  message: `${userName} - ${input.userEmail} has requested to join your organization as an educator.`,
                  organizationId: educatorData.organizationId,
                  status: "PENDING",
                  createdAt: new Date(),
                });

                revalidatePath("/pending-approval");
                return { data: { success: true, joined: true } };
              } else {
                const orgName = `${
                  input.userEmail
                }'s Organization-${Date.now()}`;

                const [orgData] = await tx
                  .insert(organizations)
                  .values({ name: orgName, user_id: input.userId })
                  .returning();

                if (!orgData) {
                  throw new Error("No organization data returned from insert");
                }

                await tx
                  .update(users)
                  .set({
                    role: "EDUCATOR",
                    organizationId: orgData.id,
                    pendingApproval: false,
                  })
                  .where(eq(users.id, input.userId));

                revalidatePath("/lesson-plan");
                return { data: orgData };
              }
            });
          } catch (error: unknown) {
            console.error("Error processing educator organization:", error);
            const pgError = error as PostgresError;
            let errorMessage = "Failed to process organization";
            const errorCode = pgError.code || "500";

            switch (pgError.code) {
              case "42703":
                errorMessage =
                  "Column 'user_id' does not exist in organizations table";
                break;
              case "23503":
                errorMessage =
                  "Foreign key constraint violation: User ID does not exist in users table";
                break;
              case "23505":
                errorMessage = "Organization name already exists";
                break;
              default:
                errorMessage = pgError.message || errorMessage;
            }

            return {
              error: {
                message: errorMessage,
                code: errorCode,
              },
            };
          }
        },
        requestAssistantRole: async (
          _: unknown,
          {
            input,
          }: {
            input: {
              userId: string;
              educatorEmail: string;
            };
          }
        ): Promise<ActionResponse<{ success: boolean }>> => {
          try {
            const supabase = await createClient();

            const { data: authUser, error: userError } =
              await supabase.auth.getUser();
            if (userError || !authUser || authUser.user.id !== input.userId) {
              return {
                error: {
                  message: "User not found or unauthorized",
                  code: "401",
                },
              };
            }

            const userEmail = authUser.user.email;
            const userName =
              authUser.user.user_metadata?.full_name ?? "New User";

            const [educatorData] = await db
              .select({ id: users.id, organizationId: users.organizationId })
              .from(users)
              .where(eq(users.email, input.educatorEmail))
              .limit(1);

            if (!educatorData || !educatorData.organizationId) {
              return {
                error: {
                  message:
                    "Educator email not found or not associated with an organization",
                  code: "404",
                },
              };
            }

            await db
              .update(users)
              .set({
                role: "ASSISTANT",
                organizationId: educatorData.organizationId,
                pendingApproval: true,
              })
              .where(eq(users.id, input.userId));

            await db.insert(notifications).values({
              userId: educatorData.id,
              senderId: input.userId,
              type: "ASSISTANT_REQUEST",
              message: `${userName} - ${userEmail} has requested to join your organization as an assistant.`,
              organizationId: educatorData.organizationId,
              status: "PENDING",
              createdAt: new Date(),
            });

            revalidatePath("/pending-approval");
            return { data: { success: true } };
          } catch (error: unknown) {
            console.error("Error requesting assistant role:", error);
            const pgError = error as PostgresError;
            const errorMessage =
              pgError instanceof Error
                ? pgError.message
                : "Failed to request assistant role";
            const errorCode = pgError.code || "500";

            return {
              error: {
                message: errorMessage,
                code: errorCode,
              },
            };
          }
        },
        deleteLessonPlan: async (
          _: unknown,
          { input }: { input: { lessonPlanId: number } }
        ): Promise<{
          success: boolean;
          error?: { message: string; code: string };
          requestSent?: boolean;
        }> => {
          console.log("deleteLessonPlan: input:", input);
          try {
            const supabase = await createClient();
            const {
              data: { user },
              error: authError,
            } = await supabase.auth.getUser();
            if (authError || !user) {
              console.error(
                "deleteLessonPlan: Auth error - user:",
                user,
                "error:",
                authError?.message
              );
              return {
                success: false,
                error: { message: "Unauthorized: No user found", code: "401" },
              };
            }

            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.id)) {
              console.error(
                "deleteLessonPlan: Invalid user ID format:",
                user.id
              );
              return {
                success: false,
                error: { message: "Invalid user ID format", code: "400" },
              };
            }

            return await db.transaction(async (tx) => {
              try {
                const [userData] = await tx
                  .select({
                    organizationId: users.organizationId,
                    role: users.role,
                    name: users.name,
                  })
                  .from(users)
                  .where(eq(users.id, user.id))
                  .limit(1);
                if (!userData || !userData.organizationId) {
                  return {
                    success: false,
                    error: {
                      message: "User is not associated with an organization",
                      code: "403",
                    },
                  };
                }

                const [organization] = await tx
                  .select({
                    id: organizations.id,
                    user_id: organizations.user_id,
                  })
                  .from(organizations)
                  .where(eq(organizations.id, userData.organizationId))
                  .limit(1);
                if (!organization) {
                  return {
                    success: false,
                    error: {
                      message: "Organization not found",
                      code: "403",
                    },
                  };
                }

                if (!organization.user_id) {
                  return {
                    success: false,
                    error: {
                      message: "Organization has no owner",
                      code: "400",
                    },
                  };
                }

                const [lessonPlan] = await tx
                  .select({
                    id: lessonPlans.id,
                    title: lessonPlans.title,
                    created_by_id: lessonPlans.created_by_id,
                  })
                  .from(lessonPlans)
                  .where(eq(lessonPlans.id, input.lessonPlanId))
                  .limit(1);
                if (!lessonPlan) {
                  return {
                    success: false,
                    error: { message: "Lesson plan not found", code: "404" },
                  };
                }

                const isOrganizationOwner = organization.user_id === user.id;

                if (!isOrganizationOwner) {
                  if (
                    userData.role !== "EDUCATOR" &&
                    userData.role !== "ADMIN"
                  ) {
                    return {
                      success: false,
                      error: {
                        message:
                          "Only educators or admins can request deletion",
                        code: "403",
                      },
                    };
                  }

                  const [ownerData] = await tx
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.id, organization.user_id))
                    .limit(1);
                  if (!ownerData) {
                    return {
                      success: false,
                      error: {
                        message: "Organization owner not found",
                        code: "404",
                      },
                    };
                  }

                  // Update the lesson plan status to PENDING_DELETION
                  await tx
                    .update(lessonPlans)
                    .set({ status: "PENDING_DELETION" })
                    .where(eq(lessonPlans.id, input.lessonPlanId));

                  await tx.insert(notifications).values({
                    userId: ownerData.id,
                    senderId: user.id,
                    type: "LESSON_DELETION_REQUEST",
                    message: `${
                      userData.name || "User"
                    } has requested to delete the lesson plan: "${
                      lessonPlan.title
                    }" (ID: ${lessonPlan.id})`,
                    organizationId: userData.organizationId,
                    status: "PENDING",
                    createdAt: new Date(),
                  });

                  revalidatePath("/notifications");
                  return {
                    success: true,
                    requestSent: true,
                  };
                }

                // Organization owners can delete any lesson plan directly
                await tx
                  .delete(schedules)
                  .where(eq(schedules.lessonPlanId, input.lessonPlanId));
                await tx
                  .delete(lessonPlans)
                  .where(eq(lessonPlans.id, input.lessonPlanId));
                revalidatePath("/calendar", "page");
                return {
                  success: true,
                  requestSent: false,
                };
              } catch (innerError) {
                console.error(
                  "deleteLessonPlan: Transaction error:",
                  innerError
                );
                return {
                  success: false,
                  error: {
                    message:
                      innerError instanceof Error
                        ? innerError.message
                        : "Transaction failed",
                    code: "500",
                  },
                };
              }
            });
          } catch (error: unknown) {
            console.error("deleteLessonPlan: Error:", error);
            const pgError = error as PostgresError;
            let errorMessage = "Failed to process deletion";
            const errorCode = pgError.code || "500";

            if (pgError.code === "ENOTFOUND") {
              errorMessage =
                "Database connection failed: Unable to resolve hostname";
            } else if (pgError.code === "ETIMEDOUT") {
              errorMessage = "Database connection timed out";
            } else if (pgError.message) {
              errorMessage = pgError.message;
            }

            return {
              success: false,
              error: { message: errorMessage, code: errorCode },
            };
          }
        },
        rescheduleLessonPlan: async (_, { input }) => {
          try {
            const result = await rescheduleLessonPlan(
              input.lessonPlanId,
              input.scheduledDate
            );
        
            return {
              success: result.success,
              lessonPlan: result.lessonPlan,
              error: result.error
                ? {
                    message: result.error,
                    code:
                      result.error ===
                      "Reschedule request sent to the organization owner for approval."
                        ? "200"
                        : "500",
                  }
                : null,
              requestSent: result.requestSent,
            };
          } catch (error) {
            console.error("Error in rescheduleLessonPlan mutation:", error);
            return {
              success: false,
              error: {
                message:
                  error instanceof Error
                    ? error.message
                    : "Failed to reschedule lesson plan",
                code: "500",
              },
            };
          }
        },
        createLessonPlan: async (_, { input }) => {
          try {
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
            if (!validGradeLevels.includes(input.gradeLevel)) {
              return {
                success: false,
                error: {
                  message: `Invalid gradeLevel: ${input.gradeLevel}`,
                  code: "400",
                },
              };
            }

            const formData = new FormData();
            if (input.title) formData.append("title", input.title);
            formData.append("gradeLevel", input.gradeLevel);
            formData.append("subject", input.subject);
            if (input.theme) formData.append("theme", input.theme);
            formData.append("duration", input.duration.toString());
            if (input.activityTypes && input.activityTypes.length > 0) {
              formData.append("activityTypes", input.activityTypes.join(","));
            }
            formData.append("classroomSize", input.classroomSize.toString());
            if (input.learningIntention) {
              formData.append("learningIntention", input.learningIntention);
            }
            if (input.successCriteria && input.successCriteria.length > 0) {
              formData.append(
                "successCriteria",
                input.successCriteria.join(",")
              );
            }
            if (input.standardsFramework) {
              formData.append("standardsFramework", input.standardsFramework);
            }
            if (input.standards && input.standards.length > 0) {
              formData.append("standards", JSON.stringify(input.standards));
            }
            if (input.preferredSources && input.preferredSources.length > 0) {
              formData.append(
                "preferredSources",
                JSON.stringify(input.preferredSources)
              );
            }
            formData.append("curriculum", input.curriculum);
            if (input.scheduledDate) {
              formData.append("scheduledDate", input.scheduledDate);
            }

            const result = await createLessonPlan(formData);

            if (result.success && result.data) {
              const supabase = await createClient();
              const { data: user, error: userError } = await supabase
                .from("users")
                .select("name")
                .eq("id", result.data.created_by_id)
                .single();

              if (userError) {
                console.error("Error fetching user name:", userError);
                return {
                  success: true,
                  lessonPlan: {
                    ...result.data,
                    ageGroup: result.data.age_group,
                    createdAt:
                      result.data.created_at ?? new Date().toISOString(),
                    classroomSize: result.data.classroom_size ?? 0,
                    successCriteria: result.data.success_criteria ?? [],
                    createdByName: "Unknown",
                  },
                  error: null,
                };
              }

              return {
                success: true,
                lessonPlan: {
                  ...result.data,
                  ageGroup: result.data.age_group,
                  createdAt: result.data.created_at ?? new Date().toISOString(),
                  classroomSize: result.data.classroom_size ?? 0,
                  successCriteria: result.data.success_criteria ?? [],
                  createdByName: user.name ?? "Unknown",
                },
                error: null,
              };
            }

            return {
              success: false,
              error: {
                message: result.error || "Failed to create lesson plan",
                code: "500",
              },
            };
          } catch (error) {
            console.error("Error in createLessonPlan mutation:", error);
            return {
              success: false,
              error: {
                message:
                  error instanceof Error
                    ? error.message
                    : "Failed to create lesson plan",
                code: "500",
              },
            };
          }
        },
        approveLessonDeletion: async (
          _: unknown,
          {
            input,
          }: {
            input: {
              notificationId: string;
              approve: boolean;
            };
          }
        ): Promise<{
          success: boolean;
          error?: { message: string; code: string };
        }> => {
          try {
            const supabase = await createClient();
            const {
              data: { user },
              error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
              return {
                success: false,
                error: {
                  message: "Unauthorized: No user found",
                  code: "401",
                },
              };
            }

            return await db.transaction(async (tx) => {
              const [notification] = await tx
                .select({
                  id: notifications.id,
                  userId: notifications.userId,
                  senderId: notifications.senderId,
                  organizationId: notifications.organizationId,
                  type: notifications.type,
                  message: notifications.message,
                  status: notifications.status,
                })
                .from(notifications)
                .where(eq(notifications.id, parseInt(input.notificationId, 10)))
                .limit(1);

              if (!notification) {
                return {
                  success: false,
                  error: {
                    message: "Notification not found",
                    code: "404",
                  },
                };
              }

              if (notification.type !== "LESSON_DELETION_REQUEST") {
                return {
                  success: false,
                  error: {
                    message: "Invalid notification type for deletion approval",
                    code: "400",
                  },
                };
              }

              if (notification.userId !== user.id) {
                return {
                  success: false,
                  error: {
                    message: "User is not authorized to approve this request",
                    code: "403",
                  },
                };
              }

              const lessonPlanIdMatch = notification.message.match(/ID: (\d+)/);
              if (!lessonPlanIdMatch) {
                return {
                  success: false,
                  error: {
                    message:
                      "Failed to extract lesson plan ID from notification message",
                    code: "400",
                  },
                };
              }

              const lessonPlanId = parseInt(lessonPlanIdMatch[1]);
              if (isNaN(lessonPlanId)) {
                return {
                  success: false,
                  error: {
                    message: "Extracted lesson plan ID is not a valid number",
                    code: "400",
                  },
                };
              }

              if (input.approve) {
                await tx
                  .delete(schedules)
                  .where(eq(schedules.lessonPlanId, lessonPlanId));
                await tx
                  .delete(lessonPlans)
                  .where(eq(lessonPlans.id, lessonPlanId));
              } else {
                await tx
                  .update(lessonPlans)
                  .set({ status: "PUBLISHED" })
                  .where(eq(lessonPlans.id, lessonPlanId));
              }

              await tx
                .update(notifications)
                .set({
                  status: input.approve ? "APPROVED" : "REJECTED",
                })
                .where(
                  eq(notifications.id, parseInt(input.notificationId, 10))
                );

              await tx.insert(notifications).values({
                userId: notification.senderId,
                senderId: user.id,
                type: "LESSON_DELETION_RESPONSE",
                message: `Your request to delete lesson plan (ID: ${lessonPlanId}) was ${
                  input.approve ? "approved" : "rejected"
                } by the organization owner.`,
                organizationId: notification.organizationId,
                status: "RESOLVED",
                createdAt: new Date(),
              });

              revalidatePath("/notifications");
              revalidatePath("/calendar", "page");
              return { success: true };
            });
          } catch (error: unknown) {
            console.error("approveLessonDeletion: Error:", error);
            const pgError = error as PostgresError;
            return {
              success: false,
              error: {
                message:
                  pgError instanceof Error
                    ? pgError.message
                    : "Failed to approve lesson deletion",
                code: pgError.code || "500",
              },
            };
          }
        },
      },
    },
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  fetchAPI: {
    Response: CustomResponse,
  },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
