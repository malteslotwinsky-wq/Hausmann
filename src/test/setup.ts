import '@testing-library/jest-dom/vitest';

// Mock 'server-only' to prevent errors when importing server modules in tests
vi.mock('server-only', () => ({}));
