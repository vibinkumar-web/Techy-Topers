import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdvanceBooking from '../AdvanceBooking';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderAdvanceBooking = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <AdvanceBooking />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

const mockBookings = [
    {
        b_id: '101',
        b_date: '2023-10-25',
        pickup: '10:00 AM',
        p_city: 'City A',
        d_place: 'City B',
        v_type: 'Sedan',
        b_name: 'John Doe',
        m_no: '1234567890'
    },
    {
        b_id: '102',
        b_date: '2023-10-26',
        pickup: '11:00 AM',
        p_city: 'Airport',
        d_place: 'Hotel',
        v_types: 'SUV',
        cus_name: 'Jane Smith',
        cus_mobile: '0987654321'
    }
];

test('renders advance bookings list from API', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockBookings })
    };

    renderAdvanceBooking(apiMock);

    expect(screen.getByText(/loading advance bookings/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Advance Bookings')).toBeInTheDocument();
    });

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('#102')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});

test('renders empty state when no advance bookings', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] })
    };

    renderAdvanceBooking(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/No future advance bookings found/i)).toBeInTheDocument();
    });
});
