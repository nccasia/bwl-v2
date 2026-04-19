import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommentInput } from "../components/comment-input";
import * as hooks from "../hooks";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the hooks
vi.mock("../hooks", () => ({
  useCommentsInput: vi.fn(),
  useCommentItem: vi.fn(),
  useCommentReplies: vi.fn(),
  useCommentsSection: vi.fn(),
}));

describe("CommentInput", () => {
  const mockProps = {
    postId: "post-123",
  };

  const mockUser = {
    id: "user-1",
    username: "testuser",
    avatar: "avatar.jpg",
  };

  const mockHandlers = {
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault();
      fn({ content: "test" });
    },
    onSubmit: vi.fn(),
    handleKeyDown: vi.fn(),
  };

  const mockState = {
    t: (key: string) => key,
    user: mockUser,
    register: vi.fn(() => ({})),
    handleSubmit: mockHandlers.handleSubmit,
    onSubmit: mockHandlers.onSubmit,
    handleKeyDown: mockHandlers.handleKeyDown,
    isSubmitDisabled: false,
    isPending: false,
    content: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders null when user is not logged in", () => {
    (hooks.useCommentsInput as any).mockReturnValue(null);

    const { container } = render(<CommentInput {...mockProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly when user is logged in", () => {
    (hooks.useCommentsInput as any).mockReturnValue({
      state: mockState,
    });

    const { container } = render(<CommentInput {...mockProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(container.querySelector(".avatar")).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted", () => {
    (hooks.useCommentsInput as any).mockReturnValue({
      state: mockState,
    });

    render(<CommentInput {...mockProps} />);
    
    // Simulating form submission
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(mockHandlers.onSubmit).toHaveBeenCalled();
  });

  it("disables submit button when isSubmitDisabled is true", () => {
    (hooks.useCommentsInput as any).mockReturnValue({
      state: { ...mockState, isSubmitDisabled: true },
    });

    render(<CommentInput {...mockProps} />);
    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });

  it("calls handleKeyDown when a key is pressed in the textarea", () => {
    (hooks.useCommentsInput as any).mockReturnValue({
      state: mockState,
    });

    render(<CommentInput {...mockProps} />);
    const textarea = screen.getByRole("textbox");
    
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(mockHandlers.handleKeyDown).toHaveBeenCalled();
  });
});
