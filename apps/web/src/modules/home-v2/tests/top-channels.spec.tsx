import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TopChannels } from "../components/top-channels";
import { useTopChannels } from "../hooks/use-top-channels";

vi.mock("next-intl", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTranslations: () => (key: string, values?: any) => {
    if (values) {
      if (key === "postsCount") return `${values.count} posts`;
      return `${key} ${JSON.stringify(values)}`;
    }
    return key;
  },
}));

vi.mock("../hooks/use-top-channels", () => ({
  useTopChannels: vi.fn(),
}));

describe("TopChannels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering State", () => {
    it("should render loading state", () => {
      (useTopChannels as object as ReturnType<typeof vi.fn>).mockReturnValue({
        state: { isLoadingTop: true, topChannels: [] },
      });

      render(<TopChannels />);

      expect(screen.getByText("topChannels")).toBeInTheDocument();
      expect(screen.queryByText("noTopChannels")).not.toBeInTheDocument();
    });

    it("should render empty state", () => {
      (useTopChannels as object as ReturnType<typeof vi.fn>).mockReturnValue({
        state: { isLoadingTop: false, topChannels: [] },
      });

      render(<TopChannels />);

      expect(screen.getByText("noTopChannels")).toBeInTheDocument();
    });

    it("should render list of channels", () => {
      const mockChannels = [
        { id: "1", name: "nextjs", postCount: 15 },
        { id: "2", name: "react", postCount: 8 },
      ];

      (useTopChannels as object as ReturnType<typeof vi.fn>).mockReturnValue({
        state: { isLoadingTop: false, topChannels: mockChannels },
      });

      render(<TopChannels />);

      expect(screen.getByText("#nextjs")).toBeInTheDocument();
      expect(screen.getByText("15 posts")).toBeInTheDocument();
      expect(screen.getByText("#react")).toBeInTheDocument();
      expect(screen.getByText("8 posts")).toBeInTheDocument();
    });
  });
});
