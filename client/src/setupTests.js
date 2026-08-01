import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";

// jsdom implements neither observer API, and framer-motion's whileInView and
// react-intersection-observer both reach for IntersectionObserver on mount.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver = MockObserver;
globalThis.ResizeObserver = MockObserver;

globalThis.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// Components fetch relative paths like "/api/stories". Node's fetch rejects
// relative URLs, so give tests an inert default they can override per-case.
beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    })
  );
});
