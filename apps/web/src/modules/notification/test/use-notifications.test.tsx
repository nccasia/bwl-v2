/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationType } from "../../../types/notifications/notification";
import * as notificationService from "../../../services/notification/notification-service";
import { useAuthStore } from "../../../stores/login/auth-store";

vi.mock("../../../services/notification/notification-service");
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
      type: NotificationType.Reaction,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: { id: "user-1", accessToken: "token-1" },
        hasHydrated: true,
      }),
    );

    (notificationService.getNotifications as any).mockResolvedValue({
      isSuccess: true,
      data: mockNotifications,
      pagination: {},
    });

    (notificationService.markAsRead as any).mockResolvedValue({ isSuccess: true });
    (notificationService.markAllAsRead as any).mockResolvedValue({ isSuccess: true });
  });

  it("returns correct data after loading", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
    });
  });

  it("getIcon returns correct icon for each types", async () => {
    const { result } = renderHook(() => useNotifications());

    const reactionIcon = result.current.getIcon(NotificationType.Reaction);
    const commentIcon = result.current.getIcon(NotificationType.Comment);
    const defaultIcon = result.current.getIcon("unknown");

    expect(reactionIcon).toBeDefined();
    expect(commentIcon).toBeDefined();
    expect(defaultIcon).toBeDefined();
  });

  it("markAsRead and markAllAsRead call correct services", async () => {
    const { result } = renderHook(() => useNotifications());

    await result.current.markAsRead("1");
    expect(notificationService.markAsRead).toHaveBeenCalledWith("1");

    await result.current.markAllAsRead();
    expect(notificationService.markAllAsRead).toHaveBeenCalled();
  });
});
