/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationType } from "../../../types/notifications/notification";
import * as actions from "../../../services/notification/notification-actions-service";
import { useAuthStore } from "../../../stores/login/auth-store";

// Mock dependencies
vi.mock("../../../services/notification/notification-actions-service");
vi.mock("../../../stores/login/auth-store", () => ({
  useAuthStore: vi.fn(),
}));
vi.mock("lucide-react", () => ({
  Heart: () => <div data-testid="heart-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
  Reply: () => <div data-testid="reply-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
}));

describe("useNotifications", () => {
  const mockNotifications = [
    {
      id: "1",
      type: NotificationType.POST_REACTION,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: { id: "user-1", accessToken: "token-1" },
      }),
    );

    (actions.getNotificationsAction as any).mockResolvedValue({
      isSuccess: true,
      data: mockNotifications,
    });

    (actions.getUnreadCountAction as any).mockResolvedValue({
      isSuccess: true,
      data: { count: 5 },
    });
  });

  it("returns correct data after loading", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.unreadCount).toBe(5);
    });
  });

  it("getIcon returns correct icon for each types", async () => {
    const { result } = renderHook(() => useNotifications());

    const reactionIcon = result.current.getIcon(NotificationType.POST_REACTION);
    const commentIcon = result.current.getIcon(NotificationType.POST_COMMENT);
    const defaultIcon = result.current.getIcon("unknown");

    expect(reactionIcon).toBeDefined();
    expect(commentIcon).toBeDefined();
    expect(defaultIcon).toBeDefined();
  });

  it("markAsRead and markAllAsRead call correct actions", async () => {
    const { result } = renderHook(() => useNotifications());

    await result.current.markAsRead("1");
    expect(actions.markAsReadAction).toHaveBeenCalledWith("1");

    await result.current.markAllAsRead();
    expect(actions.markAllAsReadAction).toHaveBeenCalled();
  });
});
