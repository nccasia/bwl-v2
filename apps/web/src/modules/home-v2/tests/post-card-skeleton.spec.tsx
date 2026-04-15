import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostCardSkeleton } from "../components/post-card-skeleton";

describe("PostCardSkeleton", () => {
  describe("Rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<PostCardSkeleton />);

      const mainDiv = container.querySelector("div");
      expect(mainDiv).toBeInTheDocument();
      expect(mainDiv).toHaveClass(
        "rounded-3xl bg-content1 border border-divider p-5 mb-6 w-full space-y-4",
      );
    });
  });
});
