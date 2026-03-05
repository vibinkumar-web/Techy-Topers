import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserRights from '../UserRights';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockStaff = [
    { emp_id: 'EMP001', name: 'John Doe', role: 'Staff' },
    { emp_id: 'EMP002', name: 'Jane Smith', role: 'Staff' }
];

const renderUserRights = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <UserRights />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders Access Privilege Matrix page', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockStaff }) };
    renderUserRights(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Access Privilege Matrix')).toBeInTheDocument();
    });
    expect(apiMock.get).toHaveBeenCalledWith('/user_rights.php');
});

test('loads staff members and renders select', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockStaff }) };
    const { container } = renderUserRights(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/user_rights.php');
    });

    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
});

test('renders permission checkboxes', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: mockStaff }) };
    const { container } = renderUserRights(apiMock);

    await waitFor(() => {
        expect(screen.getByText('Access Privilege Matrix')).toBeInTheDocument();
    });

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
});

test('saves permissions and calls API when staff selected', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaff }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Saved' } })
    };
    const { container } = renderUserRights(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/user_rights.php');
    });

    const select = container.querySelector('select');
    fireEvent.change(select, { target: { value: 'EMP001' } });

    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) fireEvent.click(checkbox);

    const saveBtn = screen.getByRole('button', { name: /commit protocol state/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/user_rights.php', expect.objectContaining({
            emp_id: 'EMP001',
            permissions: expect.any(Object)
        }));
    });
});

test('shows success message after saving permissions', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockStaff }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Saved' } })
    };
    const { container } = renderUserRights(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/user_rights.php');
    });

    const select = container.querySelector('select');
    fireEvent.change(select, { target: { value: 'EMP002' } });

    const saveBtn = screen.getByRole('button', { name: /commit protocol state/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
        expect(screen.getByText(/permissions saved successfully/i)).toBeInTheDocument();
    });
});
