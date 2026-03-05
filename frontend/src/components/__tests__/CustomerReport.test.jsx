import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerReport from '../CustomerReport';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockCustomers = ['Alice Smith', 'Bob Johnson', 'Carol White'];

const mockReportData = [
    { b_id: '101', b_name: 'Alice Smith', m_no: '9876543210', p_city: 'City A', d_place: 'Airport' },
    { b_id: '102', b_name: 'Alice Smith', m_no: '9876543210', p_city: 'Station', d_place: 'Hotel' }
];

const renderCustomerReport = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <CustomerReport />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders customer filter form with Execute Query button', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderCustomerReport(apiMock);

    expect(screen.getByRole('button', { name: /execute query/i })).toBeInTheDocument();
    expect(screen.getByText(/target customer profile/i)).toBeInTheDocument();
});

test('fetches customer list and report data on mount', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('customers_list')) return Promise.resolve({ data: mockCustomers });
            return Promise.resolve({ data: mockReportData });
        })
    };
    renderCustomerReport(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/reports.php?type=customers_list');
        expect(apiMock.get).toHaveBeenCalledWith(expect.stringContaining('/reports.php?type=customer'));
    });
});

test('renders table column headers via th elements', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    const { container } = renderCustomerReport(apiMock);

    await waitFor(() => { expect(container.querySelector('th')).toBeInTheDocument(); });

    const headers = Array.from(container.querySelectorAll('th')).map(h => h.textContent.trim());
    expect(headers.some(t => /booking ref/i.test(t))).toBe(true);
    expect(headers.some(t => /customer profile/i.test(t))).toBe(true);
    expect(headers.some(t => /telecom hash/i.test(t))).toBe(true);
    expect(headers.some(t => /origin sector/i.test(t))).toBe(true);
    expect(headers.some(t => /destination sector/i.test(t))).toBe(true);
});

test('shows empty state when no report data', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderCustomerReport(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/no records matched the current query/i)).toBeInTheDocument();
    });
});

test('renders booking refs in td cells when report data returned', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('customers_list')) return Promise.resolve({ data: mockCustomers });
            return Promise.resolve({ data: mockReportData });
        })
    };
    const { container } = renderCustomerReport(apiMock);

    await waitFor(() => {
        const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
        expect(tdTexts.some(t => t === '#101')).toBe(true);
    });

    const tdTexts = Array.from(container.querySelectorAll('td')).map(t => t.textContent.trim());
    expect(tdTexts.some(t => t === '#102')).toBe(true);
    expect(tdTexts.some(t => t === 'City A')).toBe(true);
});

test('populates customer dropdown from API', async () => {
    const apiMock = {
        get: vi.fn().mockImplementation((url) => {
            if (url.includes('customers_list')) return Promise.resolve({ data: mockCustomers });
            return Promise.resolve({ data: [] });
        })
    };
    const { container } = renderCustomerReport(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledWith('/reports.php?type=customers_list');
    });

    await waitFor(() => {
        const options = container.querySelector('select').querySelectorAll('option');
        expect(options.length).toBeGreaterThan(1);
    });
});

test('re-fetches report when Execute Query is submitted', async () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    renderCustomerReport(apiMock);

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledTimes(2); // customers_list + initial report
    });

    fireEvent.submit(screen.getByRole('button', { name: /execute query/i }).closest('form'));

    await waitFor(() => {
        expect(apiMock.get).toHaveBeenCalledTimes(3);
    });
});
