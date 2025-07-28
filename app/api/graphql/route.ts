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
        gradeLevel: String!
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
        id: ID!
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
        source: Source!
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
      input RequestAssistantRoleInput {
        userId: ID!
        educatorEmail: String!
      }

      type LessonPlansResponse {
        lessonPlans: [LessonPlan!]!
        userRole: UserRole
        isOrganizationOwner: Boolean!
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
        notifications: NotificationsResponse!
      }

      type Mutation {
        requestAssistantRole(
          input: RequestAssistantRoleInput!
        ): RequestAssistantRoleResponse!

        createEducatorOrganization(
          input: CreateEducatorOrganizationInput!
        ): CreateEducatorOrganizationResponse
      }
    `,
    resolvers: {
      Query: {
        lessonPlans: async () => {
          console.log("lessonPlans resolver hit");

          try {
            const result = await getLessonPlans();
            console.log("lessonPlans result:", result);

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
        notifications: async () => {
          const { userId, notifications } = await getNotifications();

          if (!userId || !notifications) {
            throw new Error(
              "Failed to fetch notifications or user not authenticated"
            );
          }

          return {
            userId,
            notifications,
          };
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
