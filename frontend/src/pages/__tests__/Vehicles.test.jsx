import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Vehicles from '../Vehicles';
import AuthContext from '../../context/AuthContext';
import { expect, test, vi } from 'vitest';

const mockVehicles = [
    {
        v_id: 'V001',
        v_cat: 'Sedan',
        v_brand: 'Honda',
        v_model: 'City',
        v_no: 'KA-01-AB-1234',
        d_name: 'Driver One',
        d_mobile: '9988776655',
        o_name: 'Owner One',
        o_mobile: '1122334455'
    },
    {
        v_id: 'V002',
        v_cat: 'SUV',
        v_brand: 'Toyota',
        v_model: 'Innova',
        v_no: 'KA-02-XY-9876',
        d_name: 'Driver Two',
        d_mobile: '8877665544',
        o_name: 'Owner Two',
        o_mobile: '2233445566'
    }
];

const renderVehicles = (apiMock) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ api: apiMock }}>
                <Vehicles />
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

test('renders vehicles table with data', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: mockVehicles })
    };

    renderVehicles(apiMock);

    expect(screen.getByText(/loading fleet data/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText(/Fleet Management/i)).toBeInTheDocument();
    });

    expect(screen.getByText('V001')).toBeInTheDocument();
    expect(screen.getByText('KA-01-AB-1234')).toBeInTheDocument();
    expect(screen.getByText('Driver One')).toBeInTheDocument();

    expect(screen.getByText('V002')).toBeInTheDocument();
    expect(screen.getByText('KA-02-XY-9876')).toBeInTheDocument();
    expect(screen.getByText('Owner Two')).toBeInTheDocument();
});

test('opens register modal on button click', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] })
    };

    renderVehicles(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/Fleet Management/i)).toBeInTheDocument();
    });

    const registerBtns = screen.getAllByRole('button', { name: /register vehicle/i, hidden: true });
    fireEvent.click(registerBtns[0]);

    expect(screen.getByText('Specifications & Identity')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /register vehicle/i, hidden: true }).length).toBeGreaterThan(0);
});

test('submits new vehicle form successfully', async () => {
    const apiMock = {
        get: vi.fn().mockResolvedValue({ data: [] }),
        post: vi.fn().mockResolvedValue({ data: { message: 'Success' } })
    };

    const { container } = renderVehicles(apiMock);

    await waitFor(() => {
        expect(screen.getByText(/Fleet Management/i)).toBeInTheDocument();
    });

    const registerBtns = screen.getAllByRole('button', { name: /register vehicle/i, hidden: true });
    fireEvent.click(registerBtns[0]);

    const vIdInput = container.querySelector('input[name="v_id"]');
    const vNoInput = container.querySelector('input[name="v_no"]');
    const vCatSelect = container.querySelector('select[name="v_cat"]');

    fireEvent.change(vIdInput, { target: { value: 'V003' } });
    fireEvent.change(vNoInput, { target: { value: 'KA-03-ZZ-1111' } });
    fireEvent.change(vCatSelect, { target: { value: 'Mini' } });

    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(apiMock.post).toHaveBeenCalledWith('/vehicles.php', expect.objectContaining({
            v_id: 'V003',
            v_no: 'KA-03-ZZ-1111',
            v_cat: 'Mini'
        }));
    });
});
