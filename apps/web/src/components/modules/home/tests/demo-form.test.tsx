import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoForm } from "../components/demo-form";
import * as demoStoreModule from "@/stores/home/demo-store";
import * as useDemoListModule from "../hooks/use-demo-list";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/stores/home/demo-store");
vi.mock("../hooks/use-demo-list");

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

describe("DemoForm", () => {
  const mockCloseForm = vi.fn();
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDemoListModule.useDemoItem).mockReturnValue({ data: null } as never);
    vi.mocked(useDemoListModule.useCreateDemo).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as never);
    vi.mocked(useDemoListModule.useUpdateDemo).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as never);
  });

  const renderForm = (isFormOpen = true, formMode: "create" | "edit" = "create", selectedId: string | null = null) => {
    vi.mocked(demoStoreModule.useDemoUIStore).mockReturnValue({
      isFormOpen,
      formMode,
      selectedId,
      closeForm: mockCloseForm,
    } as never);

    return render(<DemoForm />, { wrapper: createWrapper() });
  };

  it("should not render when isFormOpen is false", () => {
    const { container } = renderForm(false);

    expect(container.firstChild).toBeNull();
  });

  it("should render form in create mode", () => {
    renderForm();

    expect(screen.getByText("Create Demo Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("should render form in edit mode", () => {
    vi.mocked(useDemoListModule.useDemoItem).mockReturnValue({
      data: { id: "1", name: "Test User", email: "test@example.com", status: "active", createdAt: "2024-01-01" },
    } as never);

    renderForm(true, "edit", "1");

    expect(screen.getByText("Edit Demo Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  it("should render form fields by name attribute", () => {
    renderForm();

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute("name", "name");
    expect(inputs[1]).toHaveAttribute("name", "email");
  });

  it("should have default empty values in create mode", () => {
    renderForm();

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs[0].value).toBe("");
    expect(inputs[1].value).toBe("");
  });

  it("should call closeForm when clicking Cancel", async () => {
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockCloseForm).toHaveBeenCalled();
  });

  it("should call createDemo.mutate on submit", async () => {
    renderForm();

    const inputs = screen.getAllByRole("textbox");
    await userEvent.type(inputs[0], "New User");
    await userEvent.type(inputs[1], "new@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New User",
        email: "new@example.com",
        status: "active",
      }),
      expect.any(Object)
    );
  });

  it("should disable submit button when isPending is true", () => {
    vi.mocked(useDemoListModule.useCreateDemo).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: true,
    } as never);

    renderForm();

    const submitButton = screen.getByRole("button", { name: "Create" });
    expect(submitButton).toBeDisabled();
  });

  it("should render status select", () => {
    renderForm();

    const statusSelect = screen.getByRole("combobox");
    expect(statusSelect).toHaveAttribute("name", "status");
  });
});
