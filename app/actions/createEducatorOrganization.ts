"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "../db/schema/table/organizations";
import { notifications } from "@/app/db/schema/table/notifications";

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

export async function createEducatorOrganization(
  userId: string,
  userEmail: string,
  educatorEmail?: string
): Promise<
  ActionResponse<
    { success?: boolean; joined?: boolean } | typeof organizations.$inferSelect
  >
> {
  try {
    const supabase = await createClient();

    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser || authUser.user.id !== userId) {
      console.error("Auth error:", authError?.message || "User not found");
      return {
        error: { message: "User not found or unauthorized", code: "401" },
      };
    }

    const userName = authUser.user.user_metadata?.full_name
      ? String(authUser.user.user_metadata.full_name)
      : "New User";

    return await db.transaction(async (tx) => {
      const [existingUser] = await tx
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existingUser) {
        const userData = {
          id: userId,
          email: userEmail,
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
        console.log(`Inserted user ${userId} into users table as fallback`);
      }

      if (educatorEmail) {
        const [educatorData] = await tx
          .select({ id: users.id, organizationId: users.organizationId })
          .from(users)
          .where(eq(users.email, educatorEmail))
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
          .where(eq(users.id, userId));

        await tx.insert(notifications).values({
          userId: educatorData.id,
          senderId: userId,
          type: "EDUCATOR_REQUEST",
          message: `${userName} - ${userEmail} has requested to join your organization as an educator.`,
          organizationId: educatorData.organizationId,
          status: "PENDING",
          createdAt: new Date(),
        });

        revalidatePath("/pending-approval");
        return { data: { success: true, joined: true } };
      } else {
        const orgName = `${userEmail}'s Organization-${Date.now()}`;

        const [orgData] = await tx
          .insert(organizations)
          .values({ name: orgName, user_id: userId })
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
          .where(eq(users.id, userId));

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
        errorMessage = "Column 'user_id' does not exist in organizations table";
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
}
