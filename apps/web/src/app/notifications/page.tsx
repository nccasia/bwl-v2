import { NotificationList } from "@/modules/notification/pages/notification-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông báo | BWL Social",
  description: "Xem các thông báo mới nhất của bạn trên BWL Social",
};

export default function NotificationsPage() {
  return <NotificationList />;
}
