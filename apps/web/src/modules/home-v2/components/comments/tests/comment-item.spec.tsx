import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentItem } from "../components/comment-item";
import * as hooks from "../hooks";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the hooks
vi.mock("../hooks", () => ({
  useCommentItem: vi.fn(),
  useCommentReplies: vi.fn(),
  useCommentsInput: vi.fn(),
  useCommentsSection: vi.fn(),
}));

// Mock CommentInput to avoid complex rendering in recursive tests
vi.mock("../components", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    CommentInput: () => <div data-testid="comment-input" />,
  };
});

describe("CommentItem", () => {
  const mockComment = {
    id: "comment-1",
    content: "This is a comment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    postId: "post-1",
    authorId: "user-1",
    isEdited: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockState = {
    t: (key: string) => key,
    showReplyInput: false,
    showReplies: false,
    replies: [],
    hasReplies: false,
    isLoadingReplies: false,
    author: {
      id: "user-1",
      username: "testuser",
      avatar: "avatar.jpg",
    },
    authorName: "testuser",
    isLiked: false,
    likesCount: 0,
    isReacting: false,
  };

  const mockHandlers = {
    toggleReplyInput: vi.fn(),
    toggleReplies: vi.fn(),
    handleReplySuccess: vi.fn(),
    onLike: vi.fn(),
  };

  it("renders comment content and author name", () => {
    (hooks.useCommentItem as any).mockReturnValue({
      state: mockState,
      handlers: mockHandlers,
    });

    render(<CommentItem comment={mockComment} />);
    
    expect(screen.getByText("This is a comment")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("calls toggleReplyInput when reply button is clicked", () => {
    (hooks.useCommentItem as any).mockReturnValue({
      state: mockState,
      handlers: mockHandlers,
    });

    render(<CommentItem comment={mockComment} />);
    const replyButton = screen.getByText("reply");
    
    fireEvent.click(replyButton);
    expect(mockHandlers.toggleReplyInput).toHaveBeenCalled();
  });

  it("shows reply input when showReplyInput is true", () => {
    (hooks.useCommentItem as any).mockReturnValue({
      state: { ...mockState, showReplyInput: true },
      handlers: mockHandlers,
    });

    render(<CommentItem comment={mockComment} />);
    expect(screen.getByTestId("comment-input")).toBeInTheDocument();
  });

  it("shows replies when showReplies is true", () => {
    const mockReplies = [{ id: "reply-1", content: "This is a reply" }];
    
    (hooks.useCommentItem as any).mockImplementation((c: any) => {
      if (c.id === "comment-1") {
        return {
          state: { ...mockState, showReplies: true, replies: mockReplies, hasReplies: true },
          handlers: mockHandlers,
        };
      }
      return {
        state: { ...mockState, authorName: "replyuser" },
        handlers: mockHandlers,
      };
    });

    render(<CommentItem comment={mockComment} />);
    expect(screen.getByText("This is a reply")).toBeInTheDocument();
  });

  it("shows loading state for replies", () => {
    (hooks.useCommentItem as any).mockReturnValue({
      state: { ...mockState, showReplies: true, hasReplies: true, isLoadingReplies: true },
      handlers: mockHandlers,
    });

    render(<CommentItem comment={mockComment} />);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("calls onLike when like button is clicked", () => {
    (hooks.useCommentItem as any).mockReturnValue({
      state: mockState,
      handlers: mockHandlers,
    });

    render(<CommentItem comment={mockComment} />);
    const likeButton = screen.getByText("like");
    
    fireEvent.click(likeButton);
    expect(mockHandlers.onLike).toHaveBeenCalled();
  });
});
