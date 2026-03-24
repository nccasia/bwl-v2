import { DemoForm, DemoList } from "@/features/demo/components";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to BWL App</h1>
      <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Demo Page</h1>
          <p className="mt-1 text-sm text-gray-500">
            TanStack Query + React Hook Form + Valibot + Zustand demo
          </p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6">
        <DemoList />
      </main>
      <DemoForm />
    </div>
    </main>
  );
}
