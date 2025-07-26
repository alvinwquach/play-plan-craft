// /api/graphql.ts
import { createYoga, createSchema } from "graphql-yoga";
import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface NextContext {
  params: Promise<Record<string, string>>;
}

const CustomResponse = Response as typeof Response & {
  json: (data: unknown, init?: ResponseInit) => Response;
};

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
      enum UserRole {
        ADMIN
        EDUCATOR
        ASSISTANT
      }

      type User {
        id: String!
        email: String
        role: UserRole!
        organizationId: Int
      }

      type ApproveUserResponse {
        success: Boolean!
        error: ApproveUserError
      }

      type ApproveUserError {
        message: String!
        code: String!
      }

      type DeleteLessonPlanResponse {
        success: Boolean!
        error: DeleteLessonPlanError
      }

      type DeleteLessonPlanError {
        message: String!
        code: String!
      }

      input ApproveUserInput {
        userId: String!
      }

      input DeleteLessonPlanInput {
        lessonPlanId: Int!
      }

      type Query {
        ping: String!
      }

      type Mutation {
        approveUser(input: ApproveUserInput!): ApproveUserResponse!
        deleteLessonPlan(
          input: DeleteLessonPlanInput!
        ): DeleteLessonPlanResponse!
      }
    `,
    resolvers: {
      Query: {
        ping: () => "pong",
      },
      Mutation: {
        approveUser: async (
          _: unknown,
          { input }: { input: { userId: string } }
        ): Promise<ActionResponse<{ success: boolean }>> => {
          try {
            const supabase = await createClient();
            const {
              data: { user },
              error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
              return {
                error: { message: "Unauthorized: No user found", code: "401" },
              };
            }

            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(user.id) || !uuidRegex.test(input.userId)) {
              return {
                error: { message: "Invalid user ID format", code: "400" },
              };
            }

            return await db.transaction(async (tx) => {
              try {
                const [currentUser] = await tx
                  .select({
                    organizationId: users.organizationId,
                    role: users.role,
                  })
                  .from(users)
                  .where(eq(users.id, user.id))
                  .limit(1);

                if (!currentUser || !currentUser.organizationId) {
                  return {
                    error: {
                      message: "User is not associated with an organization",
                      code: "403",
                    },
                  };
                }

                if (currentUser.role !== "ADMIN") {
                  return {
                    error: {
                      message: "Only admins can approve users",
                      code: "403",
                    },
                  };
                }

                const [organization] = await tx
                  .select()
                  .from(organizations)
                  .where(eq(organizations.id, currentUser.organizationId))
                  .limit(1);

                if (!organization) {
                  return {
                    error: { message: "Organization not found", code: "404" },
                  };
                }

                const [targetUser] = await tx
                  .select({ organizationId: users.organizationId })
                  .from(users)
                  .where(eq(users.id, input.userId))
                  .limit(1);

                if (!targetUser) {
                  return { error: { message: "User not found", code: "404" } };
                }

                if (targetUser.organizationId !== currentUser.organizationId) {
                  return {
                    error: {
                      message: "User does not belong to the same organization",
                      code: "403",
                    },
                  };
                }

                await tx
                  .update(users)
                  .set({ role: "EDUCATOR" })
                  .where(eq(users.id, input.userId));

                return { data: { success: true } };
              } catch (innerError) {
                throw innerError;
              }
            });
          } catch (error: unknown) {
            console.error("Error approving user:", error);
            const pgError = error as PostgresError;
            let errorMessage = "Failed to approve user";
            if (pgError.code === "ENOTFOUND") {
              errorMessage =
                "Database connection failed: Unable to resolve hostname";
            } else if (pgError.code === "ETIMEDOUT") {
              errorMessage = "Database connection timed out";
            } else if (pgError.message) {
              errorMessage = pgError.message;
            }
            return {
              error: { message: errorMessage, code: pgError.code || "500" },
            };
          }
        },
        deleteLessonPlan: async (
          _: unknown,
          { input }: { input: { lessonPlanId: number } }
        ): Promise<ActionResponse<{ success: boolean }>> => {
          console.log("deleteLessonPlan: input:", input);
          try {
            const supabase = await createClient();
            const {
              data: { user },
              error: authError,
            } = await supabase.auth.getUser();
            console.log(
              "deleteLessonPlan: authUser:",
              user,
              "authError:",
              authError?.message
            );
            if (authError || !user) {
              console.error(
                "deleteLessonPlan: Auth error - user:",
                user,
                "error:",
                authError?.message
              );
              return {
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
                error: { message: "Invalid user ID format", code: "400" },
              };
            }

            return await db.transaction(async (tx) => {
              try {
                const [userData] = await tx
                  .select({
                    organizationId: users.organizationId,
                    role: users.role,
                  })
                  .from(users)
                  .where(eq(users.id, user.id))
                  .limit(1);
                console.log("deleteLessonPlan: userData:", userData);
                if (!userData || !userData.organizationId) {
                  console.error(
                    "deleteLessonPlan: User not found or no organizationId:",
                    userData
                  );
                  return {
                    error: {
                      message: "User is not associated with an organization",
                      code: "403",
                    },
                  };
                }

                const [organization] = await tx
                  .select()
                  .from(organizations)
                  .where(eq(organizations.id, userData.organizationId))
                  .limit(1);
                console.log("deleteLessonPlan: organization:", organization);
                if (!organization) {
                  console.error(
                    "deleteLessonPlan: Organization not found for id:",
                    userData.organizationId
                  );
                  return {
                    error: {
                      message:
                        "Only the organization owner can delete lesson plans",
                      code: "403",
                    },
                  };
                }

                const [lessonPlan] = await tx
                  .select()
                  .from(lessonPlans)
                  .where(eq(lessonPlans.id, input.lessonPlanId))
                  .limit(1);
                console.log("deleteLessonPlan: lessonPlan:", lessonPlan);
                if (!lessonPlan) {
                  console.error(
                    "deleteLessonPlan: Lesson plan not found for id:",
                    input.lessonPlanId
                  );
                  return {
                    error: { message: "Lesson plan not found", code: "404" },
                  };
                }

                if (lessonPlan.created_by_id !== user.id) {
                  console.error(
                    "deleteLessonPlan: Unauthorized - lessonPlan.created_by_id:",
                    lessonPlan.created_by_id,
                    "user.id:",
                    user.id
                  );
                  return {
                    error: {
                      message:
                        "Only the creator of the lesson plan can delete it",
                      code: "403",
                    },
                  };
                }

                await tx
                  .delete(schedules)
                  .where(eq(schedules.lessonPlanId, input.lessonPlanId));
                console.log(
                  "deleteLessonPlan: Deleted schedules for lessonPlanId:",
                  input.lessonPlanId
                );
                await tx
                  .delete(lessonPlans)
                  .where(eq(lessonPlans.id, input.lessonPlanId));
                console.log(
                  "deleteLessonPlan: Deleted lesson plan with id:",
                  input.lessonPlanId
                );

                revalidatePath("/calendar", "page");
                const result = { data: { success: true } };
                console.log("deleteLessonPlan: final return value:", result);
                return result;
              } catch (innerError) {
                console.error(
                  "deleteLessonPlan: Transaction error:",
                  innerError
                );
                throw innerError;
              }
            });
          } catch (error: unknown) {
            console.error(
              "deleteLessonPlan: Error deleting lesson plan:",
              error
            );
            const pgError = error as PostgresError;
            let errorMessage = "Failed to delete lesson plan";
            if (pgError.code === "ENOTFOUND") {
              errorMessage =
                "Database connection failed: Unable to resolve hostname";
            } else if (pgError.code === "ETIMEDOUT") {
              errorMessage = "Database connection timed out";
            } else if (pgError.message) {
              errorMessage = pgError.message;
            }
            return {
              error: { message: errorMessage, code: pgError.code || "500" },
            };
          }
        },
      },
    },
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response: CustomResponse },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
