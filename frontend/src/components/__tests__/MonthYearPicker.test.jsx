import { render, screen, fireEvent } from '@testing-library/react';
import MonthYearPicker from '../MonthYearPicker';
import { expect, test, vi } from 'vitest';

const renderPicker = (props = {}) => {
    const onChange = props.onChange ?? vi.fn();
    return { onChange, ...render(<MonthYearPicker value={props.value ?? ''} onChange={onChange} placeholder={props.placeholder} />) };
};

test('renders with placeholder when no value set', () => {
    renderPicker({ placeholder: 'Pick a month' });
    expect(screen.getByText('Pick a month')).toBeInTheDocument();
});

test('uses default placeholder when none provided', () => {
    renderPicker();
    expect(screen.getByText('Select month')).toBeInTheDocument();
});

test('displays formatted value when value is set', () => {
    renderPicker({ value: '2024-03' });
    expect(screen.getByText('Mar, 2024')).toBeInTheDocument();
});

test('opens dropdown when trigger is clicked', () => {
    renderPicker();
    const trigger = screen.getByText('Select month').closest('div');
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: 'Jan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dec' })).toBeInTheDocument();
});

test('calls onChange when a month is selected', () => {
    const { onChange } = renderPicker();
    const trigger = screen.getByText('Select month').closest('div');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Mar' }));
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-03$/));
});

test('navigates to next year when right chevron button is clicked', () => {
    const currentYear = new Date().getFullYear();
    const { container } = renderPicker();
    const trigger = screen.getByText('Select month').closest('div');
    fireEvent.click(trigger);

    expect(screen.getByText(String(currentYear))).toBeInTheDocument();

    // The year navigation row contains the year text and two buttons
    const yearRow = screen.getByText(String(currentYear)).closest('div');
    const navBtns = yearRow.querySelectorAll('button');
    fireEvent.click(navBtns[1]); // second = next year

    expect(screen.getByText(String(currentYear + 1))).toBeInTheDocument();
});

test('navigates to previous year when left chevron button is clicked', () => {
    const currentYear = new Date().getFullYear();
    renderPicker();
    const trigger = screen.getByText('Select month').closest('div');
    fireEvent.click(trigger);

    const yearRow = screen.getByText(String(currentYear)).closest('div');
    const navBtns = yearRow.querySelectorAll('button');
    fireEvent.click(navBtns[0]); // first = prev year

    expect(screen.getByText(String(currentYear - 1))).toBeInTheDocument();
});

test('calls onChange with empty string when Clear button clicked inside dropdown', () => {
    const { onChange } = renderPicker({ value: '2024-06' });
    const trigger = screen.getByText('Jun, 2024').closest('div');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith('');
});

test('calls onChange with this month when "This month" button clicked', () => {
    const { onChange } = renderPicker();
    const trigger = screen.getByText('Select month').closest('div');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: /this month/i }));
    const now = new Date();
    const expectedMonth = String(now.getMonth() + 1).padStart(2, '0');
    expect(onChange).toHaveBeenCalledWith(`${now.getFullYear()}-${expectedMonth}`);
});

test('shows clear X button when a value is set', () => {
    renderPicker({ value: '2024-09' });
    expect(screen.getByTitle('Clear')).toBeInTheDocument();
});

test('calls onChange with empty string when X (clear) icon is clicked on trigger', () => {
    const { onChange } = renderPicker({ value: '2024-09' });
    fireEvent.click(screen.getByTitle('Clear'));
    expect(onChange).toHaveBeenCalledWith('');
});

test('highlights the selected month in dropdown', () => {
    renderPicker({ value: '2024-06' });
    const trigger = screen.getByText('Jun, 2024').closest('div');
    fireEvent.click(trigger);
    const junBtn = screen.getByRole('button', { name: 'Jun' });
    expect(junBtn.style.background).toBe('rgb(2, 49, 73)');
});
