import { Sidebar } from "@/modules/shared/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[300px]">
        {children}
      </main>
    </div>
  );
}
