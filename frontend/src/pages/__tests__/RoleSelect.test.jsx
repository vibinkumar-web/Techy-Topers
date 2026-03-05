import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoleSelect from '../RoleSelect';
import { expect, test } from 'vitest';

const renderRoleSelect = () => {
    return render(
        <BrowserRouter>
            <RoleSelect />
        </BrowserRouter>
    );
};

test('renders role options', () => {
    renderRoleSelect();

    expect(screen.getByText(/Systems Command Center/i)).toBeInTheDocument();
    expect(screen.getByText(/Administrative Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Node/i)).toBeInTheDocument();
});

test('has correct login buttons for roles', () => {
    renderRoleSelect();

    expect(screen.getByRole('button', { name: /Initiate Admin Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Initiate Operator Login/i })).toBeInTheDocument();
});
