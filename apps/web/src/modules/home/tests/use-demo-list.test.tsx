import * as toastModule from "@/modules/shared/hooks/toast";
import * as demoServiceModule from "@/services/home/demo-service";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateDemo, useDeleteDemo, useDemoItem, useDemoList, useUpdateDemo } from "../hooks/use-demo-list";

vi.mock("@/services/home/demo-service");
vi.mock("@/modules/shared/hooks/toast");

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

describe("useDemoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return demo list data", async () => {
    const mockData = {
      data: [{ id: "1", name: "Test", email: "test@example.com", status: "active" as const, createdAt: "2024-01-01" }],
      total: 1,
      page: 1,
      limit: 10,
    };
    vi.mocked(demoServiceModule.demoService.getList).mockResolvedValue(mockData);

    const { result } = renderHook(() => useDemoList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should pass params to service", async () => {
    const mockData = { data: [], total: 0, page: 1, limit: 10 };
    vi.mocked(demoServiceModule.demoService.getList).mockResolvedValue(mockData);

    renderHook(() => useDemoList({ search: "test", status: "active" }), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(demoServiceModule.demoService.getList).toHaveBeenCalledWith({
        search: "test",
        status: "active",
      });
    });
  });

  it("should handle error state", async () => {
    vi.mocked(demoServiceModule.demoService.getList).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDemoList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });
});

describe("useDemoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return demo item by id", async () => {
    const mockItem = { id: "1", name: "Test", email: "test@example.com", status: "active" as const, createdAt: "2024-01-01" };
    vi.mocked(demoServiceModule.demoService.getById).mockResolvedValue(mockItem);

    const { result } = renderHook(() => useDemoItem("1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockItem);
  });

  it("should not fetch when id is null", async () => {
    const { result } = renderHook(() => useDemoItem(null), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(demoServiceModule.demoService.getById).not.toHaveBeenCalled();
  });

  it("should not fetch when id is undefined", async () => {
    const { result } = renderHook(() => useDemoItem(null), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(demoServiceModule.demoService.getById).not.toHaveBeenCalled();
  });

  it("should return null when item not found", async () => {
    vi.mocked(demoServiceModule.demoService.getById).mockResolvedValue(null);

    const { result } = renderHook(() => useDemoItem("999"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});

describe("useCreateDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call create service with input data", async () => {
    const mockInput = { name: "New Item", email: "new@example.com", status: "active" as const };
    const mockCreated = { id: "10", ...mockInput, createdAt: "2024-01-01" };
    vi.mocked(demoServiceModule.demoService.create).mockResolvedValue(mockCreated);

    const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
    vi.mocked(toastModule.useToast).mockReturnValue(mockToast as never);

    const { result } = renderHook(() => useCreateDemo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(mockInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(demoServiceModule.demoService.create).toHaveBeenCalledWith(mockInput);
  });

  it("should show success toast on create success", async () => {
    const mockCreated = { id: "10", name: "Test", email: "test@example.com", status: "active" as const, createdAt: "2024-01-01" };
    vi.mocked(demoServiceModule.demoService.create).mockResolvedValue(mockCreated);

    const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
    vi.mocked(toastModule.useToast).mockReturnValue(mockToast as never);

    const { result } = renderHook(() => useCreateDemo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: "Test", email: "test@example.com", status: "active" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockToast.success).toHaveBeenCalledWith("Demo created successfully", {
      description: "The demo has been created successfully",
    });
  });

  it("should show error toast on create failure", async () => {
    vi.mocked(demoServiceModule.demoService.create).mockRejectedValue(new Error("Create failed"));

    const mockToast = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() };
    vi.mocked(toastModule.useToast).mockReturnValue(mockToast as never);

    const { result } = renderHook(() => useCreateDemo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate({ name: "Test", email: "test@example.com", status: "active" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockToast.error).toHaveBeenCalledWith("Failed to create demo");
  });
});

describe("useUpdateDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call update service with input data", async () => {
    const mockInput = { id: "1", name: "Updated", email: "updated@example.com", status: "inactive" as const };
    vi.mocked(demoServiceModule.demoService.update).mockResolvedValue({ ...mockInput, createdAt: "2024-01-01" });

    const { result } = renderHook(() => useUpdateDemo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate(mockInput);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(demoServiceModule.demoService.update).toHaveBeenCalledWith(mockInput);
  });
});

describe("useDeleteDemo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call delete service with id", async () => {
    vi.mocked(demoServiceModule.demoService.delete).mockResolvedValue();

    const { result } = renderHook(() => useDeleteDemo(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.mutate("1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(demoServiceModule.demoService.delete).toHaveBeenCalledWith("1");
  });
});
