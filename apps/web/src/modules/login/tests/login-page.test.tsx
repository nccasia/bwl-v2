import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authService } from "@/services/login";
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

vi.mock("@/services/login");

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

    vi.mocked(authService.createSession).mockResolvedValue({} as never);
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
