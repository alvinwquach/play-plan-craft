"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "@/app/db/schema/table/users";
import { notifications } from "@/app/db/schema/table/notifications";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function approveUser(
  userId: string,
  approverId: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser || authUser.user.id !== approverId) {
      console.error("Auth error:", authError?.message || "User not found");
      return {
        error: { message: "Unauthorized", code: "401" },
      };
    }

    return await db.transaction(async (tx) => {
      const [approver] = await tx
        .select({ role: users.role, organizationId: users.organizationId })
        .from(users)
        .where(eq(users.id, approverId))
        .limit(1);

      if (!approver || !["ADMIN", "EDUCATOR"].includes(approver.role || "")) {
        return {
          error: { message: "Unauthorized to approve users", code: "403" },
        };
      }

      if (!approver.organizationId) {
        return {
          error: {
            message: "Approver is not associated with an organization",
            code: "403",
          },
        };
      }

      const [updatedUser] = await tx
        .update(users)
        .set({ pendingApproval: false })
        .where(eq(users.id, userId))
        .returning({
          email: users.email,
          name: users.name,
          organizationId: users.organizationId,
        });

      if (!updatedUser) {
        return {
          error: { message: "User not found", code: "404" },
        };
      }

      if (updatedUser.organizationId !== approver.organizationId) {
        return {
          error: {
            message: "User is not associated with the approver's organization",
            code: "403",
          },
        };
      }

      await tx.insert(notifications).values({
        userId: userId,
        senderId: approverId,
        type: "APPROVAL",
        message: `Your request to join the organization has been approved by ${updatedUser.name}.`,
        organizationId: approver.organizationId,
        status: "INFO",
        createdAt: new Date(),
      });

      revalidatePath("/notifications");
      return { data: { success: true } };
    });
  } catch (error: unknown) {
    console.error("Error approving user:", error);
    const pgError = error as PostgresError;
    return {
      error: {
        message: pgError.message || "Failed to approve user",
        code: pgError.code || "500",
      },
    };
  }
}
