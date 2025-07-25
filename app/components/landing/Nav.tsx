import { getNotifications } from "@/app/actions/getNotifications";
import NavClient from "./NavClient";

export default async function Nav() {
  const { notifications } = await getNotifications();
  const notificationCount = notifications.length;

  return <NavClient notificationCount={notificationCount} />;
}
