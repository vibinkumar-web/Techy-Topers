import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Staff from '../Staff';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockStaffList = [
    { emp_id: 'EMP001', name: 'Alice Admin', u_type: 'Admin', mobile: '1111111111', emp_status: '0' },
    { emp_id: 'EMP002', name: 'Bob Executive', u_type: 'Call Center Executive', mobile: '2222222222', emp_status: '1' }
];

const renderStaff = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <Staff />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders staff table with directory data', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaffList })
    };

    renderStaff(apiMock);

    expect(screen.getByText(/Loading active organizational directory/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText('Personnel Directory')).toBeInTheDocument();
    });

    expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Active Scope')).toBeInTheDocument();

    expect(screen.getByText('Bob Executive')).toBeInTheDocument();
    expect(screen.getByText('Call Center Executive')).toBeInTheDocument();
    expect(screen.getByText('Access Revoked')).toBeInTheDocument();
});

test('opens modal to add new staff', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaffList })
    };

    renderStaff(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Personnel Directory')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Provision New Agent/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Provisioning New Internal Entity')).toBeInTheDocument();

    // Check for empty form fields
    const nameInput = screen.getByLabelText(/Legal Name Registry/i);
    expect(nameInput.value).toBe('');

    const statusRadio = screen.getByDisplayValue('0');
    expect(statusRadio.checked).toBe(true);
});

test('opens modal to edit existing staff', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaffList })
    };

    renderStaff(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByRole('button', { name: /Modify Config/i });
    fireEvent.click(editBtns[0]); // Click edit for Alice Admin

    expect(screen.getByText('Modifying Entity Protocol: EMP001')).toBeInTheDocument();

    // Check if form is populated
    const nameInput = screen.getByLabelText(/Legal Name Registry/i);
    expect(nameInput.value).toBe('Alice Admin');
});

test('submits new staff data', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaffList }),
        post: vi.fn().mockResolvedValue({ data: { status: 'success' } })
    };

    renderStaff(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Personnel Directory')).toBeInTheDocument();
    });

    // Open add modal
    fireEvent.click(screen.getByRole('button', { name: /Provision New Agent/i }));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Legal Name Registry/i), { target: { value: 'Charlie New' } });
    fireEvent.change(screen.getByLabelText(/Primary Telephonic Node/i), { target: { value: '3333333333' } });
    fireEvent.change(screen.getByLabelText(/Cryptographic Secret/i), { target: { value: 'secretpwd' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Initialize Agent Record/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/staff.php', expect.objectContaining({
            name: 'Charlie New',
            mobile: '3333333333',
            pwd: 'secretpwd',
            emp_status: '0'
        }));
        // Check if data is refreshed
        expect(apiMock.get).toHaveBeenCalledTimes(2);
    });
});

test('submits edited staff data', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaffList }),
        put: vi.fn().mockResolvedValue({ data: { status: 'success' } })
    };

    renderStaff(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });

    // Open edit modal for Alice
    const editBtns = screen.getAllByRole('button', { name: /Modify Config/i });
    fireEvent.click(editBtns[0]);

    // Change value
    fireEvent.change(screen.getByLabelText(/Legal Name Registry/i), { target: { value: 'Alice Edited' } });

    // Submit form
    const form = document.querySelector('form');
    if (form) {
        fireEvent.submit(form);
    } else {
        const submitBtn = screen.getByRole('button', { name: /Enforce Registry Changes/i });
        fireEvent.click(submitBtn);
    }

    await waitFor(() => {
        expect(apiMock.put).toHaveBeenCalledWith('/staff.php', expect.objectContaining({
            emp_id: 'EMP001',
            name: 'Alice Edited',
            u_type: 'Admin'
        }));
    });

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledTimes(2);
    });
});
