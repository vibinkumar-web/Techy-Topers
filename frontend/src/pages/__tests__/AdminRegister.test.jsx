import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminRegister from '../AdminRegister';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderAdminRegister = (apiMock, setUserMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, setUser: setUserMock }}>
                <AdminRegister />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders admin register form properly', () => {
    const apiMock = { post: vi.fn() };
    renderAdminRegister(apiMock, vi.fn());

    expect(screen.getByText(/Create Admin Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter email address/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Password/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Register as Admin/i })).toBeInTheDocument();
});

test('handles successful admin registration', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { success: true, user: { id: 1, role: 'admin', username: 'adminuser' }, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderAdminRegister(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'Admin User' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter email address/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter mobile number/i), { target: { value: '1234567890' } });
    // Fill both password fields
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register as Admin/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/admin_register.php', expect.objectContaining({
            password: 'password123',
            name: 'Admin User'
        }));
    });
});
