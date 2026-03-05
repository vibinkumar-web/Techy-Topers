import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompanyReport from '../CompanyReport';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockCompanies = ['Acme Corp', 'Global Ltd', 'Tech Inc'];
const mockReportData = [
    { b_id: '301', bookin_time: '10:00 AM', v_id: 'V001', v_type: 'Sedan', picup_place: 'HQ', drop_place: 'Airport', opening_km: '5000', closing_km: '5120', net_total: '600.00' },
    { b_id: '302', bookin_time: '03:00 PM', v_id: 'V002', v_type: 'SUV', picup_place: 'Office', drop_place: 'Station', opening_km: '8000', closing_km: '8090', net_total: '450.00' }
];

const renderCompanyReport = (apiMock) => render(
    <BrowserRouter>
        <AuthContext.Provider value={{ api: apiMock }}>
            <CompanyReport />
        </AuthContext.Provider>
    </BrowserRouter>
);

test('renders company report filter form with Digest button', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderCompanyReport(apiMock);
    expect(screen.getByRole('button', { name: /digest/i })).toBeInTheDocument();
    expect(screen.getByText(/corporate sub-entity filter/i)).toBeInTheDocument();
});

test('fetches company list on mount', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderCompanyReport(apiMock);
    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/reports.php?type=company_list');
    });
});

test('renders table column headers', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    const { container } = renderCompanyReport(apiMock);
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
    renderCompanyReport(apiMock);
    await waitFor(() => {
        expect(screen.getByText(/no corporate records matched/i)).toBeInTheDocument();
    });
});

test('renders company report rows after form submit', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('company_list')) return Promise.resolve({ data: mockCompanies });
            return Promise.resolve({ data: mockReportData });
        })
    };
    const { container } = renderCompanyReport(apiMock);
    await waitFor(() => { expect(container.querySelector('form')).toBeInTheDocument(); });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => {
        const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
        expect(tdTexts.some(t => t === '#301')).toBe(true);
    });
    const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
    expect(tdTexts.some(t => t === '#302')).toBe(true);
});

test('populates company select from API', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('company_list')) return Promise.resolve({ data: mockCompanies });
            return Promise.resolve({ data: [] });
        })
    };
    const { container } = renderCompanyReport(apiMock);
    await waitFor(() => {
        const options = container.querySelector('select').querySelectorAll('option');
        expect(options.length).toBeGreaterThan(1);
    });
});

test('shows corporate gross yield summary after form submit', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('company_list')) return Promise.resolve({ data: mockCompanies });
            return Promise.resolve({ data: mockReportData });
        })
    };
    const { container } = renderCompanyReport(apiMock);
    await waitFor(() => { expect(container.querySelector('form')).toBeInTheDocument(); });
    fireEvent.submit(container.querySelector('form'));
    await waitFor(() => {
        expect(screen.getByText(/corporate gross yield/i)).toBeInTheDocument();
    });
});

test('initializes date inputs to today', () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    const { container } = renderCompanyReport(apiMock);
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs[0].value).toBe(today);
    expect(dateInputs[1].value).toBe(today);
});

test('re-fetches report on form submit', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('company_list')) return Promise.resolve({ data: mockCompanies });
            return Promise.resolve({ data: [] });
        })
    };
    renderCompanyReport(apiMock);
    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledTimes(1); // only company_list on mount
    });
    fireEvent.submit(screen.getByRole('button', { name: /digest/i }).closest('form'));
    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith(expect.stringContaining('/reports.php?type=company'));
    });
});
