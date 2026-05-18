import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useImageViewer } from "../hooks/use-image-viewer";
import { useImageViewerStore } from "@/stores/shared/image-viewer-store";
import type { ImageViewerPost } from "@/types/image-viewer";

const mockImages = ["img1.jpg", "img2.jpg", "img3.jpg"];
const mockPost: ImageViewerPost = {
  id: "post-1",
  content: "Test post",
  createdAt: new Date().toISOString(),
  images: mockImages,
  author: { id: "user-1", displayName: "User 1", avatar: "" },
};

describe("useImageViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useImageViewerStore.getState().close();
  });

  it("initializes with the correct index", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 1);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    expect(result.current.state.currentIndex).toBe(1);
    expect(result.current.state.currentImage).toBe("img2.jpg");
  });

  it("navigates to next image", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 0);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    act(() => result.current.handlers.goToNext());
    expect(result.current.state.currentIndex).toBe(1);
  });

  it("wraps around to first image from last", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 2);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    act(() => result.current.handlers.goToNext());
    expect(result.current.state.currentIndex).toBe(0);
  });

  it("navigates to previous image", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 2);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    act(() => result.current.handlers.goToPrev());
    expect(result.current.state.currentIndex).toBe(1);
  });

  it("wraps around to last image from first", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 0);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    act(() => result.current.handlers.goToPrev());
    expect(result.current.state.currentIndex).toBe(2);
  });

  it("toggles zoom state", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 0);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    expect(result.current.state.isZoomed).toBe(false);
    act(() => result.current.handlers.toggleZoom());
    expect(result.current.state.isZoomed).toBe(true);
    act(() => result.current.handlers.toggleZoom());
    expect(result.current.state.isZoomed).toBe(false);
  });

  it("resets index and zoom when isOpen changes to true", () => {
    const { result } = renderHook(() => useImageViewer());
    
    expect(result.current.state.isOpen).toBe(false);
    
    act(() => {
      useImageViewerStore.getState().open(mockPost, 0);
    });
    
    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.isZoomed).toBe(false);
    expect(result.current.state.isOpen).toBe(true);
  });

  it("reports correct totalImages and navigation availability", () => {
    act(() => {
      useImageViewerStore.getState().open(mockPost, 0);
    });
    
    const { result } = renderHook(() => useImageViewer());
    
    expect(result.current.state.totalImages).toBe(3);
    expect(result.current.state.hasPrev).toBe(true);
    expect(result.current.state.hasNext).toBe(true);
  });
});
