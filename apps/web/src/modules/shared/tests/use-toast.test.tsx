import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../hooks/toast";
import * as herouiToast from "@heroui/react";

vi.mock("@heroui/react", () => ({
  toast: {
    success: vi.fn(),
    danger: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("success", () => {
    it("should call toast.success with message and default options", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success("Operation successful");
      });

      expect(herouiToast.toast.success).toHaveBeenCalledWith("Operation successful", {
        actionProps: {
          children: expect.anything(),
          onPress: expect.any(Function),
          variant: "tertiary",
          size: "sm",
          isIconOnly: true,
        },
        description: undefined,
        timeout: undefined,
        onClose: undefined,
      });
    });

    it("should pass description option", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success("Saved", { description: "Your changes have been saved" });
      });

      expect(herouiToast.toast.success).toHaveBeenCalledWith("Saved", expect.objectContaining({
        description: "Your changes have been saved",
      }));
    });

    it("should pass custom timeout option", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success("Quick message", { timeout: 2000 });
      });

      expect(herouiToast.toast.success).toHaveBeenCalledWith("Quick message", expect.objectContaining({
        timeout: 2000,
      }));
    });

    it("should pass onClose callback", () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success("With callback", { onClose });
      });

      expect(herouiToast.toast.success).toHaveBeenCalledWith("With callback", expect.objectContaining({
        onClose,
      }));
    });
  });

  describe("error", () => {
    it("should call toast.danger with message", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error("Something went wrong");
      });

      expect(herouiToast.toast.danger).toHaveBeenCalledWith("Something went wrong", expect.any(Object));
    });

    it("should pass error description", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.error("Failed to save", { description: "Please try again later" });
      });

      expect(herouiToast.toast.danger).toHaveBeenCalledWith("Failed to save", expect.objectContaining({
        description: "Please try again later",
      }));
    });
  });

  describe("warning", () => {
    it("should call toast.warning with message", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.warning("Warning: Low disk space");
      });

      expect(herouiToast.toast.warning).toHaveBeenCalledWith("Warning: Low disk space", expect.any(Object));
    });
  });

  describe("info", () => {
    it("should call toast.info with message", () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.info("Here is some information");
      });

      expect(herouiToast.toast.info).toHaveBeenCalledWith("Here is some information", expect.any(Object));
    });
  });
});
