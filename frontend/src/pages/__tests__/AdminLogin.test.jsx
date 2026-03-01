import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLogin from '../AdminLogin';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderAdminLogin = (apiMock, setUserMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, setUser: setUserMock }}>
                <AdminLogin />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders admin login form properly', () => {
    const apiMock = { post: vi.fn() };
    renderAdminLogin(apiMock, vi.fn());

    expect(screen.getByText(/Admin Sign In/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as admin/i })).toBeInTheDocument();
});

test('handles successful admin login', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { user: { id: 1, role: 'admin', username: 'admin' }, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderAdminLogin(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in as admin/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/admin_login.php', {
            username: 'admin',
            password: 'password123'
        });
        expect(setUserMock).toHaveBeenCalledWith({ id: 1, role: 'admin', username: 'admin' });
    });
});

test('displays error message on failed admin login', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { success: false, message: 'Invalid admin credentials' }
        })
    };
    renderAdminLogin(apiMock, vi.fn());

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in as admin/i }));

    await waitFor(() => {
        expect(screen.getByText('Invalid admin credentials')).toBeInTheDocument();
    });
});
