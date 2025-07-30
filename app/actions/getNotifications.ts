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

export async function getNotifications(filter?: string): Promise<{
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

    const allowedFilters = [
      "ASSISTANT_REQUEST",
      "LESSON_DELETION_REQUEST",
      "EDUCATOR_REQUEST",
      "PENDING",
      "APPROVED",
    ];

    const conditions = [eq(notifications.userId, user.id)];

    if (filter && allowedFilters.includes(filter)) {
      if (filter === "PENDING" || filter === "APPROVED") {
        conditions.push(eq(notifications.status, filter));
      } else {
        conditions.push(eq(notifications.type, filter));
        conditions.push(inArray(notifications.status, ["PENDING", "APPROVED"]));
      }
    } else if (!filter) {
      conditions.push(inArray(notifications.status, ["PENDING", "APPROVED"]));
    } else {
      return { userId: user.id, notifications: [] };
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
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    const formattedData: Notification[] = data.map((notification) => {
      const formattedNotification = {
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
          | "LESSON_DELETION_REQUEST"
          | "EDUCATOR_REQUEST",
        createdAt: notification.createdAt
          ? new Date(notification.createdAt).toISOString()
          : new Date().toISOString(),
        user: {
          email: notification.user?.email ?? null,
          name: notification.user?.name ?? null,
          image: notification.user?.image ?? null,
        },
      };

      return formattedNotification;
    });

    return {
      userId: user.id,
      notifications: formattedData,
    };
  } catch (err) {
    console.error("getNotifications: Failed to fetch notifications:", err);
    return { userId: null, notifications: [] };
  }
}