import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffAttendance from '../StaffAttendance';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockAttendance = [
    { id: 1, id_emp: 'EMP001', emp_name: 'John Doe', login_time: '2023-11-01 09:00:00' }
];

const mockStaffDetails = {
    emp_id: 'EMP001',
    name: 'John Doe',
    mobile: '1234567890'
};

const mockSalaryData = {
    total_duration: '40:00:00',
    total_decimal: '40.0',
    shifts: [
        { login_time: '2023-11-01 09:00:00', logout: '2023-11-01 17:00:00', duration_formatted: '08:00' }
    ]
};

const renderStaffAttendance = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <StaffAttendance />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders attendance table with existing logins', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/attendance.php') return Promise.resolve({ data: mockAttendance });
            return Promise.resolve({ data: {} });
        })
    };

    renderStaffAttendance(apiMock);

    await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getAllByText('EMP001').length).toBeGreaterThan(0);
});

test('fetches staff details on staff ID input', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/attendance.php') return Promise.resolve({ data: [] });
            if (url.includes('/staff.php')) return Promise.resolve({ data: mockStaffDetails });
            if (url.includes('/staff_report.php')) return Promise.resolve({ data: mockSalaryData });
            return Promise.resolve({ data: {} });
        })
    };

    renderStaffAttendance(apiMock);

    const input = screen.getByPlaceholderText(/Enter Staff ID/i);
    fireEvent.change(input, { target: { value: 'EMP001' } });

    await waitFor(() => {
        const nameInput = screen.getByPlaceholderText(/Will appear automatically/i);
        expect(nameInput.value).toBe('John Doe');
        expect(screen.getByText('Current Month Salary Hours')).toBeInTheDocument();
        expect(screen.getByText('40:00:00')).toBeInTheDocument();
    });
});

test('handles clock in (login)', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Logged in' } })
    };

    renderStaffAttendance(apiMock);

    const idInput = screen.getByPlaceholderText(/Enter Staff ID/i);
    fireEvent.change(idInput, { target: { value: 'EMP002' } });

    const clockInBtn = screen.getByTitle('Clock In');
    fireEvent.click(clockInBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/attendance.php', expect.objectContaining({
            action: 'login',
            id_emp: 'EMP002'
        }));
    });
});
