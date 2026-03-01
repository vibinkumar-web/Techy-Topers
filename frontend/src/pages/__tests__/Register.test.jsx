import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderRegister = (registerMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ register: registerMock }}>
                <Register />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders register form properly', () => {
    renderRegister(vi.fn());

    expect(screen.getByText(/join taxi app/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mobile/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});

test('handles successful registration', async () => {
    const registerMock = vi.fn().mockResolvedValue({ success: true });
    renderRegister(registerMock);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/mobile/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
        expect(registerMock).toHaveBeenCalledWith('John Doe', 'john@example.com', '1234567890', 'password123');
    });
});

test('displays error message on failed registration', async () => {
    const registerMock = vi.fn().mockResolvedValue({ success: false, message: 'Email already exists' });
    renderRegister(registerMock);

    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/mobile/i), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
});
