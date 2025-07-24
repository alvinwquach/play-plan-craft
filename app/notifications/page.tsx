import { redirect } from "next/navigation";
import { getNotifications } from "../actions/getNotifications";
import NotificationsClient from "../components/notifications/NotifcationsClient";

export default async function NotificationsPage() {
  const { userId, notifications } = await getNotifications();

  if (!userId) {
    redirect("/login");
  }

  return (
    <NotificationsClient initialNotifications={notifications} userId={userId} />
  );
}
