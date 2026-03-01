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

    expect(screen.getByText(/Administrator Provisioning/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter legal name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter authorized email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create cryptographic secret/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /initialize admin context/i })).toBeInTheDocument();
});

test('handles successful admin registration', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { success: true, user: { id: 1, role: 'admin', username: 'adminuser' }, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderAdminRegister(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/enter legal name/i), { target: { value: 'Admin User' } });
    fireEvent.change(screen.getByPlaceholderText(/enter administrative alias/i), { target: { value: 'adminuser' } });
    fireEvent.change(screen.getByPlaceholderText(/create cryptographic secret/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /initialize admin context/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/admin_register.php', expect.objectContaining({
            username: 'adminuser',
            password: 'password123',
            name: 'Admin User'
        }));
        expect(setUserMock).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin', username: 'adminuser' }));
    });
});
