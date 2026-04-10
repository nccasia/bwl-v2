import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreatePostMutation } from "../hooks/use-create-post-mutation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { uploadService } from "../../../services/post/posts-service/post-images-service";
import { useToast } from "@/modules/shared/hooks/toast";
import { createPostAction } from "@/actions/post-actions";

vi.mock("@/actions/post-actions", () => ({
  createPostAction: vi.fn(),
}));

vi.mock("@/services/post/posts-service/post-images-service", () => ({
  uploadService: {
    uploadMultiplePostImages: vi.fn(),
  },
}));

vi.mock("@/modules/shared/hooks/toast", () => ({
  useToast: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    if (key === "post-success") return "Bài viết của bạn đã được đăng thành công!";
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
    } as any);
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
    } as any);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "Hello", files: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createPostAction).toHaveBeenCalledWith("Hello", []);
    expect(mockShowToast).toHaveBeenCalledWith(
      "Bài viết của bạn đã được đăng thành công!",
    );
  });

  it("should upload images and create post", async () => {
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    vi.mocked(uploadService.uploadMultiplePostImages).mockResolvedValue([
      "url1",
    ]);
    vi.mocked(createPostAction).mockResolvedValue({
      isSuccess: true,
      data: { id: "p-1" },
    } as any);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "With Image", files: [file] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(uploadService.uploadMultiplePostImages).toHaveBeenCalledWith([file]);
    expect(createPostAction).toHaveBeenCalledWith("With Image", ["url1"]);
  });

  it("should handle API errors", async () => {
    vi.mocked(createPostAction).mockResolvedValue({
      isSuccess: false,
      message: "Server Error",
    } as any);

    const { result } = renderHook(() => useCreatePostMutation(), {
      wrapper: getWrapper(),
    });

    result.current.mutate({ content: "Error", files: [] });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Server Error");
  });
});
