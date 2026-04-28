import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageViewer } from "../components/image-viewer";
import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import type { ImageViewerPost } from "@/types/image-viewer";

vi.mock("../components/image-panel", () => ({
  ImagePanel: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="image-panel">
      <button onClick={onClose} data-testid="close-btn">Close</button>
    </div>
  ),
}));

vi.mock("../components/comment-sidebar", () => ({
  CommentSidebar: () => <div data-testid="comment-sidebar" />,
}));

const mockPost: ImageViewerPost = {
  id: "post-1",
  content: "Test post content",
  createdAt: new Date().toISOString(),
  images: ["img1.jpg", "img2.jpg"],
  author: {
    id: "user-1",
    displayName: "Test User",
    avatar: "avatar.jpg",
  },
};

describe("ImageViewer", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useImageViewerStore.getState().close();
    });
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <ImageViewer onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders both panels when isOpen is true", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost);
    });
    render(<ImageViewer onClose={mockOnClose} />);
    expect(screen.getByTestId("image-panel")).toBeInTheDocument();
    expect(screen.getByTestId("comment-sidebar")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost);
    });
    render(<ImageViewer onClose={mockOnClose} />);
    const backdrop = document.querySelector("[aria-hidden='true']") as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button inside panel is clicked", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost);
    });
    render(<ImageViewer onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId("close-btn"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("has dialog role for accessibility", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost);
    });
    render(<ImageViewer onClose={mockOnClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
