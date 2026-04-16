import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreatePostMutation } from "../hooks/use-create-post-mutation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToast } from "@/modules/shared/hooks/toast";
import { createPostAction } from "@/services/post/post-actions-service";

vi.mock("@/services/post/post-actions-service", () => ({
  createPostAction: vi.fn(),
}));



vi.mock("@/modules/shared/hooks/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    if (key === "post-success")
      return "Bài viết của bạn đã được đăng thành công!";
    return key;
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe("useCreatePostMutation", () => {
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockShowToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({
      success: mockShowToast,
    } as unknown as ReturnType<typeof useToast>);
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

  it("should create post successfully without images", async () => {
    vi.mocked(createPostAction).mockResolvedValue({
      isSuccess: true,
      data: { id: "p-1" },
    } as unknown as Awaited<ReturnType<typeof createPostAction>>);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "Hello", imageUrls: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createPostAction).toHaveBeenCalledWith("Hello", [], "");
    expect(mockShowToast).toHaveBeenCalledWith(
      "Bài viết của bạn đã được đăng thành công!",
    );
  });

  it("should create post with image URLs", async () => {
    vi.mocked(createPostAction).mockResolvedValue({
      isSuccess: true,
      data: { id: "p-1" },
    } as unknown as Awaited<ReturnType<typeof createPostAction>>);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "With Image", imageUrls: ["url1"] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createPostAction).toHaveBeenCalledWith("With Image", ["url1"], "");
  });

  it("should handle API errors", async () => {
    vi.mocked(createPostAction).mockResolvedValue({
      isSuccess: false,
      message: "Server Error",
    } as unknown as Awaited<ReturnType<typeof createPostAction>>);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "Error", imageUrls: [] });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Server Error");
  });
});
