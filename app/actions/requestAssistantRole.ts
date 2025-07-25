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

interface ActionResponse<T = unknown> {
  data?: T;
  error?: { message: string; code: string };
}

export async function requestAssistantRole(
  userId: string,
  educatorEmail: string
): Promise<ActionResponse<{ success: boolean }>> {
  try {
    const supabase = await createClient();

    const { data: authUser, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser || authUser.user.id !== userId) {
      return {
        error: { message: "User not found or unauthorized", code: "401" },
      };
    }

    const userEmail = authUser.user.email;
    const userName = authUser.user.user_metadata?.full_name ?? "New User";

    const [educatorData] = await db
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

    await db
      .update(users)
      .set({
        role: "ASSISTANT",
        organizationId: educatorData.organizationId,
        pendingApproval: true,
      })
      .where(eq(users.id, userId));

    await db.insert(notifications).values({
      userId: educatorData.id,
      senderId: userId,
      type: "ASSISTANT_REQUEST",
      message: `${userName} - ${userEmail} has requested to join your organization as an assistant.`,
      organizationId: educatorData.organizationId,
      status: "PENDING",
    });

    revalidatePath("/pending-approval");
    return { data: { success: true } };
  } catch (error: unknown) {
    console.error("Error requesting assistant role:", error);
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Failed to request assistant role",
        code: "500",
      },
    };
  }
}
