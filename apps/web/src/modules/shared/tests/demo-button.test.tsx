import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoButton } from "../components/custom-button/demo-button";

describe("DemoButton", () => {
  it("should render a button with correct text", () => {
    render(<DemoButton />);

    expect(screen.getByRole("button", { name: "Demo Button" })).toBeInTheDocument();
  });

  it("should have correct base classes", () => {
    render(<DemoButton />);

    const button = screen.getByRole("button", { name: "Demo Button" });
    expect(button).toHaveClass("bg-blue-500");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("p-2");
    expect(button).toHaveClass("rounded-md");
  });

  it("should be clickable", () => {
    const handleClick = vi.fn();
    render(<DemoButton />);

    const button = screen.getByRole("button", { name: "Demo Button" });
    button.onclick = handleClick;

    button.click();

    expect(handleClick).toHaveBeenCalled();
  });

  it("should render as a button element", () => {
    render(<DemoButton />);

    const button = screen.getByRole("button", { name: "Demo Button" });
    expect(button.tagName).toBe("BUTTON");
  });
});
