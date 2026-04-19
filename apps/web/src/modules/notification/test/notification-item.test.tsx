import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationItem } from "../components/notification-item";
import { NotificationType } from "@/types/notifications/notification";

// Mock UserAvatar since it's a complex component
vi.mock("@/modules/shared/components/common/user-avatar", () => ({
  UserAvatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
}));

describe("NotificationItem", () => {
  const mockNotification = {
    id: "1",
    type: NotificationType.POST_REACTION,
    isRead: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recipientId: "r1",
    actorId: "u1",
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
        message="John Doe đã bày tỏ cảm xúc"
        onMarkAsRead={() => {}}
      />
    );

    expect(screen.getByText("John Doe đã bày tỏ cảm xúc")).toBeDefined();
    expect(screen.getByText(/"Hello world"/)).toBeDefined();
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("calls onMarkAsRead when an unread item is clicked", () => {
    const handleMark = vi.fn();
    render(
      <NotificationItem
        notification={mockNotification}
        icon={<span>❤️</span>}
        message="Message"
        onMarkAsRead={handleMark}
      />
    );

    fireEvent.click(screen.getByText("Message").closest("div")!);
    expect(handleMark).toHaveBeenCalledWith("1");
  });

  it("does not call onMarkAsRead when a read item is clicked", () => {
    const handleMark = vi.fn();
    render(
      <NotificationItem
        notification={{ ...mockNotification, isRead: true }}
        icon={<span>❤️</span>}
        message="Message"
        onMarkAsRead={handleMark}
      />
    );

    fireEvent.click(screen.getByText("Message").closest("div")!);
    expect(handleMark).not.toHaveBeenCalled();
  });
});
