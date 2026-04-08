import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreatePostDialog } from "../hooks/use-create-post-dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "@/libs/auth-client";
import { postService } from "../../../services/post/post-service";
import { useToast } from "@/modules/shared/hooks/toast";

vi.mock("@/libs/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

vi.mock("../../../services/post/post-service", () => ({
  postService: {
    createPost: vi.fn(),
  },
}));

vi.mock("@/modules/shared/hooks/toast", () => ({
  useToast: vi.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

describe("useCreatePostDialog", () => {
  let mockShowToast: ReturnType<typeof vi.fn>;
  let mockOnOpenChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockShowToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({
      success: mockShowToast,
    } as unknown as ReturnType<typeof useToast>);

    mockOnOpenChange = vi.fn();

    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: {
          id: "u-1",
          name: "John Doe",
          image: "avatar.jpg",
        },
      },
    } as ReturnType<typeof authClient.useSession>);

    vi.mocked(postService.createPost).mockResolvedValue({} as Awaited<ReturnType<typeof postService.createPost>>);
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

  describe("Initial State", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      expect(result.current.state.postContent).toBe("");
      expect(result.current.state.isConfirmOpen).toBe(false);
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.user?.id).toBe("u-1");
    });
  });

  describe("Form Behaviors", () => {
    it("should update postContent and become dirty when typing", async () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.setPostContent("Hello world!");
      });

      await waitFor(() => {
        expect(result.current.state.postContent).toBe("Hello world!");
      });
      expect(result.current.state.isDirty).toBe(true);
    });
  });

  describe("Dialog Closing Behavior", () => {
    it("should close dialog directly if not dirty", () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.handleCloseAttempt(false);
      });

      expect(result.current.state.isConfirmOpen).toBe(false);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("should open confirm alert if dirty and closing", async () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.setPostContent("Unsaved text");
      });

      await waitFor(() =>
        expect(result.current.state.postContent).toBe("Unsaved text"),
      );

      act(() => {
        result.current.handles.handleCloseAttempt(false);
      });

      expect(result.current.state.isConfirmOpen).toBe(true);
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("Submission", () => {
    it("should call postService.createPost with user info on submit", async () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.setPostContent("New post");
      });
      await waitFor(() =>
        expect(result.current.state.postContent).toBe("New post"),
      );

      act(() => {
        result.current.handles.onSubmit({ content: "New post" });
      });

      await waitFor(() => {
        expect(postService.createPost).toHaveBeenCalledWith("New post", {
          id: "u-1",
          name: "John Doe",
          image: "avatar.jpg",
        });
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        "Bài viết của bạn đã được đăng thành công!",
      );
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(result.current.state.isConfirmOpen).toBe(false);
    });

    it("should throw error when unauthenticated in create post", async () => {
      vi.mocked(authClient.useSession).mockReturnValue({
        data: null,
      } as ReturnType<typeof authClient.useSession>);

      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.onSubmit({ content: "New post" });
      });

      await waitFor(() => {
        expect(postService.createPost).not.toHaveBeenCalled();
      });
    });
  });

  describe("Handle Discard", () => {
    it("should reset everything and close dialog", async () => {
      const { result } = renderHook(
        () =>
          useCreatePostDialog({ isOpen: true, onOpenChange: mockOnOpenChange }),
        { wrapper: getWrapper() },
      );

      act(() => {
        result.current.handles.setIsConfirmOpen(true);
        result.current.handles.setPostContent("Trash");
      });

      await waitFor(() => {
        expect(result.current.state.postContent).toBe("Trash");
      });

      act(() => {
        result.current.handles.handleDiscard();
      });

      await waitFor(() => {
        expect(result.current.state.postContent).toBe("");
      });
      expect(result.current.state.isConfirmOpen).toBe(false);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
