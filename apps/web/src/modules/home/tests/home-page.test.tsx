import * as demoStoreModule from "@/stores/home/demo-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as useDemoListModule from "../hooks/use-demo-list";
import { HomePage } from "../pages/home-page";

vi.mock("@/stores/home/demo-store");
vi.mock("../hooks/use-demo-list");
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "",
}));

const mockDemoData = {
  data: [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "active" as const, createdAt: "2024-01-15" },
  ],
  total: 1,
  page: 1,
  limit: 10,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";

  return Wrapper;
};

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDemoListModule.useDemoList).mockReturnValue({
      data: mockDemoData,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
    } as never);

    vi.mocked(useDemoListModule.useDeleteDemo).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useDemoListModule.useDemoItem).mockReturnValue({
      data: null,
    } as never);

    vi.mocked(useDemoListModule.useCreateDemo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(useDemoListModule.useUpdateDemo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(demoStoreModule.useDemoUIStore).mockReturnValue({
      openForm: vi.fn(),
      setSearchQuery: vi.fn(),
      closeForm: vi.fn(),
      searchQuery: "",
      isFormOpen: false,
      formMode: "create",
      selectedId: null,
    } as never);
  });

  it("should render the page title", () => {
    render(<HomePage />, { wrapper: createWrapper() });

    expect(screen.getByText("Welcome to BWL App")).toBeInTheDocument();
  });

  it("should render the demo page heading", () => {
    render(<HomePage />, { wrapper: createWrapper() });

    expect(screen.getByText("Demo Page")).toBeInTheDocument();
  });

  it("should render the demo description", () => {
    render(<HomePage />, { wrapper: createWrapper() });

    expect(screen.getByText("TanStack Query + React Hook Form + Valibot + Zustand demo")).toBeInTheDocument();
  });

  it("should render main element", () => {
    const { container } = render(<HomePage />, { wrapper: createWrapper() });

    expect(container.querySelector("main")).toBeInTheDocument();
  });
});
