import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCreatePostStore } from "../../../stores/post/create-post-store";
import { act } from "@testing-library/react";

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn((file) => `blob:${file.name}`);
global.URL.revokeObjectURL = vi.fn();

describe("useCreatePostStore", () => {
  beforeEach(() => {
    act(() => {
      useCreatePostStore.getState().reset();
    });
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const state = useCreatePostStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.content).toBe("");
    expect(state.files).toEqual([]);
    expect(state.previewUrls).toEqual([]);
  });

  it("should open and close dialog", () => {
    act(() => {
      useCreatePostStore.getState().open();
    });
    expect(useCreatePostStore.getState().isOpen).toBe(true);

    act(() => {
      useCreatePostStore.getState().close();
    });
    expect(useCreatePostStore.getState().isOpen).toBe(false);
  });

  it("should set content", () => {
    act(() => {
      useCreatePostStore.getState().setContent("test content");
    });
    expect(useCreatePostStore.getState().content).toBe("test content");
  });

  it("should add files and generate preview URLs", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    act(() => {
      useCreatePostStore.getState().addFiles([file]);
    });

    const state = useCreatePostStore.getState();
    expect(state.files).toHaveLength(1);
    expect(state.files[0]).toBe(file);
    expect(state.previewUrls).toHaveLength(1);
    expect(state.previewUrls[0]).toBe("blob:test.png");
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("should remove file and revoke URL", () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    act(() => {
      useCreatePostStore.getState().addFiles([file]);
    });
    
    act(() => {
      useCreatePostStore.getState().removeFile(0);
    });

    const state = useCreatePostStore.getState();
    expect(state.files).toHaveLength(0);
    expect(state.previewUrls).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test.png");
  });

  it("should reset state and revoke all URLs", () => {
    const file1 = new File(["test1"], "1.png", { type: "image/png" });
    const file2 = new File(["test2"], "2.png", { type: "image/png" });
    
    act(() => {
      useCreatePostStore.getState().open();
      useCreatePostStore.getState().setContent("dirty");
      useCreatePostStore.getState().addFiles([file1, file2]);
    });

    act(() => {
      useCreatePostStore.getState().reset();
    });

    const state = useCreatePostStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.content).toBe("");
    expect(state.files).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });
});
