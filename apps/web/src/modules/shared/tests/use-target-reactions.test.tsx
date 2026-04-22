/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTargetReactions } from "../hooks/reactions/use-target-reactions";
import { ReactionTargetType } from "../../../types/reaction";
import * as reactionServices from "../../../services/reaction";

// Mock dependencies
vi.mock("../../../services/reaction", () => ({
  getReactionsByTargetAction: vi.fn(),
}));

describe("useTargetReactions", () => {
  const mockTargetId = "target-1";
  const mockTargetType = ReactionTargetType.Post;
  const mockReactions = [
    {
      id: "1",
      userId: "u1",
      targetId: "target-1",
      targetType: ReactionTargetType.Post,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch reactions for a target", async () => {
    (reactionServices.getReactionsByTargetAction as any).mockResolvedValue({
      isSuccess: true,
      data: mockReactions,
    });

    const { result } = renderHook(() =>
      useTargetReactions(mockTargetId, mockTargetType),
    );

    await waitFor(() => {
      expect(result.current.reactions).toEqual(mockReactions);
    });

    expect(reactionServices.getReactionsByTargetAction).toHaveBeenCalledWith(
      mockTargetType,
      mockTargetId,
    );
  });
});
