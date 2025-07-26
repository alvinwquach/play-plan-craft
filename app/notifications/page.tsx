"use client";

import { useQuery } from "@apollo/client";
import { redirect } from "next/navigation";
import NotificationsClient from "../components/notifications/NotifcationsClient";
import { GET_NOTIFICATIONS } from "../graphql/queries/getNotifications";

export default function NotificationsPage() {
  const { data, loading, error } = useQuery(GET_NOTIFICATIONS);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error || !data?.notifications?.userId) {
    redirect("/login");
  }

  const { userId, notifications } = data.notifications;

  return (
    <NotificationsClient initialNotifications={notifications} userId={userId} />
  );
}
