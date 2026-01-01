import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AbandonedCarts from '../components/AbandonedCarts';
import * as Hook from '../hooks/useAbandonedCarts';

// Mock the hook
vi.mock('../hooks/useAbandonedCarts', () => ({
    useAbandonedCarts: vi.fn(),
}));

describe('AbandonedCarts', () => {
    it('renders loading state', () => {
        (Hook.useAbandonedCarts as any).mockReturnValue({
            isLoading: true,
            data: [],
        });

        render(<AbandonedCarts />);
        // Check for skeleton elements or structure
        const skeletons = document.getElementsByClassName('animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders empty state when no carts', () => {
        (Hook.useAbandonedCarts as any).mockReturnValue({
            isLoading: false,
            data: [],
        });

        render(<AbandonedCarts />);
        expect(screen.getByText('No abandoned carts found')).toBeInTheDocument();
    });

    it('renders carts list', () => {
        const mockCarts = [
            {
                id: '1',
                customer_email: 'test@example.com',
                total_price: 100,
                currency: 'USD',
                abandoned_at: new Date().toISOString(),
                items: [],
            },
        ];

        (Hook.useAbandonedCarts as any).mockReturnValue({
            isLoading: false,
            data: mockCarts,
        });

        render(<AbandonedCarts />);
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });
});
