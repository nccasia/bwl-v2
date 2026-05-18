/**
 * @vitest-environment jsdom
 */
import { render, screen } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationList } from "../pages/notification-list";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationType } from "../../../types/notifications/notification";

// Mock hooks and sub-components
vi.mock("../hooks/use-notifications");
vi.mock("../components/notification-item", () => ({
  NotificationItem: ({ notification }: any) => (
    <div data-testid="notification-item">{notification.id}</div>
  ),
}));
vi.mock("../components/notification-header", () => ({
  NotificationHeader: ({ onMarkAllAsRead }: any) => (
    <button onClick={onMarkAllAsRead}>Đánh dấu tất cả là đã đọc</button>
  ),
}));
vi.mock("../components/notification-empty", () => ({
  NotificationEmpty: () => <div>Chưa có thông báo nào dành cho bạn</div>,
}));
vi.mock("../components/notification-skeleton", () => ({
  NotificationSkeleton: () => <div data-testid="notification-skeleton" />,
}));

describe("NotificationListPage", () => {
  const mockMarkAllAsRead = vi.fn();
  const mockMarkAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when no notifications", () => {
    (useNotifications as any).mockReturnValue({
      notifications: [],
      isLoading: false,
      getIcon: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);
    expect(
      screen.getByText("Chưa có thông báo nào dành cho bạn"),
    ).toBeDefined();
  });

  it("renders notification list when data exists", () => {
    (useNotifications as any).mockReturnValue({
      notifications: [
        { id: "1", type: NotificationType.POST_REACTION, isRead: false },
      ],
      isLoading: false,
      getIcon: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);
    expect(screen.getAllByTestId("notification-item")).toHaveLength(1);
  });

  it("calls markAllAsRead when header button is clicked", async () => {
    (useNotifications as any).mockReturnValue({
      notifications: [
        { id: "1", type: NotificationType.POST_REACTION, isRead: false },
      ],
      isLoading: false,
      getIcon: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);

    const button = screen.getByText("Đánh dấu tất cả là đã đọc");
    button.click();

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });
});
