import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useProfilePost } from "../hooks/use-profile-post";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getPostsAction } from "@/services/post";

vi.mock("@/services/post", () => ({
  getPostsAction: vi.fn(),
  mapApiPostToUiPost: vi.fn((post) => ({
    id: post.id,
    images: post.images || [],
    author: post.author,
  })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("useProfilePost", () => {
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

  it("should fetch posts and extract unique images", async () => {
    const mockPosts = [
      { id: "1", images: ["img1.jpg", "img2.jpg"] },
      { id: "2", images: ["img2.jpg", "img3.jpg"] },
    ];

    vi.mocked(getPostsAction).mockResolvedValue({
      isSuccess: true,
      data: mockPosts,
    } as unknown as ReturnType<typeof getPostsAction>);

    const { result } = renderHook(() => useProfilePost("author-1"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.posts?.length).toBe(2);
    expect(result.current.state.allImages).toEqual(["img1.jpg", "img2.jpg", "img3.jpg"]);
    expect(result.current.state.hasPosts).toBe(true);
    expect(getPostsAction).toHaveBeenCalledWith(1, 100, { authorId: "author-1" });
  });

  it("should handle empty posts", async () => {
    vi.mocked(getPostsAction).mockResolvedValue({
      isSuccess: true,
      data: [],
    } as unknown as ReturnType<typeof getPostsAction>);

    const { result } = renderHook(() => useProfilePost("author-1"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.posts).toEqual([]);
    expect(result.current.state.allImages).toEqual([]);
    expect(result.current.state.hasPosts).toBe(false);
  });

  it("should handle fetch errors", async () => {
    vi.mocked(getPostsAction).mockResolvedValue({
      isSuccess: false,
    } as unknown as ReturnType<typeof getPostsAction>);

    const { result } = renderHook(() => useProfilePost("author-1"), {
      wrapper: getWrapper(),
    });

    await waitFor(() => expect(result.current.state.isError).toBe(true));
    expect(result.current.state.error).toBeInstanceOf(Error);
  });
});
