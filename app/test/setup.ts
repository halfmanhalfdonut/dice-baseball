// Global test setup for Vitest (jsdom environment)
// Export any global test helpers here.

// Example: clear localStorage before each test run (redundant with per-test beforeEach but useful globally)
import { beforeEach } from 'vitest';

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch (e) {
    // noop
  }
});
