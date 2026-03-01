import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const FinanceManagement = () => {
    const toast = useToast();
const { api, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loadingData, setLoadingData] = useState(false);
    const [summary, setSummary] = useState({ total_commission: 0, total_expense: 0 });
    const [ledger, setLedger] = useState([]);

    // Form States
    const [commissionForm, setCommissionForm] = useState({
        v_id: '',
        b_id: '',
        amount: '',
        description: ''
    });

    const [expenseForm, setExpenseForm] = useState({
        v_id: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchFinanceData();
        }
    }, [user]);

    const fetchFinanceData = async () => {
        try {
            const [sumRes, ledRes] = await Promise.all([
                api.get('/finance.php?action=summary'),
                api.get('/finance.php?action=ledger&limit=50')
            ]);

            if (sumRes.data.status === 'success') {
                setSummary(sumRes.data.data || { total_commission: 0, total_expense: 0 });
            }
            if (ledRes.data.status === 'success') {
                setLedger(ledRes.data.data || []);
            }
        } catch (error) {
            console.error("Error loading finance data:", error);
        }
    };

    const handleCommissionSubmit = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        try {
            const payload = {
                action: 'process_commission', // This hooks into the existing commission logic in finance.php
                v_id: commissionForm.v_id,
                b_id: commissionForm.b_id || null,
                amount: commissionForm.amount,
                recorded_by: user?.staff_name || user?.name || 'Admin',
                description: commissionForm.description || `Manual commission entry for Driver ${commissionForm.v_id}`
            };
            const response = await api.post('/finance.php', payload);

            if (response.data.status === 'success') {
                toast('Taxi Commission recorded successfully!');
                setCommissionForm({ v_id: '', b_id: '', amount: '', description: '' });
                fetchFinanceData();
            } else {
                toast(response.data.message || 'Failed to record commission', 'error');
            }
        } catch (error) {
            console.error(error);
            toast('Error recording commission.', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        try {
            const payload = {
                action: 'add_transaction',
                type: 'income',
                category: 'Office Income',
                amount: expenseForm.amount,
                description: expenseForm.description,
                v_id: expenseForm.v_id || null,
                recorded_by: user?.staff_name || user?.name || 'Admin'
            };
            const response = await api.post('/finance.php', payload);

            if (response.data.status === 'success') {
                toast('Office Income recorded successfully!');
                setExpenseForm({ v_id: '', amount: '', description: '' });
                fetchFinanceData();
            } else {
                toast(response.data.message || 'Failed to record income', 'error');
            }
        } catch (error) {
            console.error(error);
            toast('Error recording income.', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    if (authLoading || !user) return <div className="loading-screen">Authenticating Access...</div>;

    return (
        <div className="page-wrap" style={{ flex: 1 }}>
            <div className="page-header">
                <div>
                    <h1>Ledger & Office Accounting</h1>
                    <p>Manually record driver commissions received and general office expenses.</p>
                </div>
            </div>

            <div className="page-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '1400px', padding: '0 40px', paddingBottom: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '40px' }}>

                    {/* Manual Commission Entry Form */}
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#10b981' }}>account_balance_wallet</span>
                            </div>
                            <h2 style={{ color: '#023149', fontSize: '20px', margin: 0 }}>Taxi Commission Entry</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Log manual commission payments received from drivers.</p>

                        <form onSubmit={handleCommissionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-field">
                                    <label>Driver / Vehicle ID <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        value={commissionForm.v_id}
                                        onChange={(e) => setCommissionForm({ ...commissionForm, v_id: e.target.value })}
                                        placeholder="e.g. TN12A1234"
                                        required
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Booking ID (Optional)</label>
                                    <input
                                        type="number"
                                        value={commissionForm.b_id}
                                        onChange={(e) => setCommissionForm({ ...commissionForm, b_id: e.target.value })}
                                        placeholder="Specific Trip ID"
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Commission Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={commissionForm.amount}
                                    onChange={(e) => setCommissionForm({ ...commissionForm, amount: e.target.value })}
                                    style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Payment Note / Description</label>
                                <textarea
                                    value={commissionForm.description}
                                    onChange={(e) => setCommissionForm({ ...commissionForm, description: e.target.value })}
                                    style={{ minHeight: '80px', resize: 'vertical' }}
                                    placeholder="E.g. Weekly settlement..."
                                />
                            </div>

                            <button type="submit" disabled={loadingData} style={{ background: '#10b981', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: loadingData ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: loadingData ? 0.7 : 1 }}>
                                {loadingData ? 'Processing...' : '+ Register Commission received'}
                            </button>
                        </form>

                        {/* Commission History Table */}
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#0f172a', fontSize: '15px', marginBottom: '16px' }}>Recent Commissions</h3>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Vehicle</th>
                                            <th>Details</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.filter(tx => tx.type === 'commission' || tx.type === 'income').length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No recent commissions.</td></tr>
                                        ) : ledger.filter(tx => tx.type === 'commission' || tx.type === 'income').slice(0, 10).map(tx => (
                                            <tr key={tx.id}>
                                                <td style={{ fontSize: '13px', color: '#475569' }}>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                                <td style={{ fontSize: '13px', fontWeight: 600, color: '#023149' }}>{tx.v_id || '-'}</td>
                                                <td style={{ fontSize: '13px', color: '#0f172a' }}>{tx.description || tx.category}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>+₹{parseFloat(tx.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>


                    {/* General Office Income Form */}
                    <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderTop: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#3b82f6' }}>savings</span>
                            </div>
                            <h2 style={{ color: '#023149', fontSize: '20px', margin: 0 }}>Other Office Income</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Log miscellaneous generic incoming payments received by the office.</p>

                        <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-field">
                                    <label>Vehicle ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={expenseForm.v_id}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, v_id: e.target.value })}
                                        placeholder="e.g. TN12A1234"
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Income Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-field">
                                <label>Income Details / Receipt Note <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    style={{ minHeight: '165px', resize: 'vertical' }}
                                    placeholder="E.g. Monthly internet bill, Driver Bonus..."
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loadingData} style={{ background: '#3b82f6', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: loadingData ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: loadingData ? 0.7 : 1 }}>
                                {loadingData ? 'Processing...' : '+ Register General Income'}
                            </button>
                        </form>

                        {/* Income History Table */}
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <h3 style={{ color: '#0f172a', fontSize: '15px', marginBottom: '16px' }}>Recent Office Income</h3>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Vehicle</th>
                                            <th>Details</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledger.filter(tx => tx.type === 'income' && tx.category === 'Office Income').length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No recent office income.</td></tr>
                                        ) : ledger.filter(tx => tx.type === 'income' && tx.category === 'Office Income').slice(0, 10).map(tx => (
                                            <tr key={tx.id}>
                                                <td style={{ fontSize: '13px', color: '#475569' }}>{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                                <td style={{ fontSize: '13px', fontWeight: 600, color: '#023149' }}>{tx.v_id || '-'}</td>
                                                <td style={{ fontSize: '13px', color: '#0f172a' }}>{tx.description || tx.category}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#3b82f6' }}>+₹{parseFloat(tx.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default FinanceManagement;
