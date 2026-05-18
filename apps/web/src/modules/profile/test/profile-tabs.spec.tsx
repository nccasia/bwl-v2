import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ProfileTabs } from "../components/profile-tabs";
import { useProfilePost } from "../hooks/use-profile-post";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock browser APIs missing in JSDOM
if (typeof window !== "undefined") {
  Object.defineProperty(window.Element.prototype, "getAnimations", {
    value: vi.fn(() => []),
    writable: true,
  });
}

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const getWrapper = () => {
  const testQueryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

vi.mock("../hooks/use-profile-post", () => ({
  useProfilePost: vi.fn(),
}));

// Mock sub-components to focus on ProfileTabs logic
vi.mock("@/modules/home-v2/components/post-card", () => ({
  default: () => <div data-testid="post-card">Post Card</div>,
}));

// Removed ProfilePhotos mock to test the real component integration

// Mock @heroui/react Tabs components if necessary, 
// usually they work with jsdom but let's see.
// If they use internal logic that's hard to test without specific mocks, we might need more mocks.

describe("ProfileTabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders posts by default and handles loading state", () => {
    vi.mocked(useProfilePost).mockReturnValue({
      state: { isLoading: true, posts: [], allImages: [], hasPosts: false, isError: false, error: null },
      actions: {},
    } as ReturnType<typeof useProfilePost>);

    render(<ProfileTabs authorId="1" />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByTestId("spinner-container")).toBeInTheDocument();
  });

  it("renders posts when loading is complete", () => {

    vi.mocked(useProfilePost).mockReturnValue({
      state: { 
        isLoading: false, 
        posts: [{ id: "1" }, { id: "2" }] as unknown[], 
        allImages: [], 
        hasPosts: true,
        isError: false,
        error: null
      },
      actions: {},
    } as ReturnType<typeof useProfilePost>);

    render(<ProfileTabs authorId="1" />, {
      wrapper: getWrapper(),
    });

    expect(screen.getAllByTestId("post-card")).toHaveLength(2);
  });

  it("switches to Photos tab and renders ProfilePhotos", async () => {
    vi.mocked(useProfilePost).mockReturnValue({
      state: { 
        isLoading: false, 
        posts: [], 
        allImages: ["img1.jpg"], 
        hasPosts: false,
        isError: false,
        error: null
      },
      actions: {},
    } as ReturnType<typeof useProfilePost>);

    render(<ProfileTabs authorId="1" />, {
      wrapper: getWrapper(),
    });

    const user = userEvent.setup();

    // Switch to Photos tab (labels are "Bài viết" and "Ảnh")
    const photosTab = screen.getByText("Ảnh");
    await act(async () => {
      await user.click(photosTab);
    });

    // Verify ProfilePhotos is rendered
    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "img1.jpg");
    }, { timeout: 2000 });

  });

  it("shows empty state message in posts tab when no posts exist", () => {
    vi.mocked(useProfilePost).mockReturnValue({
      state: { 
        isLoading: false, 
        posts: [], 
        allImages: [], 
        hasPosts: false,
        isError: false,
        error: null
      },
      actions: {},
    } as ReturnType<typeof useProfilePost>);

    render(<ProfileTabs authorId="1" />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByText("Người dùng này chưa có bài viết nào.")).toBeInTheDocument();
  });

});
