import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Reports from '../Reports';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

// Mock child report components with correct paths relative to this test file
vi.mock('../../components/CustomerReport', () => ({
    default: () => <div data-testid="customer-report">Customer Report Content</div>
}));
vi.mock('../../components/VehicleReport', () => ({
    default: () => <div data-testid="vehicle-report">Vehicle Report Content</div>
}));
vi.mock('../../components/CompanyReport', () => ({
    default: () => <div data-testid="company-report">Company Report Content</div>
}));

const renderReports = () => {
    const apiMock = { get: vi.fn().mockResolvedValue({ data: [] }) };
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <Reports />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders Global Reporting Matrix page title', () => {
    renderReports();
    expect(screen.getByText('Global Reporting Matrix')).toBeInTheDocument();
});

test('renders all three report tabs', () => {
    renderReports();

    expect(screen.getByRole('button', { name: /Customer Heuristics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asset Telemetry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Corporate Ledgers/i })).toBeInTheDocument();
});

test('shows customer report by default', () => {
    renderReports();
    expect(screen.getByTestId('customer-report')).toBeInTheDocument();
});

test('switches to vehicle report tab on click', () => {
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: /Asset Telemetry/i }));

    expect(screen.getByTestId('vehicle-report')).toBeInTheDocument();
    expect(screen.queryByTestId('customer-report')).not.toBeInTheDocument();
});

test('switches to company report tab on click', () => {
    renderReports();

    fireEvent.click(screen.getByRole('button', { name: /Corporate Ledgers/i }));

    expect(screen.getByTestId('company-report')).toBeInTheDocument();
    expect(screen.queryByTestId('customer-report')).not.toBeInTheDocument();
});
