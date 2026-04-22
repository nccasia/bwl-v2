/**
 * @vitest-environment jsdom
 */
import { renderHook } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useReaction } from "../hooks/reactions/use-reaction";
import { ReactionTargetType } from "../../../types/reaction";
import * as reactionServices from "../../../services/reaction";
import { useAuthStore } from "../../../stores/login/auth-store";
import { useLoginRequiredStore } from "../../../stores/shared/login-required-store";
import { useQueryClient } from "@tanstack/react-query";

// Mock dependencies
vi.mock("../../../services/reaction", () => ({
  likeTargetAction: vi.fn(),
  unlikeTargetAction: vi.fn(),
}));
vi.mock("../../../stores/login/auth-store", () => ({
  useAuthStore: Object.assign(vi.fn(), {
    getState: vi.fn(),
  }),
}));
vi.mock("../../../stores/shared/login-required-store");

describe("useReaction", () => {
  const mockTargetId = "target-1";
  const mockTargetType = ReactionTargetType.Post;
  const mockOpenLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useLoginRequiredStore as any).mockReturnValue(mockOpenLogin);

    // Default mock for useAuthStore
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ user: { id: "user-1" } }),
    );
    (useAuthStore.getState as any).mockReturnValue({ user: { id: "user-1" } });
  });

  it("should open login modal if user is not authenticated", async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ user: null }),
    );

    const { result } = renderHook(() => useReaction());

    await result.current.handleToggleReaction(
      mockTargetId,
      mockTargetType,
      false,
    );

    expect(mockOpenLogin).toHaveBeenCalled();
    expect(reactionServices.likeTargetAction).not.toHaveBeenCalled();
  });

  it("should call likeTargetAction when isLiked is false", async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ user: { id: "user-1" } }),
    );
    (reactionServices.likeTargetAction as any).mockResolvedValue({
      isSuccess: true,
    });

    const { result } = renderHook(() => useReaction());

    await result.current.handleToggleReaction(
      mockTargetId,
      mockTargetType,
      false,
    );

    expect(reactionServices.likeTargetAction).toHaveBeenCalledWith({
      targetId: mockTargetId,
      targetType: mockTargetType,
    });
  });

  it("should call unlikeTargetAction when isLiked is true", async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ user: { id: "user-1" } }),
    );
    (reactionServices.unlikeTargetAction as any).mockResolvedValue({
      isSuccess: true,
    });

    const { result } = renderHook(() => useReaction());

    await result.current.handleToggleReaction(
      mockTargetId,
      mockTargetType,
      true,
    );

    expect(reactionServices.unlikeTargetAction).toHaveBeenCalledWith(
      mockTargetType,
      mockTargetId,
    );
  });

  it("optimistic update should add reaction to cache when liking", async () => {
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({ user: { id: "user-1" } }),
    );
    (useAuthStore.getState as any).mockReturnValue({ user: { id: "user-1" } });
    (reactionServices.likeTargetAction as any).mockResolvedValue({
      isSuccess: true,
    });

    const { result } = renderHook(() => {
      const queryClient = useQueryClient();
      return {
        reaction: useReaction(),
        queryClient,
      };
    });

    const queryKey = ["reactions", mockTargetType, mockTargetId];
    result.current.queryClient.setQueryData(queryKey, []);

    // Perform like
    await result.current.reaction.handleToggleReaction(
      mockTargetId,
      mockTargetType,
      false,
    );

    const cachedData = result.current.queryClient.getQueryData(
      queryKey,
    ) as any[];
    expect(cachedData).toHaveLength(1);
    expect(cachedData[0].userId).toBe("user-1");
  });
});
