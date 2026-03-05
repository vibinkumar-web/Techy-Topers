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

    expect(screen.getByText(/Staff Sign In/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In as Staff/i })).toBeInTheDocument();
});

test('handles successful staff login', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { user: { id: 2, role: 'staff', email: 'staff@test.com' }, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderStaffLogin(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), { target: { value: 'staff@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Staff/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/staff_login.php', {
            username: 'staff@test.com',
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

    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), { target: { value: 'staff@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In as Staff/i }));

    await waitFor(() => {
        expect(screen.getByText('Invalid staff credentials')).toBeInTheDocument();
    });
});
