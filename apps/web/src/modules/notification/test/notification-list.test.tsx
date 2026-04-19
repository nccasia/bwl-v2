import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationList } from "../pages/notification-list";
import { useNotifications } from "../hooks/use-notifications";

// Mock the hook
vi.mock("../hooks/use-notifications");

// Mock sub-components to focus on orchestration
vi.mock("../components/notification-header", () => ({
  NotificationHeader: () => <div data-testid="header" />,
}));
vi.mock("../components/notification-item", () => ({
  NotificationItem: () => <div data-testid="notification-item" />,
}));
vi.mock("../components/notification-empty", () => ({
  NotificationEmpty: () => <div data-testid="empty-state" />,
}));
vi.mock("../components/notification-skeleton", () => ({
  NotificationSkeleton: () => <div data-testid="skeleton" />,
}));

describe("NotificationList", () => {
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton while loading and no notifications", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotifications as any).mockReturnValue({
      notifications: [],
      isLoading: true,
      getIcon: vi.fn(),
      getMessage: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);
    expect(screen.getByTestId("skeleton")).toBeDefined();
  });

  it("shows empty state when no notifications and not loading", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotifications as any).mockReturnValue({
      notifications: [],
      isLoading: false,
      getIcon: vi.fn(),
      getMessage: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);
    expect(screen.getByTestId("empty-state")).toBeDefined();
    expect(screen.getByTestId("header")).toBeDefined();
  });

  it("renders a list of notifications", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useNotifications as any).mockReturnValue({
      notifications: [{ id: "1" }, { id: "2" }],
      isLoading: false,
      getIcon: vi.fn(),
      getMessage: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
    });

    render(<NotificationList />);
    expect(screen.getAllByTestId("notification-item")).toHaveLength(2);
    expect(screen.getByTestId("header")).toBeDefined();
  });
});
