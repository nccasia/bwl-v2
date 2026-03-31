import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@/stores/login/auth-store";
import { LoginPage } from "../pages/login-page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    entries: vi.fn().mockReturnValue([]),
  }),
}));

// Mock zustand store
vi.mock("@/stores/login/auth-store");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "Wrapper";

  return Wrapper;
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the useAuthStore hook which takes a selector
    vi.mocked(useAuthStore).mockImplementation(((selector?: (state: { setSession: ReturnType<typeof vi.fn> }) => unknown) => {
      const state = { setSession: vi.fn() };
      return selector ? selector(state) : state;
    }) as never);
  });

  it("should render the page title Welcome to BWL", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Welcome to BWL")).toBeInTheDocument();
  });

  it("should render the Mezon login button", () => {
    render(<LoginPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Login with Mezon")).toBeInTheDocument();
  });
});
