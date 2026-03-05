import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import { expect, test } from 'vitest';

const renderHome = () => {
    return render(
        <BrowserRouter>
            <Home />
        </BrowserRouter>
    );
};

test('renders home page properly', () => {
    renderHome();

    expect(screen.getByText(/Fleet & Itinerary Orchestration Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Initiate Session/i)).toBeInTheDocument();
    expect(screen.getByText(/Establish Identity/i)).toBeInTheDocument();
});

test('renders home page navigation links', () => {
    renderHome();

    expect(screen.getByRole('link', { name: /Initiate Session/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Establish Identity/i })).toHaveAttribute('href', '/register');
});
