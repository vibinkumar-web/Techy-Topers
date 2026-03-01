import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Assignments from '../Assignments';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockBookings = [
    { b_id: '100', booking_status: '1', pickup: '10:00 AM', b_name: 'John Doe', m_no: '1234567890', p_city: 'City A', d_place: 'City B', v_type: 'Sedan', t_type: 'Local', ac_type: '1' },
    { b_id: '101', booking_status: '0', pickup: '11:00 AM', b_name: 'Jane Smith', m_no: '0987654321', p_city: 'City C', d_place: 'City D', v_type: 'SUV', t_type: 'Outstation', ac_type: '0' }
];

const mockVehicles = [
    { v_id: 'V001', v_no: 'KA-01-AB-1234', v_brand: 'Toyota', v_model: 'Innova', d_name: 'Driver One' },
    { v_id: 'V002', v_no: 'KA-02-CD-5678', v_brand: 'Maruti', v_model: 'Swift', d_name: 'Driver Two' }
];

const renderAssignments = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <Assignments />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders assignments table with data', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/assign.php') return Promise.resolve({ data: mockBookings });
            if (url === '/vehicles.php') return Promise.resolve({ data: mockVehicles });
            return Promise.resolve({ data: [] });
        })
    };

    renderAssignments(apiMock);

    expect(screen.getByText(/Loading dispatch assignments/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Dispatch Assignments')).toBeInTheDocument();
    });

    // Check if bookings are rendered
    expect(screen.getByText('#100')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('City A')).toBeInTheDocument();

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});

test('opens dispatch modal and assigns vehicle', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url === '/assign.php') return Promise.resolve({ data: mockBookings });
            if (url === '/vehicles.php') return Promise.resolve({ data: mockVehicles });
            return Promise.resolve({ data: [] });
        }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Assigned successfully' } })
    };

    renderAssignments(apiMock);

    await waitFor(() => {
        expect(screen.getByText('#100')).toBeInTheDocument();
    });

    // Click dispatch for the first booking
    const dispatchBtns = screen.getAllByRole('button', { name: /Dispatch/i });
    fireEvent.click(dispatchBtns[0]);

    // Check if modal opens
    expect(screen.getByText('Dispatch Assignment — #100')).toBeInTheDocument();

    // Select a vehicle
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'V001' } });

    // Submit assignment
    const assignBtn = screen.getByRole('button', { name: /Exec Dispatch/i });
    fireEvent.click(assignBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/assign.php', {
            b_id: '100',
            v_id: 'V001'
        });
        // Verification that data refreshes after assignment
        expect(apiMock.get).toHaveBeenCalledTimes(3); // Initial 2 + 1 refresh
    });
});
