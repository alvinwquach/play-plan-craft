"use server";
import { createClient } from "@/utils/supabase/server";
import { eq, and, inArray, desc } from "drizzle-orm";
import { notifications } from "@/app/db/schema/table/notifications";
import { users } from "@/app/db/schema/table/users";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, notifications: [] };
  }

  const data = await db
    .select({
      id: notifications.id,
      senderId: notifications.senderId,
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

  const formattedData = data.map((notification) => ({
    ...notification,
    createdAt: notification.createdAt
      ? new Date(notification.createdAt).toISOString()
      : new Date().toISOString(),
  }));


  return { userId: user.id, notifications: formattedData };
}
