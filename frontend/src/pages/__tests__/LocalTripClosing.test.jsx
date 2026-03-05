import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LocalTripClosing from '../LocalTripClosing';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockVehicles = [
    { v_id: 'V001', b_id: '301', b_name: 'Alice Smith', p_city: 'City Center', d_place: 'Airport', v_type: 'Sedan' },
    { v_id: 'V002', b_id: '302', b_name: 'Bob Jones', p_city: 'Station', d_place: 'Hotel', v_type: 'SUV' }
];

const mockTripData = {
    v_id: 'V001',
    b_name: 'Alice Smith',
    m_no: '9876543210',
    open_km: '12000',
    ac_type: '0',
    p_city: 'City Center',
    d_place: 'Airport'
};

const mockUser = { emp_id: 'EMP001' };

const renderLocalTripClosing = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, user: mockUser }}>
                <LocalTripClosing />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders Manual Trip Settlement page', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/local_trip_closing.php') return Promise.resolve({ data: mockVehicles });
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            return Promise.resolve({ data: [] });
        })
    };
    renderLocalTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Manual Trip Settlement')).toBeInTheDocument();
    });
});

test('renders vehicle cards for active local trips', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/local_trip_closing.php') return Promise.resolve({ data: mockVehicles });
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            return Promise.resolve({ data: [] });
        })
    };
    renderLocalTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('V001')).toBeInTheDocument();
});

test('shows closing form after clicking Manual Close button', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/local_trip_closing.php') return Promise.resolve({ data: mockVehicles });
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            if (url.includes('?v_id=')) return Promise.resolve({ data: mockTripData });
            return Promise.resolve({ data: [] });
        })
    };
    renderLocalTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    const closeButtons = screen.getAllByRole('button', { name: /manual close/i });
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
        expect(screen.getByText(/Final Closing Odometer/i)).toBeInTheDocument();
    });
});

test('shows empty state when no vehicles on local trip', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/local_trip_closing.php') return Promise.resolve({ data: [] });
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            return Promise.resolve({ data: [] });
        })
    };
    renderLocalTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/no dispatched vehicles waiting to be closed/i)).toBeInTheDocument();
    });
});
