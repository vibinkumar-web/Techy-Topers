import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import VehicleTariffSettings from '../components/VehicleTariffSettings';




const Settings = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const [smsOption, setSmsOption] = useState('0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const response = await api.get(`/settings.php?user_id=${user.emp_id}`);
            if (response.data && response.data.smsoption !== undefined) {
                setSmsOption(response.data.smsoption);
            }
        } catch (error) {
            console.error("Error fetching settings", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/settings.php', {
                user_id: user.emp_id,
                smsoption: smsOption
            });
            toast('Preferences saved successfully.');
        } catch (error) {
            console.error("Error saving settings", error);
            toast('Failed to execute configuration update.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Global Config &amp; Preferences</h1>
                        <p>Govern application behaviors and integration endpoints</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 840 }}>
                    <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>

                        <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ fontSize: 24 }}>cell_tower</span>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                                    External Communication Subsystem
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                                    SMS Telemetry Gateway Configuration
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

                            <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', gap: 32 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Automated Outbound Payloads</div>
                                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                                        When enabled, the application will forcefully push SMS notifications to the designated numbers upon itinerary generation, asset assignment bindings, and final ledger terminations. This operation will consume external API provider credits.
                                    </p>
                                </div>

                                <div style={{ width: 1, background: '#cbd5e1' }}></div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240, justifyContent: 'center' }}>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                                        padding: '16px 20px', background: smsOption === '1' ? '#f0fdf4' : '#fff',
                                        border: `2px solid ${smsOption === '1' ? '#22c55e' : '#e2e8f0'}`,
                                        borderRadius: 12, transition: 'all .2s ease',
                                        boxShadow: smsOption === '1' ? '0 4px 6px -1px rgba(34, 197, 94, 0.1)' : 'none'
                                    }}>
                                        <input
                                            type="radio"
                                            value="1"
                                            checked={smsOption === '1'}
                                            onChange={(e) => setSmsOption(e.target.value)}
                                            style={{ width: 18, height: 18, accentColor: '#16a34a' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: smsOption === '1' ? '#166534' : '#334155' }}>Enabled</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: smsOption === '1' ? '#15803d' : '#94a3b8', marginTop: 2 }}>Transmits payloads</span>
                                        </div>
                                    </label>

                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                                        padding: '16px 20px', background: smsOption === '0' ? '#fef2f2' : '#fff',
                                        border: `2px solid ${smsOption === '0' ? '#ef4444' : '#e2e8f0'}`,
                                        borderRadius: 12, transition: 'all .2s ease',
                                        boxShadow: smsOption === '0' ? '0 4px 6px -1px rgba(239, 68, 68, 0.1)' : 'none'
                                    }}>
                                        <input
                                            type="radio"
                                            value="0"
                                            checked={smsOption === '0'}
                                            onChange={(e) => setSmsOption(e.target.value)}
                                            style={{ width: 18, height: 18, accentColor: '#dc2626' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: smsOption === '0' ? '#991b1b' : '#334155' }}>Disabled</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: smsOption === '0' ? '#b91c1c' : '#94a3b8', marginTop: 2 }}>Suppresses outbox</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 32, borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{
                                        height: 48,
                                        padding: '0 40px',
                                        background: '#023149',
                                        opacity: loading ? 0.7 : 1,
                                        cursor: loading ? 'wait' : 'pointer',
                                        fontSize: 16
                                    }}
                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#012030'; }}
                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#023149'; }}
                                >
                                    <span className="material-icons" style={{ fontSize: 20 }}>{loading ? 'sync' : 'save_as'}</span>
                                    {loading ? 'Committing Logic...' : 'Commit Configuration'}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: 48 }} />

                    <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <VehicleTariffSettings />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
