import { getNotifications } from "@/app/actions/getNotifications";
import BottomNavClient from "./BottomNavClient";

export default async function BottomNav() {
  const { notifications } = await getNotifications();
  const notificationCount = notifications.length;

  return <BottomNavClient notificationCount={notificationCount} />;
}
