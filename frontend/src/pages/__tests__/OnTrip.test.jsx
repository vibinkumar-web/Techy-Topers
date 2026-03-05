import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnTrip from '../OnTrip';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockTrips = [
    { b_id: '301', v_id: 'V001', v_type: 'Sedan', b_name: 'Alice Brown', m_no: '9876543210', p_city: 'City A', d_place: 'Airport', bookin_time: '10:00 AM', assign_time: '09:45 AM', open_km: '12500' },
    { b_id: '302', v_id: 'V002', v_type: 'SUV', b_name: 'Bob White', m_no: '8765432109', p_city: 'Station', d_place: 'Hotel', bookin_time: '02:00 PM', assign_time: '01:45 PM', open_km: '' }
];

const renderOnTrip = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <OnTrip />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders Live Operations page title', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockTrips }) };
    renderOnTrip(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Live Operations (On-Trip)')).toBeInTheDocument();
    });
});

test('shows loading state in trips table while fetching', async () => {
    const apiMock = { get: vi.fn().mockReturnValue(new Promise(() => {})) };
    renderOnTrip(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/Synchronizing active dispatches/i)).toBeInTheDocument();
    });
});

test('renders active trips from API', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockTrips }) };
    renderOnTrip(apiMock);

    await waitFor(() => {
        expect(screen.getByText('#301')).toBeInTheDocument();
    });

    expect(screen.getByText('#302')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.getByText('Bob White')).toBeInTheDocument();
    expect(apiMock.get).toHaveBeenCalledWith('/ontrip.php');
});

test('shows empty state when no active trips', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderOnTrip(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/All vehicles are currently vacant/i)).toBeInTheDocument();
    });
});

test('renders Active Control Center panel', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockTrips }) };
    renderOnTrip(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Active Control Center')).toBeInTheDocument();
    });
});
