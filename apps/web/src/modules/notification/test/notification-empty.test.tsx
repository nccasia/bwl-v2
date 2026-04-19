import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationEmpty } from "../components/notification-empty";

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Bell: () => <div data-testid="bell-icon" />,
}));

describe("NotificationEmpty", () => {
  it("renders the empty state message and icon", () => {
    render(<NotificationEmpty />);
    
    expect(screen.getByTestId("bell-icon")).toBeDefined();
    expect(screen.getByText("Chưa có thông báo nào dành cho bạn")).toBeDefined();
  });
});
