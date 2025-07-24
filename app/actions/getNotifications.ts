"use server";

import { createClient } from "@/utils/supabase/server";
import { eq, and, inArray } from "drizzle-orm";
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
        inArray(notifications.status, ["PENDING", "INFO"]) 
      )
    );

  return { userId: user.id, notifications: data };
}
