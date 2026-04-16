import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { Stories } from "../components/stories";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("Stories component", () => {
  describe("Rendering states", () => {
    it("should render loading state", () => {
      render(<Stories authors={[]} isLoading={true} />);

      expect(screen.getByText("topContributors")).toBeInTheDocument();
      expect(screen.queryByText("noContributors")).not.toBeInTheDocument();
    });

    it("should render empty state", () => {
      render(<Stories authors={[]} isLoading={false} />);

      expect(screen.getByText("topContributors")).toBeInTheDocument();
      expect(screen.getByText("noContributors")).toBeInTheDocument();
    });

    it("should render list of contributors", () => {
      const mockAuthors = [
        { id: "1", name: "Alice", pts: 1500 },
        { id: "2", name: "Bob", pts: 900 },
      ];

      render(<Stories authors={mockAuthors} isLoading={false} />);

      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("1500 pts")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("900 pts")).toBeInTheDocument();
    });
  });
});
