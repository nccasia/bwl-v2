import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useProfile } from "../hooks/use-profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/login/auth-store";
import { getCurrentUserAction, getUserByIdAction } from "@/services/user/user-actions-service";

vi.mock("@/stores/login/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/services/user/user-actions-service", () => ({
  getCurrentUserAction: vi.fn(),
  getUserByIdAction: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("useProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getWrapper = () => {
    const testQueryClient = createTestQueryClient();
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  it("should return profile when isOwnProfile is true and fetch is successful", async () => {
    const mockUser = { id: "testuser", username: "testuser", accessToken: "token123" };
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockUser,
      hasHydrated: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(getCurrentUserAction).mockResolvedValue({
      isSuccess: true,
      data: { id: "user-1", username: "testuser", displayName: "Test User" },
    } as unknown as Awaited<ReturnType<typeof getCurrentUserAction>>);

    const { result } = renderHook(() => useProfile("testuser"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual({ id: "user-1", username: "testuser", displayName: "Test User" });
    expect(result.current.isOwnProfile).toBe(true);
    expect(getCurrentUserAction).toHaveBeenCalledWith("token123");
  });

  it("should return profile when isOwnProfile is false", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "otheruser", username: "otheruser", accessToken: "token123" },
      hasHydrated: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(getUserByIdAction).mockResolvedValue({
      isSuccess: true,
      data: { id: "user-test", username: "testuser", displayName: "Test User 2" },
    } as unknown as Awaited<ReturnType<typeof getUserByIdAction>>);

    const { result } = renderHook(() => useProfile("testuser"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.profile).toEqual({ id: "user-test", username: "testuser", displayName: "Test User 2" });
    expect(result.current.isOwnProfile).toBe(false);
    expect(getUserByIdAction).toHaveBeenCalledWith("testuser", "token123");
    expect(getCurrentUserAction).not.toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: "testuser", username: "testuser" },
      hasHydrated: true,
    } as unknown as ReturnType<typeof useAuthStore>);

    vi.mocked(getCurrentUserAction).mockResolvedValue({
      isSuccess: false,
      message: "API Error",
    } as unknown as Awaited<ReturnType<typeof getCurrentUserAction>>);

    const { result } = renderHook(() => useProfile("testuser"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Failed to fetch profile");
  });

  it("should not fetch if not hydrated", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      hasHydrated: false,
    } as unknown as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useProfile("testuser"), {
      wrapper: getWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(getCurrentUserAction).not.toHaveBeenCalled();
  });
});
