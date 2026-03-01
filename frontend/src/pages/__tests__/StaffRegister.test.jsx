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

    expect(screen.getByText(/Personnel & Fleet Operator Registry/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter full legal name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter active mobile number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/create secure password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit registration payload/i })).toBeInTheDocument();
});

test('handles successful staff registration', async () => {
    const apiMock = {
        post: vi.fn().mockResolvedValue({
            data: { success: true, message: 'Success' } // Registration redirects to login
        })
    };
    const setUserMock = vi.fn();
    renderStaffRegister(apiMock, setUserMock);

    fireEvent.change(screen.getByPlaceholderText(/enter full legal name/i), { target: { value: 'Staff User' } });
    fireEvent.change(screen.getByPlaceholderText(/enter active mobile number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/create secure password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /submit registration payload/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/staff_register.php', expect.objectContaining({
            mobile: '1234567890',
            password: 'password123',
            name: 'Staff User'
        }));
    });
});
