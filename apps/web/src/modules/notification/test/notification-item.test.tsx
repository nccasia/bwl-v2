/**
 * @vitest-environment jsdom
 */
import {
  render,
  screen,
  fireEvent,
} from "../../../test/test-utils.test";
import { describe, it, expect, vi } from "vitest";
import { NotificationItem } from "../components/notification-item";
import { NotificationType } from "../../../types/notifications/notification";

// Mock sub-components to simplify testing NotificationItem
vi.mock("../components/notification-message", () => ({
  NotificationMessage: () => (
    <div data-testid="notification-message">Mock Message</div>
  ),
}));

vi.mock("../components/notification-actor-avatar", () => ({
  NotificationActorAvatar: () => <div data-testid="actor-avatar" />,
}));

describe("NotificationItem", () => {
  const mockNotification: import("../../../types/notifications/notification").Notification =
    {
      id: "1",
      type: NotificationType.POST_REACTION,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipientId: "r1",
      actors: ["u1"],
      actorCount: 1,
      entityId: "e1",
      entityType: "POST",
      actor: {
        id: "u1",
        name: "John Doe",
        image: "",
      },
      body: "Hello world",
    };

  it("renders notification content correctly", () => {
    render(
      <NotificationItem
        notification={mockNotification}
        icon={<span data-testid="icon">❤️</span>}
        onMarkAsRead={() => {}}
      />,
    );

    expect(screen.getByTestId("notification-message")).toBeDefined();
    expect(screen.getByText(/"Hello world"/)).toBeDefined();
    expect(screen.getByTestId("icon")).toBeDefined();
    expect(screen.getByTestId("actor-avatar")).toBeDefined();
  });

  it("calls onMarkAsRead when an unread item is clicked", () => {
    const handleMark = vi.fn();
    render(
      <NotificationItem
        notification={mockNotification}
        icon={<span>❤️</span>}
        onMarkAsRead={handleMark}
      />,
    );

    fireEvent.click(screen.getByTestId("notification-message").closest("div")!);
    expect(handleMark).toHaveBeenCalledWith("1");
  });

  it("does not call onMarkAsRead when a read item is clicked", () => {
    const handleMark = vi.fn();
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        icon={<span>❤️</span>}
        onMarkAsRead={handleMark}
      />,
    );

    fireEvent.click(screen.getByTestId("notification-message").closest("div")!);
    expect(handleMark).not.toHaveBeenCalled();
  });
});
