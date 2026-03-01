import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockAdminUser = { id: 1, name: 'Admin Name', role: 'admin' };
const mockStaffUser = { id: 2, name: 'Staff Name', role: 'staff', department: 'Operations' };

const mockStats = {
    total_customers: 150,
    total_bookings: 300,
    completed_bookings: 250,
    on_trip: 10,
    advance_booking: 20,
    total_drivers: 50,
    active_drivers: 40,
    inactive_drivers: 10,
    cancelled_booking: 5
};

const renderDashboard = (userMock, apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ user: userMock, api: apiMock }}>
                <Dashboard />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders admin dashboard correctly', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: { stats: mockStats } })
    };

    renderDashboard(mockAdminUser, apiMock);

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Admin Name')[0]).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument(); // total_customers
    expect(screen.getAllByText('300')[0]).toBeInTheDocument(); // total_bookings
    expect(screen.getByText('250')).toBeInTheDocument(); // completed_bookings
    expect(screen.getAllByText('10')[0]).toBeInTheDocument();  // on_trip
    expect(screen.getByText('20')).toBeInTheDocument();  // advance_booking
});

test('renders staff dashboard correctly', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: { stats: mockStats } })
    };

    renderDashboard(mockStaffUser, apiMock);

    await waitFor(() => {
        expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Staff Name')[0]).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
    expect(screen.getAllByText('300')[0]).toBeInTheDocument(); // total_bookings
    expect(screen.getAllByText('10')[0]).toBeInTheDocument();  // on_trip
    expect(screen.getByText('20')).toBeInTheDocument();  // advance_booking
});
