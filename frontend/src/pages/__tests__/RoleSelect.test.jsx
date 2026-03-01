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

    expect(screen.getByText(/Select Your Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer/i)).toBeInTheDocument();
    expect(screen.getByText(/Staff \/ Driver/i)).toBeInTheDocument();
    expect(screen.getByText(/Administrator/i)).toBeInTheDocument();
});

test('has correct links for roles', () => {
    renderRoleSelect();

    expect(screen.getByRole('link', { name: /customer/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /staff \/ driver/i })).toHaveAttribute('href', '/staff/login');
    expect(screen.getByRole('link', { name: /administrator/i })).toHaveAttribute('href', '/admin/login');
});
