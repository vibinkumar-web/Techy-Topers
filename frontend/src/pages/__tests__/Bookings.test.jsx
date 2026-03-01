import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Bookings from '../Bookings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockBookings = [
    {
        b_id: '101',
        pickup: '2023-10-27 10:00:00',
        p_city: 'City Center',
        d_place: 'Airport',
        b_name: 'Alice Smith',
        m_no: '9876543210',
        v_type: 'Sedan',
        ac_type: '1',
        assign: '0'
    },
    {
        b_id: '102',
        pickup: '2023-10-28 14:00:00',
        p_city: 'North Station',
        d_place: 'Hotel Grand',
        b_name: 'Bob Johnson',
        m_no: '5551234567',
        v_type: 'SUV',
        ac_type: '0',
        assign: '1'
    }
];

const mockUser = { emp_id: 'EMP001', name: 'Test User' };

const renderBookings = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, user: mockUser }}>
                <Bookings />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders loadings state initially then displays bookings', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockBookings })
    };

    renderBookings(apiMock);

    expect(screen.getByText(/loading booking records/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText(/Central Bookings Management/i)).toBeInTheDocument();
    });

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('#102')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
});

test('opens modal when clicking register new booking', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] })
    };

    renderBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/Central Bookings Management/i)).toBeInTheDocument();
    });

    const newBookingBtn = screen.getByRole('button', { name: /register new booking/i });
    fireEvent.click(newBookingBtn);

    expect(screen.getByText('Customer Identity Profile')).toBeInTheDocument();
});

test('displays no bookings message when api returns empty', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] })
    };

    renderBookings(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/no active bookings currently registered/i)).toBeInTheDocument();
    });
});
