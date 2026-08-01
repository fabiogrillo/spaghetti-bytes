import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// App calls the API on mount to resolve the auth session. jsdom has no server,
// so stub the module rather than let every test log a network failure.
vi.mock("./Api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("mounts and renders the home route without throwing", async () => {
    render(<App />);
    // <main> is rendered by the shell regardless of which route resolves,
    // so it proves the tree mounted rather than asserting on page copy.
    expect(document.querySelector("#root, main, nav")).toBeTruthy();
    expect(screen.queryAllByRole("link").length).toBeGreaterThan(0);
  });
});
