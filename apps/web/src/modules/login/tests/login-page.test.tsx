import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authClient } from "@/libs/auth-client";
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

vi.mock("@/libs/auth-client", () => ({
  authClient: {
    $fetch: vi.fn(),
    signIn: {
      social: vi.fn(),
    },
    useSession: vi.fn(() => ({ data: null, isPending: false })),
  },
}));

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

    vi.mocked(authClient.$fetch).mockResolvedValue({} as never);
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
