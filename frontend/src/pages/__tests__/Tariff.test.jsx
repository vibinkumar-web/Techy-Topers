import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tariff from '../Tariff';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockTariffData = {
    v_id: '1',
    a1: '1000', // 02 Hrs & 20 Km
    a19: '500', // Below 50 km
    a38: '15',  // Scalar 50 - 100 Km
};

const renderTariff = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <Tariff />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders tariff and handles vehicle selection', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockTariffData })
    };

    renderTariff(apiMock);

    expect(screen.getByText('Out-Station Economic Valuation Constants')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/tariff.php?v_id=1');
    });

    // Check if data is populated
    await waitFor(() => {
        const inputA1 = screen.getByDisplayValue('1000');
        expect(inputA1).toBeInTheDocument();
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
        expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });
});

test('handles tariff update submission', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockTariffData }),
        post: vi.fn().mockResolvedValue({ data: { status: 'success' } })
    };

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });

    renderTariff(apiMock);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    await waitFor(() => {
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    });

    // Change a value
    const inputA1 = screen.getByDisplayValue('1000');
    fireEvent.change(inputA1, { target: { value: '1200', name: 'a1' } });

    const submitBtn = screen.getByRole('button', { name: /Commit Economic Matrix/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/tariff.php', expect.objectContaining({
            v_id: '1',
            a1: '1200',
            a19: '500',
            a38: '15'
        }));
        expect(alertMock).toHaveBeenCalledWith('Tariff updated successfully.');
    });

    alertMock.mockRestore();
});
