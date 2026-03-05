import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdvanceBookings from '../AdvanceBookings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockBookings = [
    { b_id: '201', cus_name: 'John Doe', cus_mobile: '9876543210', pickup: '2024-01-15 10:00:00', p_city: 'City A', d_place: 'Airport', v_types: 'Sedan', q: 'V001', assign: '0' },
    { b_id: '202', cus_name: 'Jane Smith', cus_mobile: '8765432109', pickup: '2024-01-16 14:00:00', p_city: 'Station', d_place: 'Hotel', v_types: 'SUV', q: 'V002', assign: '0' }
];

const renderAdvanceBookings = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <AdvanceBookings />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('shows loading state initially', () => {
    const apiMock = { get: vi.fn().mockReturnValue(new Promise(() => {})) };
    renderAdvanceBookings(apiMock);

    expect(screen.getByText(/loading advance bookings/i)).toBeInTheDocument();
});

test('renders advance bookings list from API', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockBookings }) };
    renderAdvanceBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Advanced booking')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(apiMock.get).toHaveBeenCalledWith('/advance_bookings.php');
});

test('shows empty state when no advance bookings', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderAdvanceBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/No unassigned advance bookings/i)).toBeInTheDocument();
    });
});

test('handles API returning bookings nested under bookings key', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: { bookings: mockBookings } }) };
    renderAdvanceBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
});
