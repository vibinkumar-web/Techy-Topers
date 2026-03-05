import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VehicleTariffSettings from '../VehicleTariffSettings';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockVehicles = [
    { id: 1, v_name: 'Sedan', kmnonac: '12.50', kmac: '15.00' },
    { id: 2, v_name: 'SUV', kmnonac: '16.00', kmac: '20.00' },
    { id: 3, v_name: 'Mini', kmnonac: '10.00', kmac: '12.50' }
];

const defaultApiMock = () => ({
    get: vi.fn().mockImplementation((url) => {
        if (url === '/vehicle_pricing.php') return Promise.resolve({ data: mockVehicles });
        if (url === '/settings.php?config=base_fare') return Promise.resolve({ data: { base_fare: 190 } });
        return Promise.resolve({ data: [] });
    }),
    post: vi.fn().mockResolvedValue({ data: { message: 'Success' } })
});

const renderVehicleTariff = (apiMock) => render(
    <BrowserRouter>
        <AuthContext.Provider value={{ api: apiMock }}>
            <VehicleTariffSettings />
        </AuthContext.Provider>
    </BrowserRouter>
);

test('shows loading state initially', () => {
    const apiMock = { get: vi.fn().mockReturnValue(new Promise(() => {})) };
    renderVehicleTariff(apiMock);
    expect(screen.getByText(/loading price matrix/i)).toBeInTheDocument();
});

test('renders vehicle tariff table after loading', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    expect(screen.getByText('SUV')).toBeInTheDocument();
    expect(screen.getByText('Mini')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Per-Kilometer Tariff')).toBeInTheDocument();
});

test('renders table column headers', async () => {
    const { container } = renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(container.querySelector('th')).toBeInTheDocument(); });
    const headers = Array.from(container.querySelectorAll('th')).map(h => h.textContent.trim());
    expect(headers.some(t => /vehicle classification/i.test(t))).toBe(true);
    expect(headers.some(t => /non-ac rate/i.test(t))).toBe(true);
    expect(headers.some(t => /^ac rate/i.test(t))).toBe(true);
    expect(headers.some(t => /action/i.test(t))).toBe(true);
});

test('renders Edit Rate buttons for each vehicle', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    const editBtns = screen.getAllByRole('button', { name: /edit rate/i });
    expect(editBtns).toHaveLength(3);
});

test('enters edit mode when Edit Rate button is clicked', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    const editBtns = screen.getAllByRole('button', { name: /edit rate/i });
    fireEvent.click(editBtns[0]);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
});

test('cancels edit mode when Cancel is clicked', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    const editBtns = screen.getAllByRole('button', { name: /edit rate/i });
    fireEvent.click(editBtns[0]);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /edit rate/i })).toHaveLength(3);
    });
});

test('saves updated rate and calls API', async () => {
    const apiMock = defaultApiMock();
    const { container } = renderVehicleTariff(apiMock);
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });

    const editBtns = screen.getAllByRole('button', { name: /edit rate/i });
    fireEvent.click(editBtns[0]);

    const numberInputs = container.querySelectorAll('input[type="number"]');
    fireEvent.change(numberInputs[0], { target: { value: '13.00' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/vehicle_pricing.php', expect.objectContaining({
            id: 1,
            kmnonac: '13.00'
        }));
    });
});

test('shows Create New Vehicle button when not in add mode', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    expect(screen.getByRole('button', { name: /create new vehicle/i })).toBeInTheDocument();
});

test('shows add row form when Create New Vehicle is clicked', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /create new vehicle/i }));
    expect(screen.getByPlaceholderText(/add new vehicle/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
});

test('submits new vehicle and calls API', async () => {
    const apiMock = defaultApiMock();
    renderVehicleTariff(apiMock);
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /create new vehicle/i }));
    fireEvent.change(screen.getByPlaceholderText(/add new vehicle/i), { target: { value: 'Van' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/vehicle_pricing.php', expect.objectContaining({
            v_name: 'Van'
        }));
    });
});

test('cancels add mode when Cancel is clicked in new vehicle row', async () => {
    renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    fireEvent.click(screen.getByRole('button', { name: /create new vehicle/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
        expect(screen.queryByPlaceholderText(/add new vehicle/i)).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /create new vehicle/i })).toBeInTheDocument();
});

test('displays formatted km rates in table rows', async () => {
    const { container } = renderVehicleTariff(defaultApiMock());
    await waitFor(() => { expect(screen.getByText('Sedan')).toBeInTheDocument(); });
    // Sedan has kmnonac=12.50, kmac=15.00 — check via td cells
    const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
    expect(tdTexts.some(t => t.includes('12.50'))).toBe(true);
    expect(tdTexts.some(t => t.includes('15.00'))).toBe(true);
});
