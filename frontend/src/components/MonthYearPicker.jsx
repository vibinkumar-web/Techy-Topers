import { useState, useRef, useEffect } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * MonthYearPicker
 * Props:
 *   value      – "YYYY-MM" string or ""
 *   onChange   – fn(valueString) where valueString is "YYYY-MM" or ""
 *   placeholder – label shown when empty
 */
const MonthYearPicker = ({ value, onChange, placeholder = 'Select month' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Parse current value
    const parsed = value ? { year: parseInt(value.split('-')[0]), month: parseInt(value.split('-')[1]) - 1 } : null;
    const today = new Date();
    const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());

    // Keep viewYear in sync when value changes externally
    useEffect(() => {
        if (parsed) setViewYear(parsed.year);
    }, [value]);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectMonth = (monthIndex) => {
        const mm = String(monthIndex + 1).padStart(2, '0');
        onChange(`${viewYear}-${mm}`);
        setOpen(false);
    };

    const clearValue = (e) => {
        e.stopPropagation();
        onChange('');
    };

    // Display label
    const displayLabel = parsed
        ? `${MONTHS[parsed.month]}, ${parsed.year}`
        : '';

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block', userSelect: 'none' }}>
            {/* Trigger input */}
            <div
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 38,
                    padding: '0 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    color: displayLabel ? '#023149' : '#9ca3af',
                    minWidth: 160,
                    boxSizing: 'border-box',
                }}
            >
                <span className="material-icons" style={{ fontSize: 16, color: '#94a3b8' }}>calendar_month</span>
                <span style={{ flex: 1 }}>{displayLabel || placeholder}</span>
                {displayLabel && (
                    <span
                        className="material-icons"
                        onClick={clearValue}
                        style={{ fontSize: 15, color: '#94a3b8', cursor: 'pointer' }}
                        title="Clear"
                    >close</span>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 9999,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    padding: 12,
                    width: 220,
                }}>
                    {/* Year navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <button
                            type="button"
                            onClick={() => setViewYear(y => y - 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#023149' }}
                        >
                            <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
                        </button>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#023149' }}>{viewYear}</span>
                        <button
                            type="button"
                            onClick={() => setViewYear(y => y + 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#023149' }}
                        >
                            <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
                        </button>
                    </div>

                    {/* Month grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                        {MONTHS.map((m, i) => {
                            const isSelected = parsed && parsed.year === viewYear && parsed.month === i;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => selectMonth(i)}
                                    style={{
                                        padding: '7px 4px',
                                        border: isSelected ? '2px solid #023149' : '1px solid transparent',
                                        borderRadius: 6,
                                        background: isSelected ? '#023149' : 'transparent',
                                        color: isSelected ? '#fff' : '#374151',
                                        fontSize: 12,
                                        fontWeight: isSelected ? 700 : 500,
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280', fontWeight: 600 }}
                        >Clear</button>
                        <button
                            type="button"
                            onClick={() => {
                                const now = new Date();
                                setViewYear(now.getFullYear());
                                const mm = String(now.getMonth() + 1).padStart(2, '0');
                                onChange(`${now.getFullYear()}-${mm}`);
                                setOpen(false);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#023149', fontWeight: 600 }}
                        >This month</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthYearPicker;
