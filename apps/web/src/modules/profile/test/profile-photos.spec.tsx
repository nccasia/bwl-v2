import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfilePhotos } from "../components/profile-photos";

describe("ProfilePhotos", () => {
  it("renders images correctly", () => {
    const images = ["img1.jpg", "img2.jpg", "img3.jpg"];
    render(<ProfilePhotos images={images} />);

    const renderedImages = screen.getAllByRole("img");
    expect(renderedImages).toHaveLength(3);
    expect(renderedImages[0]).toBeInTheDocument();
    expect(renderedImages[0]).toHaveAttribute("src", "img1.jpg");
  });


  it("applies featured classes to the first image", () => {
    const images = ["img1.jpg", "img2.jpg"];
    render(<ProfilePhotos images={images} />);

    const firstImage = screen.getByAltText("User photo 1");
    const firstItem = firstImage.parentElement;
    
    expect(firstItem).toHaveClass("col-span-2");
    expect(firstItem).toHaveClass("row-span-2");
  });


  it("shows empty message when no images are provided", () => {
    render(<ProfilePhotos images={[]} />);
    expect(screen.getByText("Người dùng này chưa có ảnh nào.")).toBeInTheDocument();
  });

  it("handles null or undefined images prop", () => {
    // @ts-expect-error - testing invalid prop
    render(<ProfilePhotos images={null} />);
    expect(screen.getByText("Người dùng này chưa có ảnh nào.")).toBeInTheDocument();
  });

});
