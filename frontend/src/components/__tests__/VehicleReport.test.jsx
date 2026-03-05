import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VehicleReport from '../VehicleReport';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockVehicles = ['V001', 'V002', 'V003'];
const mockReportData = [
    { b_id: '201', bookin_time: '10:00 AM', v_id: 'V001', v_type: 'Sedan', picup_place: 'City A', drop_place: 'Airport', opening_km: '10000', closing_km: '10150', net_total: '750.00' },
    { b_id: '202', bookin_time: '02:00 PM', v_id: 'V001', v_type: 'Sedan', picup_place: 'Station', drop_place: 'Hotel', opening_km: '10200', closing_km: '10280', net_total: '400.00' }
];

const renderVehicleReport = (apiMock) => render(
    <BrowserRouter>
        <AuthContext.Provider value={{ api: apiMock }}>
            <VehicleReport />
        </AuthContext.Provider>
    </BrowserRouter>
);

test('renders vehicle report filter form', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderVehicleReport(apiMock);
    expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
    expect(screen.getByText(/target asset node/i)).toBeInTheDocument();
    expect(screen.getByText(/origin epoch/i)).toBeInTheDocument();
    expect(screen.getByText(/terminus epoch/i)).toBeInTheDocument();
});

test('fetches vehicle list on mount', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderVehicleReport(apiMock);
    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/reports.php?type=vehicles_list');
    });
});

test('renders table column headers', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    const { container } = renderVehicleReport(apiMock);
    await waitFor(() => { expect(container.querySelector('th')).toBeInTheDocument(); });
    const headers = Array.from(container.querySelectorAll('th')).map(h => h.textContent.trim());
    expect(headers.some(t => /booking ref/i.test(t))).toBe(true);
    expect(headers.some(t => /timestamp log/i.test(t))).toBe(true);
    expect(headers.some(t => /asset vector/i.test(t))).toBe(true);
    expect(headers.some(t => /transit path/i.test(t))).toBe(true);
    expect(headers.some(t => /distance/i.test(t))).toBe(true);
    expect(headers.some(t => /capital gain/i.test(t))).toBe(true);
});

test('shows empty state when no data returned', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderVehicleReport(apiMock);
    await waitFor(() => {
        expect(screen.getByText(/no records matched the temporal boundary/i)).toBeInTheDocument();
    });
});

test('renders report rows after form submit', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('vehicles_list')) return Promise.resolve({ data: mockVehicles });
            return Promise.resolve({ data: mockReportData });
        })
    };
    const { container } = renderVehicleReport(apiMock);
    await waitFor(() => { expect(container.querySelector('form')).toBeInTheDocument(); });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => {
        const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
        expect(tdTexts.some(t => t === '#201')).toBe(true);
    });
    const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
    expect(tdTexts.some(t => t === '#202')).toBe(true);
});

test('populates vehicle select from API', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('vehicles_list')) return Promise.resolve({ data: mockVehicles });
            return Promise.resolve({ data: [] });
        })
    };
    const { container } = renderVehicleReport(apiMock);
    await waitFor(() => {
        const options = container.querySelector('select').querySelectorAll('option');
        expect(options.length).toBeGreaterThan(1);
    });
});

test('shows totals summary after form submit returns data', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('vehicles_list')) return Promise.resolve({ data: mockVehicles });
            return Promise.resolve({ data: mockReportData });
        })
    };
    const { container } = renderVehicleReport(apiMock);
    await waitFor(() => { expect(container.querySelector('form')).toBeInTheDocument(); });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => {
        expect(screen.getByText(/aggregate gross capital/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/brokerage retention/i)).toBeInTheDocument();
});

test('initializes date inputs to today', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    const { container } = renderVehicleReport(apiMock);
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs[0].value).toBe(today);
    expect(dateInputs[1].value).toBe(today);
});
