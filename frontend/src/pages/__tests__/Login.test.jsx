import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderLogin = (loginMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ login: loginMock }}>
                <Login />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders login form properly', () => {
    renderLogin(vi.fn());

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('handles successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue({ success: true });
    renderLogin(loginMock);

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith('admin', 'password123');
    });
});

test('displays error message on failed login', async () => {
    const loginMock = vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' });
    renderLogin(loginMock);

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: 'wrongpass' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
});
