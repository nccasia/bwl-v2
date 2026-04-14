import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Map()),
  cookies: vi.fn(async () => new Map()),
}));

afterEach(() => {
  cleanup();
});
