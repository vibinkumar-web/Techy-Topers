import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockAdminUser = { name: 'Admin User', role: 'admin', emp_id: 'EMP001' };
const mockStaffUser = { name: 'Staff Member', role: 'staff', emp_id: 'EMP002' };

const renderNavbar = (user = null, logout = vi.fn()) => render(
    <MemoryRouter>
        <AuthContext.Provider value={{ user, logout }}>
            <Navbar />
        </AuthContext.Provider>
    </MemoryRouter>
);

test('renders brand logo and name', () => {
    renderNavbar();
    expect(screen.getByText('TaxiPro')).toBeInTheDocument();
});

test('shows Login and Register links when no user is logged in', () => {
    renderNavbar(null);
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
});

test('shows nav links and logout button when user is logged in', () => {
    renderNavbar(mockAdminUser);
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
});

test('displays user initial in avatar chip', () => {
    renderNavbar(mockAdminUser);
    // Avatar initial appears in both desktop chip and mobile avatar elements
    const avatars = screen.getAllByText('A');
    expect(avatars.length).toBeGreaterThanOrEqual(1);
    expect(avatars[0]).toBeInTheDocument();
});

test('calls logout when logout button clicked', () => {
    const logoutMock = vi.fn();
    renderNavbar(mockAdminUser, logoutMock);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(logoutMock).toHaveBeenCalled();
});

test('shows admin-specific dropdown for admin user', () => {
    renderNavbar(mockAdminUser);
    expect(screen.getByRole('button', { name: /admin/i })).toBeInTheDocument();
});

test('does not show admin dropdown for staff user', () => {
    renderNavbar(mockStaffUser);
    const adminBtn = screen.queryByRole('button', { name: /^admin$/i });
    expect(adminBtn).not.toBeInTheDocument();
});

test('opens Operations dropdown and shows sub-links', () => {
    renderNavbar(mockAdminUser);
    const opsBtn = screen.getByRole('button', { name: /operations/i });
    fireEvent.click(opsBtn);

    // Check for links that only appear in the Operations dropdown
    expect(screen.getByRole('link', { name: /adv\. bookings/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^trip closing$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /on trip/i })).toBeInTheDocument();
});

test('opens Fleet & Staff dropdown and shows sub-links', () => {
    renderNavbar(mockAdminUser);
    const fleetBtn = screen.getByRole('button', { name: /fleet & staff/i });
    fireEvent.click(fleetBtn);

    // Links unique to this dropdown
    expect(screen.getByRole('link', { name: /vehicle in & out/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /attached vehicles/i })).toBeInTheDocument();
});

test('shows Ledger nav link', () => {
    renderNavbar(mockAdminUser);
    expect(screen.getByRole('link', { name: /ledger/i })).toBeInTheDocument();
});

test('opens Admin dropdown and shows admin links', () => {
    renderNavbar(mockAdminUser);
    const adminBtn = screen.getByRole('button', { name: /admin/i });
    fireEvent.click(adminBtn);

    expect(screen.getByRole('link', { name: /tariff master/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /user rights/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
});
