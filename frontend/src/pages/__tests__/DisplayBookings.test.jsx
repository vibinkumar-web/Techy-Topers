import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DisplayBookings from '../DisplayBookings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockBookings = [
    { b_id: '501', b_name: 'Alice Green', m_no: '9876543210', pickup: '2024-01-15 10:00:00', p_city: 'City A', d_place: 'Airport', v_type: 'Sedan', booking_status: 'Closed' },
    { b_id: '502', b_name: 'Bob Blue', m_no: '8765432109', pickup: '2024-01-16 14:00:00', p_city: 'Station', d_place: 'Hotel', v_type: 'SUV', booking_status: 'Closed' }
];

const renderDisplayBookings = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <DisplayBookings />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('shows loading state initially', () => {
    const apiMock = { get: vi.fn().mockReturnValue(new Promise(() => {})) };
    renderDisplayBookings(apiMock);

    expect(screen.getByText(/Loading bookings/i)).toBeInTheDocument();
});

test('renders All Bookings page with data from API', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockBookings }) };
    renderDisplayBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText('All Bookings')).toBeInTheDocument();
    });

    expect(screen.getByText('Alice Green')).toBeInTheDocument();
    expect(screen.getByText('Bob Blue')).toBeInTheDocument();
    expect(screen.getByText('#501')).toBeInTheDocument();
    expect(screen.getByText('#502')).toBeInTheDocument();
    expect(apiMock.get).toHaveBeenCalledWith('/bookings.php?all=1');
});

test('shows record count after loading', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockBookings }) };
    renderDisplayBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/2 records/i)).toBeInTheDocument();
    });
});

test('handles empty bookings list', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderDisplayBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText('All Bookings')).toBeInTheDocument();
    });

    expect(screen.getByText(/0 records/i)).toBeInTheDocument();
});
