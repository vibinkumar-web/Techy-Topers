import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../Layout';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockUser = { name: 'Admin User', role: 'admin', emp_id: 'EMP001' };

const renderLayout = (user = null) => {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <AuthContext.Provider value={{ user, logout: vi.fn() }}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<div>Dashboard Content</div>} />
                    </Route>
                </Routes>
            </AuthContext.Provider>
        </MemoryRouter>
    );
};

test('renders Layout with Navbar and outlet content', () => {
    renderLayout(mockUser);

    // Navbar is rendered (TaxiPro brand)
    expect(screen.getByText('TaxiPro')).toBeInTheDocument();
    // Child route content is rendered via Outlet
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
});

test('renders Layout without crashing when no user is logged in', () => {
    renderLayout(null);

    expect(screen.getByText('TaxiPro')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    // Login/Register links shown when no user
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
});
