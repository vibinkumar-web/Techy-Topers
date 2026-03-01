import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EditClosedTrip = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [bId, setBId] = useState('');
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.get(`/edit_closed_trip.php?b_id=${bId}`);
            setTrip(response.data);
        } catch (error) {
            console.error("Error fetching trip", error);
            setTrip(null);
            setMessage('Telemetry node unlocatable or transmission error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setTrip({ ...trip, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/edit_closed_trip.php', trip);
            setMessage('Ledger state synchronized successfully.');
        } catch (error) {
            console.error("Update failed", error);
            setMessage('Synchronization failed: ' + (error.response?.data?.message || 'Network abstraction layer rejection.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Ledger State Rectification</h1>
                        <p>Perform post-termination adjustments to finalized itinerary nodes</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 880 }}>
                    <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', marginBottom: 32 }}>
                        <div style={{ padding: 32 }}>
                            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'flex-end' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Isolated Node Reference Hash <span style={{ color: '#c5111a' }}>*</span></label>
                                    <div className="input-with-icon">
                                        <span className="material-icons" style={{ color: '#023149' }}>qr_code</span>
                                        <input
                                            type="text"
                                            value={bId}
                                            onChange={(e) => setBId(e.target.value)}
                                            placeholder="e.g. B-1025"
                                            required
                                            style={{ height: 48, fontWeight: 700, fontFamily: 'monospace', fontSize: 16 }}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ height: 48, padding: '0 32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15, background: '#023149' }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#012030'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#023149'; }}
                                >
                                    <span className="material-icons" style={{ fontSize: 20 }}>youtube_searched_for</span>
                                    {loading && !trip ? 'Scanning...' : 'Isolate Topology'}
                                </button>
                            </form>
                            {message && !trip && (
                                <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 8, background: message.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: 12, color: message.includes('success') ? '#166534' : '#991b1b' }}>
                                    <span className="material-icons">{message.includes('success') ? 'check_circle' : 'error'}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700 }}>{message}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {trip && (
                        <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', animation: 'fadeIn 0.4s ease-out' }}>
                            <div style={{ padding: 32 }}>
                                <h3 className="section-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, color: '#0f172a' }}>
                                    <div style={{ background: '#f8fafc', color: '#475569', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: 24 }}>tune</span>
                                    </div>
                                    Ledger Metaclass Overrides - Node #{trip.b_id}
                                </h3>

                                {message && trip && (
                                    <div style={{ background: message.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`, padding: '16px 20px', borderRadius: 8, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, color: message.includes('success') ? '#166534' : '#991b1b' }}>
                                        <span className="material-icons">{message.includes('success') ? 'check_circle' : 'error'}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700 }}>{message}</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Initial Odometer State</label>
                                            <div className="input-with-icon">
                                                <span className="material-icons" style={{ color: '#023149' }}>speed</span>
                                                <input type="number" name="opening_km" value={trip.opening_km} onChange={handleChange} style={{ height: 48, fontWeight: 600, fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Terminal Odometer State</label>
                                            <div className="input-with-icon">
                                                <span className="material-icons" style={{ color: '#023149' }}>sports_score</span>
                                                <input type="number" name="closing_km" value={trip.closing_km} onChange={handleChange} style={{ height: 48, fontWeight: 600, fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Gross Ledger Accrual (₹)</label>
                                            <div className="input-with-icon">
                                                <span className="material-icons" style={{ color: '#0284c7' }}>account_balance_wallet</span>
                                                <input type="number" name="net_total" value={trip.net_total} onChange={handleChange} style={{ height: 48, fontWeight: 800, color: '#0369a1', border: '1px solid #bae6fd', background: '#f0f9ff' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Realized Capital (₹)</label>
                                            <div className="input-with-icon">
                                                <span className="material-icons" style={{ color: '#16a34a' }}>savings</span>
                                                <input type="number" name="paid_amount" value={trip.paid_amount} onChange={handleChange} style={{ height: 48, fontWeight: 800, color: '#15803d', border: '1px solid #bbf7d0', background: '#f0fdf4' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Subsidy Applied (₹)</label>
                                            <div className="input-with-icon">
                                                <span className="material-icons" style={{ color: '#dc2626' }}>local_offer</span>
                                                <input type="number" name="discount" value={trip.discount} onChange={handleChange} style={{ height: 48, fontWeight: 800, color: '#b91c1c', border: '1px solid #fecaca', background: '#fef2f2' }} />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Subsidy Justification Vector</label>
                                            <input type="text" name="dis_reason" value={trip.dis_reason} onChange={handleChange} style={{ height: 48, fontWeight: 600 }} placeholder="E.g. Promotional Allowance" />
                                        </div>
                                    </div>

                                    <div className="form-field">
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Operational Addendum</label>
                                        <textarea name="remarks" value={trip.remarks} onChange={handleChange} rows="3" style={{ resize: 'vertical', padding: 16, fontWeight: 500, color: '#334155' }} placeholder="Append arbitrary operational notes..."></textarea>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary"
                                            style={{ height: 48, padding: '0 32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15, background: '#0284c7' }}
                                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0369a1'; }}
                                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0284c7'; }}
                                        >
                                            <span className="material-icons" style={{ fontSize: 20 }}>published_with_changes</span>
                                            {loading && trip ? 'Synchronizing Protocol...' : 'Overwrite Terminal Ledger'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(8px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};

export default EditClosedTrip;
