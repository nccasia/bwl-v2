import { SettingsPage } from "@/modules/settings/pages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customize your BWL experience",
};

export default function Page() {
  return <SettingsPage />;
}
