import { getNotifications } from "./queries";
import NotificationsClient from "./client";

export default async function NotificationsPage() {
  const { notifications, userId } = await getNotifications();

  return (
    <NotificationsClient notifications={notifications} userId={userId} />
  );
}
