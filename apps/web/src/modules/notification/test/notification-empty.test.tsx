/**
 * @vitest-environment jsdom
 */
import { render, screen } from "../../../test/test-utils.test";
import { describe, it, expect, vi } from "vitest";
import { NotificationEmpty } from "../components/notification-empty";

// Mock Bell icon
vi.mock("lucide-react", () => ({
  Bell: () => <div data-testid="bell-icon" />,
}));

describe("NotificationEmpty", () => {
  it("renders the empty state message and icon", () => {
    render(<NotificationEmpty />);
    expect(
      screen.getByText("Chưa có thông báo nào dành cho bạn"),
    ).toBeDefined();
    expect(screen.getByTestId("bell-icon")).toBeDefined();
  });
});
