"use server";

import { createClient } from "@/utils/supabase/server";
import { eq, and, inArray, desc } from "drizzle-orm";
import { notifications } from "@/app/db/schema/table/notifications";
import { users } from "@/app/db/schema/table/users";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Notification } from "../types/lessonPlan";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function getNotifications(): Promise<{
  userId: string | null;
  notifications: Notification[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { userId: null, notifications: [] };
    }

    const data = await db
      .select({
        id: notifications.id,
        senderId: notifications.senderId,
        organizationId: notifications.organizationId,
        message: notifications.message,
        status: notifications.status,
        type: notifications.type,
        createdAt: notifications.createdAt,
        user: {
          email: users.email,
          name: users.name,
          image: users.image,
        },
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.senderId, users.id))
      .where(
        and(
          eq(notifications.userId, user.id),
          inArray(notifications.status, ["PENDING", "APPROVED"]),
          inArray(notifications.type, [
            "ASSISTANT_REQUEST",
            "LESSON_DELETION_REQUEST",
          ])
        )
      )
      .orderBy(desc(notifications.createdAt));

    const formattedData: Notification[] = data.map((notification) => ({
      id: String(notification.id),
      senderId: notification.senderId ? String(notification.senderId) : null,
      organizationId: notification.organizationId
        ? String(notification.organizationId)
        : null,
      message: notification.message,
      status: notification.status as "PENDING" | "APPROVED" | "REJECTED",
      type: notification.type as
        | "MESSAGE"
        | "ALERT"
        | "REMINDER"
        | "ASSISTANT_REQUEST"
        | "LESSON_DELETION_REQUEST",
      createdAt: notification.createdAt
        ? new Date(notification.createdAt).toISOString()
        : new Date().toISOString(),
      user: {
        email: notification.user?.email ?? null,
        name: notification.user?.name ?? null,
        image: notification.user?.image ?? null,
      },
    }));

    return {
      userId: user.id,
      notifications: formattedData,
    };
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return { userId: null, notifications: [] };
  }
}
