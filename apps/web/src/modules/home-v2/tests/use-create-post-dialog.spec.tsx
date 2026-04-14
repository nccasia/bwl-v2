import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreatePostDialog } from "../hooks/use-create-post-dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../../../stores/login/auth-store";
import { useCreatePostStore } from "../../../stores/post/create-post-store";
import { useCreatePostMutation } from "../hooks/use-create-post-mutation";

vi.mock("../../../stores/login/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../hooks/use-create-post-mutation", () => ({
  useCreatePostMutation: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

describe("useCreatePostDialog", () => {
  let mockMutation: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock user
    vi.mocked(useAuthStore).mockImplementation((selector: any) => 
      selector({ user: { id: "u-1", username: "John Doe" } })
    );

    // Mock mutation
    mockMutation = {
      mutate: vi.fn(),
      isPending: false,
    };
    vi.mocked(useCreatePostMutation).mockReturnValue(mockMutation);

    // Reset store
    act(() => {
      useCreatePostStore.getState().reset();
    });
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
    it("should initialize with default store state", () => {
      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      expect(result.current.state.postContent).toBe("");
      expect(result.current.state.isConfirmOpen).toBe(false);
      expect(result.current.state.isDirty).toBe(false);
      expect(result.current.state.user?.id).toBe("u-1");
    });
  });

  describe("Form Behaviors", () => {
    it("should update postContent in store when typing", async () => {
      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      act(() => {
        result.current.handles.setPostContent("Hello world!");
      });

      await waitFor(() => {
        expect(result.current.state.postContent).toBe("Hello world!");
        expect(useCreatePostStore.getState().content).toBe("Hello world!");
      });
      expect(result.current.state.isDirty).toBe(true);
    });
  });

  describe("Dialog Closing Behavior", () => {
    it("should close store directly if not dirty", () => {
      act(() => {
        useCreatePostStore.getState().open();
      });

      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      act(() => {
        result.current.handles.handleCloseAttempt(false);
      });

      expect(useCreatePostStore.getState().isOpen).toBe(false);
      expect(result.current.state.isConfirmOpen).toBe(false);
    });

    it("should open confirm alert if dirty and closing", async () => {
      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      await act(async () => {
        result.current.handles.setPostContent("Unsaved text");
      });

      await act(async () => {
        result.current.handles.handleCloseAttempt(false);
      });

      expect(result.current.state.isConfirmOpen).toBe(true);
    });
  });

  describe("Submission", () => {
    it("should call mutation.mutate with store files", async () => {
      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      await act(async () => {
        result.current.handles.setPostContent("New post");
      });

      await act(async () => {
        result.current.handles.onSubmit({ content: "New post" });
      });

      expect(mockMutation.mutate).toHaveBeenCalled();
      const mutateArgs = mockMutation.mutate.mock.calls[0][0];
      expect(mutateArgs.content).toBe("New post");
    });
  });

  describe("Handle Discard", () => {
    it("should reset store and reset form", async () => {
      const { result } = renderHook(() => useCreatePostDialog(), {
        wrapper: getWrapper(),
      });

      await act(async () => {
        result.current.handles.setPostContent("Trash");
      });

      await act(async () => {
        result.current.handles.handleDiscard();
      });

      await waitFor(() => {
        expect(useCreatePostStore.getState().content).toBe("");
        expect(result.current.state.postContent).toBe("");
      });
      expect(result.current.state.isConfirmOpen).toBe(false);
    });
  });
});
