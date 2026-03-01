import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    expect(screen.getByText(/Central Booking Station/i)).toBeInTheDocument();
    expect(screen.getByText(/New Reservation/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Availability Search/i)).toBeInTheDocument();
});

test('can fill home booking form', () => {
    renderHome();

    const nameInput = screen.getByPlaceholderText(/Main Passenger ID/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput.value).toBe('John Doe');

    const phoneInput = screen.getByPlaceholderText(/Primary Contact/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput.value).toBe('1234567890');
});
