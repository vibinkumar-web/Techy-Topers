import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Bookings from '../Bookings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockUser = { emp_id: 'EMP001', name: 'Test User' };

const renderBookings = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, user: mockUser }}>
                <Bookings />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders booking registration form with title and buttons', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn() };
    const { container } = renderBookings(apiMock);

    expect(screen.getByText('Register New Booking')).toBeInTheDocument();
    expect(screen.getByText(/fill in the details below/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm & finalize booking/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    // Inputs exist in the form
    expect(container.querySelector('input[name="m_no"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="b_name"]')).toBeInTheDocument();
});

test('renders form sections and key fields', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn() };
    const { container } = renderBookings(apiMock);

    expect(screen.getByText('Customer Identity Profile')).toBeInTheDocument();
    expect(screen.getByText('Route & Operational Dynamics')).toBeInTheDocument();
    expect(container.querySelector('input[name="m_no"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="b_name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="d_place"]')).toBeInTheDocument();
});

test('submits booking form and calls API with form data', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Booking registered' } })
    };
    const { container } = renderBookings(apiMock);

    fireEvent.change(container.querySelector('input[name="m_no"]'), { target: { value: '9876543210' } });
    fireEvent.change(container.querySelector('input[name="b_name"]'), { target: { value: 'Alice Smith' } });

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/customers.php', expect.objectContaining({
            m_no: '9876543210',
            b_name: 'Alice Smith'
        }));
    });
});
