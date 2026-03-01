import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffLogin from '../StaffLogin';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderStaffLogin = (apiMock, setUserMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, setUser: setUserMock }}>
                <StaffLogin />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders staff login form properly', () => {
    const apiMock = { post: vi.fn() };
    renderStaffLogin(apiMock, vi.fn());

    expect(screen.getByText(/Staff \/ Driver Sign In/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email or phone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in to portal/i })).toBeInTheDocument();
});

test('handles successful staff login', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { user: { id: 2, role: 'staff', email: 'staff@test.com' }, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderStaffLogin(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/enter email or phone/i), { target: { value: 'staff@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in to portal/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/staff_login.php', {
            email: 'staff@test.com',
            password: 'password123'
        });
        expect(setUserMock).toHaveBeenCalledWith({ id: 2, role: 'staff', email: 'staff@test.com' });
    });
});

test('displays error message on failed staff login', async () => {
    const apiMock = {
        post: vi.fn().mockRejectedValue({
            response: { data: { message: 'Invalid staff credentials' } }
        })
    };
    renderStaffLogin(apiMock, vi.fn());

    fireEvent.change(screen.getByPlaceholderText(/enter email or phone/i), { target: { value: 'staff@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in to portal/i }));

    await waitFor(() => {
        expect(screen.getByText('Invalid staff credentials')).toBeInTheDocument();
    });
});
