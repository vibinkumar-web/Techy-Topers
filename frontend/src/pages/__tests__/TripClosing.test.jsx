import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TripClosing from '../TripClosing';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockBookings = [
    { b_id: '401', b_name: 'Alice Brown', m_no: '9876543210', p_city: 'City A', d_place: 'Destination B', v_id: 'V001' },
    { b_id: '402', b_name: 'Bob White', m_no: '8765432109', p_city: 'Station', d_place: 'Hotel', v_id: 'V002' }
];

const mockTripDetails = {
    b_id: '401',
    b_name: 'Alice Brown',
    m_no: '9876543210',
    v_id: 'V001',
    v_no: 'KA-01-AB-1234',
    d_name: 'Driver One',
    open_km: '12000',
    p_city: 'City A',
    d_place: 'Destination B'
};

const mockUser = { emp_id: 'EMP001' };

const renderTripClosing = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, user: mockUser }}>
                <TripClosing />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders Outstation Trip Closing page title', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            if (url === '/closing.php') return Promise.resolve({ data: mockBookings });
            return Promise.resolve({ data: [] });
        })
    };
    renderTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Outstation Trip Closing')).toBeInTheDocument();
    });
});

test('renders active trip cards from API', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            if (url === '/closing.php') return Promise.resolve({ data: mockBookings });
            return Promise.resolve({ data: [] });
        })
    };
    renderTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob White')).toBeInTheDocument();
    expect(screen.getByText('#401')).toBeInTheDocument();
    expect(apiMock.get).toHaveBeenCalledWith('/closing.php');
});

test('opens trip closing form when Close Trip button is clicked', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            if (url === '/closing.php') return Promise.resolve({ data: mockBookings });
            if (url.includes('/closing.php?b_id=')) return Promise.resolve({ data: mockTripDetails });
            return Promise.resolve({ data: [] });
        })
    };
    renderTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    });

    const closeBtns = screen.getAllByRole('button', { name: /close trip/i });
    fireEvent.click(closeBtns[0]);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/closing.php?b_id=401');
    });
});

test('shows empty state when no active trips to close', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
            if (url === '/closing.php') return Promise.resolve({ data: [] });
            return Promise.resolve({ data: [] });
        })
    };
    renderTripClosing(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Outstation Trip Closing')).toBeInTheDocument();
    });

    // No trip cards, shows empty placeholder
    expect(screen.queryByText(/Close Trip/i)).not.toBeInTheDocument();
});
