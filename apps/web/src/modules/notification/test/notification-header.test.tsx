/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "../../../test/test-utils.test";
import { describe, it, expect, vi } from "vitest";
import { NotificationHeader } from "../components/notification-header";

describe("NotificationHeader", () => {
  it("renders the notification title", () => {
    render(
      <NotificationHeader onMarkAllAsRead={() => {}} showMarkAll={false} />,
    );
    expect(screen.getByText("Thông báo")).toBeDefined();
  });

  it("shows the mark all as read button when showMarkAll is true", () => {
    const handleMarkAll = vi.fn();
    render(
      <NotificationHeader onMarkAllAsRead={handleMarkAll} showMarkAll={true} />,
    );

    const button = screen.getByText("Đánh dấu tất cả là đã đọc");
    expect(button).toBeDefined();

    fireEvent.click(button);
    expect(handleMarkAll).toHaveBeenCalledTimes(1);
  });

  it("hides the mark all as read button when showMarkAll is false", () => {
    render(
      <NotificationHeader onMarkAllAsRead={() => {}} showMarkAll={false} />,
    );
    expect(screen.queryByText("Đánh dấu tất cả là đã đọc")).toBeNull();
  });
});
