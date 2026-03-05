import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ToastContext globally so all components can render in tests
// without needing to wrap them in <ToastProvider>
vi.mock('./context/ToastContext', () => ({
    useToast: () => vi.fn(),
    ToastProvider: ({ children }) => children,
}));
