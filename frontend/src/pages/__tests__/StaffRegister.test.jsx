import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffRegister from '../StaffRegister';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderStaffRegister = (apiMock, setUserMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, setUser: setUserMock }}>
                <StaffRegister />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders staff register form properly', () => {
    const apiMock = { post: vi.fn() };
    renderStaffRegister(apiMock, vi.fn());

    expect(screen.getByText(/Create Staff Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter mobile number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register as Staff/i })).toBeInTheDocument();
});

test('handles successful staff registration', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { success: true, message: 'Success' }
        })
    };
    const setUserMock = vi.fn();
    renderStaffRegister(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/Enter full name/i), { target: { value: 'Staff User' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter email address/i), { target: { value: 'staff@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter mobile number/i), { target: { value: '1234567890' } });
    // Fill both password fields
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register as Staff/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/staff_register.php', expect.objectContaining({
            mobile: '1234567890',
            password: 'password123',
            name: 'Staff User'
        }));
    });
});
