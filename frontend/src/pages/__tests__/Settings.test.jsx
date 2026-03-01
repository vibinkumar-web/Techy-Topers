import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../Settings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockUser = { emp_id: 'EMP123', name: 'Admin', role: 'admin' };

const renderSettings = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ user: mockUser, api: apiMock }}>
                <Settings />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders settings and fetches current config', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: { smsoption: '1' } })
    };

    renderSettings(apiMock);

    expect(screen.getByText('Global Config & Preferences')).toBeInTheDocument();

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/settings.php?user_id=EMP123');
    });

    // Check if the Enabled radio button is selected
    const enabledRadio = screen.getByDisplayValue('1');
    expect(enabledRadio.checked).toBe(true);

    const disabledRadio = screen.getByDisplayValue('0');
    expect(disabledRadio.checked).toBe(false);
});

test('handles setting change and saving', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: { smsoption: '1' } }),
        post: vi.fn().mockResolvedValue({ data: { status: 'success' } })
    };

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });

    renderSettings(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalled();
    });

    // Change setting to disabled
    const disabledRadio = screen.getByDisplayValue('0');
    fireEvent.click(disabledRadio);

    expect(disabledRadio.checked).toBe(true);

    // Click save
    const saveBtn = screen.getByRole('button', { name: /Commit Configuration/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/settings.php', {
            user_id: 'EMP123',
            smsoption: '0'
        });
        expect(alertMock).toHaveBeenCalledWith('Preferences saved successfully.');
    });

    alertMock.mockRestore();
});
