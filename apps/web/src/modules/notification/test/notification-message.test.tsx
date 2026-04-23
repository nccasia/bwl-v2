/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "../../../test/test-utils.test";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationMessage } from "../components/notification-message";
import { NotificationType } from "../../../types/notifications/notification";
import { useGetUser } from "../../shared/hooks/common/use-get-user";
import { useAuthStore } from "../../../stores/login/auth-store";

// Mock hooks and components
vi.mock("../../shared/hooks/common/use-get-user");
vi.mock("../../../stores/login/auth-store");
vi.mock("@heroui/react", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

describe("NotificationMessage", () => {
  const mockNotification = {
    id: "1",
    type: NotificationType.Reaction,
    actors: ["u1"],
    recipientId: "r1",
    createdAt: new Date().toISOString(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockImplementation((selector: any) =>
      selector({
        user: { id: "r1", userName: "me" },
      }),
    );
  });

  it("renders skeleton when loading", () => {
    (useGetUser as any).mockReturnValue({ isLoading: true });
    render(<NotificationMessage notification={mockNotification} />);
    expect(screen.getByTestId("skeleton")).toBeDefined();
  });

  it("renders reaction message correctly", async () => {
    (useGetUser as any).mockImplementation((id: string) => {
      if (id === "u1") return { data: { userName: "John" }, isLoading: false };
      if (id === "r1") return { data: { userName: "me" }, isLoading: false };
      return { data: null, isLoading: false };
    });

    render(<NotificationMessage notification={mockNotification} />);

    await waitFor(() => {
      expect(screen.getByText("John")).toBeDefined();
      expect(screen.getByText(/đã thích bài viết của/)).toBeDefined();
      expect(screen.getByText(/bạn/)).toBeDefined();
    });
  });

  it("renders comment message correctly", async () => {
    (useGetUser as any).mockImplementation((id: string) => {
      if (id === "u1") return { data: { userName: "John" }, isLoading: false };
      return { data: null, isLoading: false };
    });

    render(
      <NotificationMessage
        notification={{
          ...mockNotification,
          type: NotificationType.Comment,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("John")).toBeDefined();
      expect(screen.getByText(/đã bình luận về bài viết của/)).toBeDefined();
    });
  });
});
