import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DemoList } from "../components/demo-list";
import * as useDemoListModule from "../hooks/use-demo-list";
import * as demoStoreModule from "@/stores/home/demo-store";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";

vi.mock("../hooks/use-demo-list");
vi.mock("@/stores/home/demo-store");

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

const mockDemoData = {
  data: [
    { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "active" as const, createdAt: "2024-01-15" },
    { id: "2", name: "Bob Smith", email: "bob@example.com", status: "inactive" as const, createdAt: "2024-01-16" },
  ],
  total: 2,
  page: 1,
  limit: 10,
};

function createUseDemoListMock(overrides: Partial<{
  data: typeof mockDemoData | undefined;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
}> = {}) {
  return {
    data: mockDemoData,
    isLoading: false,
    error: null,
    isSuccess: true,
    isError: false,
    ...overrides,
  };
}

function createUseDeleteDemoMock() {
  return { mutate: vi.fn() };
}

function createUseDemoUIStoreMock(overrides: Partial<{
  openForm: ReturnType<typeof vi.fn>;
  setSearchQuery: ReturnType<typeof vi.fn>;
  searchQuery: string;
}> = {}) {
  return {
    openForm: vi.fn(),
    setSearchQuery: vi.fn(),
    searchQuery: "",
    ...overrides,
  };
}

describe("DemoList", () => {
  const mockDeleteDemo = createUseDeleteDemoMock();
  const mockOpenForm = mockDeleteDemo.mutate;
  const mockSetSearchQuery = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDemoListModule.useDemoList).mockReturnValue(createUseDemoListMock() as never);
    vi.mocked(useDemoListModule.useDeleteDemo).mockReturnValue(mockDeleteDemo as never);
    vi.mocked(demoStoreModule.useDemoUIStore).mockReturnValue(createUseDemoUIStoreMock({
      openForm: mockOpenForm,
      setSearchQuery: mockSetSearchQuery,
    }) as never);
  });

  it("should Render loading state", () => {
    vi.mocked(useDemoListModule.useDemoList).mockReturnValue(createUseDemoListMock({
      data: undefined,
      isLoading: true,
    }) as never);

    render(<DemoList />, { wrapper: createWrapper() });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should Render error state", () => {
    vi.mocked(useDemoListModule.useDemoList).mockReturnValue(createUseDemoListMock({
      data: undefined,
      error: new Error("Failed to fetch"),
      isError: true,
      isSuccess: false,
    }) as never);

    render(<DemoList />, { wrapper: createWrapper() });

    expect(screen.getByText("Error loading data")).toBeInTheDocument();
  });

  it("should Render search input and Add New button", () => {
    render(<DemoList />, { wrapper: createWrapper() });

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add New" })).toBeInTheDocument();
  });

  it("should Render table with demo data", () => {
    render(<DemoList />, { wrapper: createWrapper() });

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("should Render status badges correctly", () => {
    render(<DemoList />, { wrapper: createWrapper() });

    const activeBadges = screen.getAllByText("active");
    const inactiveBadges = screen.getAllByText("inactive");

    expect(activeBadges).toHaveLength(1);
    expect(inactiveBadges).toHaveLength(1);
  });

  it("should call setSearchQuery when typing in search input", async () => {
    render(<DemoList />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText("Search...");
    await userEvent.type(searchInput, "alice");

    await waitFor(() => {
      expect(mockSetSearchQuery).toHaveBeenCalled();
    });
  });

  it("should call openForm with create mode when clicking Add New", async () => {
    render(<DemoList />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByRole("button", { name: "Add New" }));

    expect(mockOpenForm).toHaveBeenCalledWith("create");
  });

  it("should call openForm with edit mode when clicking Edit", async () => {
    render(<DemoList />, { wrapper: createWrapper() });

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    await userEvent.click(editButtons[0]);

    expect(mockOpenForm).toHaveBeenCalledWith("edit", "1");
  });

  it("should call deleteDemo.mutate when clicking Delete", async () => {
    render(<DemoList />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteDemo.mutate).toHaveBeenCalledWith("1");
  });

  it("should Render table headers correctly", () => {
    render(<DemoList />, { wrapper: createWrapper() });

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should Render correct status badge classes", () => {
    render(<DemoList />, { wrapper: createWrapper() });

    const activeBadge = screen.getByText("active");
    expect(activeBadge).toHaveClass("bg-green-100", "text-green-800");

    const inactiveBadge = screen.getByText("inactive");
    expect(inactiveBadge).toHaveClass("bg-gray-100", "text-gray-800");
  });
});
