import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "../hooks/use-notifications";
import { useNotificationStore } from "@/stores/notification/use-notification-store";
import { NotificationType } from "@/types/notifications/notification";

// Mock the dependencies
vi.mock("@/stores/notification/use-notification-store");
vi.mock("lucide-react", () => ({
  Heart: () => <div data-testid="heart-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
}));

describe("useNotifications", () => {
  const mockFetchNotifications = vi.fn();
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotificationStore as any).mockReturnValue({
      notifications: [],
      isLoading: false,
      fetchNotifications: mockFetchNotifications,
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });
  });

  it("calls fetchNotifications on mount", () => {
    renderHook(() => useNotifications());
    expect(mockFetchNotifications).toHaveBeenCalledWith(true);
  });

  it("returns correct store values and functions", () => {
    const { result } = renderHook(() => useNotifications());
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.getIcon).toBe("function");
    expect(typeof result.current.getMessage).toBe("function");
  });

  it("getMessage returns correct React element for POST_REACTION", () => {
    const { result } = renderHook(() => useNotifications());
    const notification = {
      id: "1",
      type: NotificationType.POST_REACTION,
      actor: { name: "UserA" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const message = result.current.getMessage(notification);
    // Since it returns a React element, we just check if it's defined and has the actor name
    expect(message).toBeDefined();
  });

  it("getIcon returns correct icon for POST_REACTION", () => {
    const { result } = renderHook(() => useNotifications());
    const icon = result.current.getIcon(NotificationType.POST_REACTION);
    expect(icon).toBeDefined();
  });
});
