import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AssignLater from '../AssignLater';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const renderAssignLater = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock, user: { id: 1 } }}>
                <AssignLater />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

const mockDrivers = [
    { id: 1, id_emp: 'EMP100', emp_mobile: '1234567890', vacant_place: 'City Center', login_time: '08:00 AM', v_no: 'KA-01-AB-1234', v_type: 'Sedan' },
    { id: 2, id_emp: 'EMP200', emp_mobile: '0987654321', vacant_place: 'Airport', login_time: '09:00 AM', v_no: 'KA-02-CD-5678', v_type: 'SUV' }
];

const mockBookings = [
    { id: 1, b_id: 'B101', pickup: '10:00 AM', p_city: 'City A', d_place: 'City B', v_type: 'Sedan', b_name: 'John Doe', m_no: '1111111111', t_type: 'Local', ac_type: '1', to_whom: 'customer', r_status: 'Confirmed' }
];

test('renders assign later page and loads data', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('action=drivers')) return Promise.resolve({ data: mockDrivers });
            if (url.includes('action=bookings')) return Promise.resolve({ data: mockBookings });
            return Promise.resolve({ data: [] });
        })
    };

    renderAssignLater(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Manual Trip Assignment')).toBeInTheDocument();
    });

    expect(screen.getByText('#B101')).toBeInTheDocument();
    expect(screen.getByText('EMP100')).toBeInTheDocument();
    expect(screen.getByText('EMP200')).toBeInTheDocument();
});

test('handles manual assignment', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('action=drivers')) return Promise.resolve({ data: mockDrivers });
            if (url.includes('action=bookings')) return Promise.resolve({ data: mockBookings });
            return Promise.resolve({ data: [] });
        }),
        post: vi.fn().mockResolvedValue({ data: { success: true } })
    };

    // spy on window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

    renderAssignLater(apiMock);

    await waitFor(() => {
        expect(screen.getByText('#B101')).toBeInTheDocument();
    });

    // Select booking
    fireEvent.click(screen.getByText('#B101'));

    // Select driver
    fireEvent.click(screen.getByText('EMP100'));

    // Click assign button
    const assignBtn = screen.getByRole('button', { name: /confirm assignment workflow/i });
    expect(assignBtn).not.toBeDisabled();
    fireEvent.click(assignBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/assign_later.php', expect.objectContaining({
            b_id: 'B101',
            driver_id: 'EMP100'
        }));
        expect(alertSpy).toHaveBeenCalledWith('Assignment Successful!');
    });

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
});

test('search filters drivers', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('action=drivers')) return Promise.resolve({ data: mockDrivers });
            if (url.includes('action=bookings')) return Promise.resolve({ data: mockBookings });
            return Promise.resolve({ data: [] });
        })
    };

    renderAssignLater(apiMock);

    await waitFor(() => {
        expect(screen.getByText('EMP100')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/find driver id/i);
    fireEvent.change(searchInput, { target: { value: 'EMP200' } });

    expect(screen.queryByText('EMP100')).not.toBeInTheDocument();
    expect(screen.getByText('EMP200')).toBeInTheDocument();
});
