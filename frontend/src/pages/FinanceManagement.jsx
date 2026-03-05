import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import AuthContext from '../context/AuthContext';
import MonthYearPicker from '../components/MonthYearPicker';

const EXPENSE_CATEGORIES = ['Rent', 'EB Bill', 'Network Bill', 'Staff Salary', 'Maintenance', 'Other'];

const TYPE_BADGE = {
    income: { background: '#dcfce7', color: '#166534' },
    expense: { background: '#fee2e2', color: '#991b1b' },
    commission: { background: '#eff6ff', color: '#1e40af' },
};

const FinanceManagement = () => {
    const toast = useToast();
    const { api, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loadingData, setLoadingData] = useState(false);
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
    const [ledger, setLedger] = useState([]);

    // Filters
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'commission' | 'expense' | 'income'

    // Form states
    const [commissionForm, setCommissionForm] = useState({ v_id: '', b_id: '', amount: '', description: '' });
    const [officeIncomeForm, setOfficeIncomeForm] = useState({ v_id: '', amount: '', description: '' });
    const [officeExpenseForm, setOfficeExpenseForm] = useState({ category: 'Rent', amount: '', description: '' });

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', description: '', category: '' });

    // Vehicle Commission Tracker
    const [vcMonth, setVcMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [vcTracking, setVcTracking] = useState(null);   // API result
    const [vcLoading, setVcLoading] = useState(false);
    const vcDebounce = useRef(null);

    const fetchVehicleCommission = useCallback(async (v_id, month) => {
        if (!v_id || v_id.trim().length < 1) { setVcTracking(null); return; }
        setVcLoading(true);
        try {
            const res = await api.get(`/finance.php?action=vehicle_commission&v_id=${encodeURIComponent(v_id.trim())}&month=${month}`);
            if (res.data.status === 'success') setVcTracking(res.data);
            else setVcTracking(null);
        } catch { setVcTracking(null); }
        finally { setVcLoading(false); }
    }, [api]);

    // Debounced re-fetch whenever v_id or month changes
    useEffect(() => {
        clearTimeout(vcDebounce.current);
        vcDebounce.current = setTimeout(() => {
            fetchVehicleCommission(commissionForm.v_id, vcMonth);
        }, 500);
        return () => clearTimeout(vcDebounce.current);
    }, [commissionForm.v_id, vcMonth, fetchVehicleCommission]);

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) fetchFinanceData();
    }, [user, filterFrom, filterTo]);

    const fetchFinanceData = async () => {
        try {
            const from = filterFrom ? `&from=${filterFrom}` : '';
            const to = filterTo ? `&to=${filterTo}` : '';
            const [sumRes, ledRes] = await Promise.all([
                api.get(`/finance.php?action=summary${from}${to}`),
                api.get(`/finance.php?action=ledger${from}${to}`)
            ]);
            if (sumRes.data.status === 'success') setSummary(sumRes.data.data || { total_income: 0, total_expense: 0, net_balance: 0 });
            if (ledRes.data.status === 'success') setLedger(ledRes.data.data || []);
        } catch (err) {
            console.error('Error loading finance data:', err);
        }
    };

    const handleCommissionSubmit = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        try {
            const res = await api.post('/finance.php', {
                action: 'process_commission',
                v_id: commissionForm.v_id,
                b_id: commissionForm.b_id || null,
                amount: commissionForm.amount,
                recorded_by: user?.staff_name || user?.name || 'Admin',
                description: commissionForm.description || `Manual commission for Driver ${commissionForm.v_id}`
            });
            if (res.data.status === 'success') {
                toast('Taxi Commission recorded!');
                const savedVid = commissionForm.v_id;
                setCommissionForm({ v_id: savedVid, b_id: '', amount: '', description: '' });
                fetchFinanceData();
                // Refresh tracker so Paid/Pending updates immediately
                fetchVehicleCommission(savedVid, vcMonth);
            } else toast(res.data.message || 'Failed', 'error');
        } catch (err) { toast('Error recording commission.', 'error'); }
        finally { setLoadingData(false); }
    };

    const handleOfficeIncomeSubmit = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        try {
            const res = await api.post('/finance.php', {
                action: 'add_transaction',
                type: 'income',
                category: 'Office Income',
                amount: officeIncomeForm.amount,
                description: officeIncomeForm.description,
                v_id: officeIncomeForm.v_id || null,
                recorded_by: user?.staff_name || user?.name || 'Admin'
            });
            if (res.data.status === 'success') {
                toast('Office Income recorded!');
                setOfficeIncomeForm({ v_id: '', amount: '', description: '' });
                fetchFinanceData();
            } else toast(res.data.message || 'Failed', 'error');
        } catch (err) { toast('Error recording income.', 'error'); }
        finally { setLoadingData(false); }
    };

    const handleOfficeExpenseSubmit = async (e) => {
        e.preventDefault();
        setLoadingData(true);
        try {
            const res = await api.post('/finance.php', {
                action: 'add_transaction',
                type: 'expense',
                category: officeExpenseForm.category,
                amount: officeExpenseForm.amount,
                description: officeExpenseForm.description,
                recorded_by: user?.staff_name || user?.name || 'Admin'
            });
            if (res.data.status === 'success') {
                toast('Office Expense recorded!');
                setOfficeExpenseForm({ category: 'Rent', amount: '', description: '' });
                fetchFinanceData();
            } else toast(res.data.message || 'Failed', 'error');
        } catch (err) { toast('Error recording expense.', 'error'); }
        finally { setLoadingData(false); }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
        try {
            const res = await api.post('/finance.php', { action: 'delete_transaction', id });
            if (res.data.status === 'success') {
                toast('Transaction deleted.');
                fetchFinanceData();
            } else toast(res.data.message || 'Delete failed.', 'error');
        } catch (err) { toast('Error deleting transaction.', 'error'); }
    };

    const openEditModal = (tx) => {
        setEditingTx(tx);
        setEditForm({ amount: tx.amount, description: tx.description || '', category: tx.category || '' });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/finance.php', {
                action: 'update_transaction',
                id: editingTx.id,
                amount: editForm.amount,
                description: editForm.description,
                category: editForm.category
            });
            if (res.data.status === 'success') {
                toast('Transaction updated.');
                setEditModalOpen(false);
                setEditingTx(null);
                fetchFinanceData();
            } else toast(res.data.message || 'Update failed.', 'error');
        } catch (err) { toast('Error updating.', 'error'); }
    };

    const handlePrint = () => window.print();

    // Download filtered PDF for a specific type
    const handleDownloadFiltered = (type) => {
        const rows = type === 'all' ? ledger : ledger.filter(tx => tx.type === type);
        const tabLabel = type === 'all' ? 'All Transactions'
            : type === 'commission' ? 'Commission'
                : type === 'expense' ? 'Expenses'
                    : 'Other Income';
        const dateRange = (filterFrom || filterTo) ? `${filterFrom || '...'} → ${filterTo || '...'}` : 'All Time';
        const html = `<!DOCTYPE html><html><head><meta charset='UTF-8'/><title>${tabLabel} Report</title>
        <style>
          body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:20px;}
          h2{text-align:center;color:#023149;margin-bottom:4px;font-size:16px;}
          .sub{text-align:center;color:#6b7280;font-size:11px;margin-bottom:16px;}
          table{width:100%;border-collapse:collapse;}
          th{background:#023149;color:#fff;padding:8px;text-align:left;font-size:11px;text-transform:uppercase;}
          td{padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;}
          tr:nth-child(even) td{background:#f9fafb;}
          .badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;text-transform:capitalize;}
          .badge-income{background:#dcfce7;color:#166534;}
          .badge-expense{background:#fee2e2;color:#991b1b;}
          .badge-commission{background:#eff6ff;color:#1e40af;}
          .amt-income,.amt-commission{color:#10b981;font-weight:800;}
          .amt-expense{color:#c5111a;font-weight:800;}
          .summary{display:flex;gap:24px;margin-top:16px;justify-content:flex-end;}
          .summary div{background:#f3f4f6;padding:8px 16px;border-radius:6px;text-align:center;}
          .summary span{display:block;font-size:10px;color:#6b7280;text-transform:uppercase;}
          .summary strong{font-size:14px;}
        </style></head><body>
        <h2>${tabLabel} Report</h2>
        <div class='sub'>Period: ${dateRange} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString('en-IN')}</div>
        <table><thead><tr><th>#</th><th>Date</th><th>Type</th><th>Category</th><th>Vehicle</th><th>Description</th><th style='text-align:right'>Amount (₹)</th></tr></thead>
        <tbody>${rows.map(tx => `<tr>
          <td>${tx.id}</td>
          <td>${new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          <td><span class='badge badge-${tx.type}'>${tx.type}</span></td>
          <td>${tx.category || '—'}</td>
          <td>${tx.v_id || '—'}</td>
          <td>${tx.description || '—'}</td>
          <td style='text-align:right' class='amt-${tx.type}'>${tx.type === 'expense' ? '−' : '+'}₹${parseFloat(tx.amount).toLocaleString('en-IN')}</td>
        </tr>`).join('')}</tbody></table>
        <div class='summary'>
          <div><span>Records</span><strong>${rows.length}</strong></div>
          <div><span>Total</span><strong>₹${rows.reduce((s, tx) => s + (tx.type === 'expense' ? -1 : 1) * parseFloat(tx.amount || 0), 0).toLocaleString('en-IN')}</strong></div>
        </div>
        </body></html>`;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.onload = () => { win.print(); win.close(); };
    };

    if (authLoading || !user) return <div className="loading-screen">Authenticating...</div>;

    const netColor = parseFloat(summary.net_balance) >= 0 ? '#10b981' : '#c5111a';
    const filteredLedger = activeTab === 'all' ? ledger : ledger.filter(tx => tx.type === activeTab);

    const TABS = [
        { key: 'all', label: 'All', icon: 'list_alt', color: '#023149', bg: '#e8f0fe' },
        { key: 'commission', label: 'Commission', icon: 'directions_car', color: '#1e40af', bg: '#eff6ff' },
        { key: 'expense', label: 'Expenses', icon: 'receipt_long', color: '#991b1b', bg: '#fee2e2' },
        { key: 'income', label: 'Other Income', icon: 'savings', color: '#166534', bg: '#dcfce7' },
    ];

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <h1>Ledger & Office Accounting</h1>
                    <p>Record commissions, office income, expenses and download reports.</p>
                </div>
            </div>

            <div className="page-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>

                {/* ── Summary Bar ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {[
                        { label: 'Total Income', value: summary.total_income, color: '#10b981', icon: 'trending_up' },
                        { label: 'Total Expense', value: summary.total_expense, color: '#c5111a', icon: 'trending_down' },
                        { label: 'Net Balance', value: summary.net_balance, color: netColor, icon: 'account_balance' },
                    ].map(card => (
                        <div key={card.label} style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', borderTop: `4px solid ${card.color}`, boxShadow: '0 1px 4px rgba(2,49,73,.07)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <span className="material-icons" style={{ color: card.color, fontSize: 22 }}>{card.icon}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280' }}>{card.label}</span>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: card.color }}>
                                ₹{parseFloat(card.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                            </div>
                            {filterFrom || filterTo ? (
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                    {filterFrom || '...'} → {filterTo || '...'}
                                </div>
                            ) : (
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>All time</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── 3 Entry Form Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

                    {/* Card 1: Taxi Commission */}
                    <div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 2px 8px rgba(2,49,73,.06)', borderTop: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#10b981', fontSize: 20 }}>account_balance_wallet</span>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Taxi Commission</h2>
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Real-time 10% commission tracker per vehicle</p>
                            </div>
                        </div>

                        {/* Vehicle ID + Month row */}
                        <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-end' }}>
                            <div className="form-field" style={{ flex: 1, margin: 0 }}>
                                <label>Driver / Vehicle ID *</label>
                                <input
                                    type="text"
                                    value={commissionForm.v_id}
                                    onChange={e => setCommissionForm({ ...commissionForm, v_id: e.target.value })}
                                    placeholder="e.g. 232"
                                    required
                                />
                            </div>
                            <div style={{ margin: 0 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 }}>Month</label>
                                <MonthYearPicker value={vcMonth} onChange={setVcMonth} placeholder="Pick month" />
                            </div>
                        </div>

                        {/* Real-time tracker panel */}
                        {commissionForm.v_id.trim() && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                                {vcLoading ? (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
                                        <span className="material-icons" style={{ fontSize: 16, marginRight: 6, verticalAlign: 'middle' }}>sync</span>
                                        Fetching trip data...
                                    </div>
                                ) : vcTracking ? (
                                    <>
                                        {/* Stats row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
                                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Trips in {vcMonth}</div>
                                                <div style={{ fontSize: 20, fontWeight: 900, color: '#023149' }}>{vcTracking.trip_count}</div>
                                            </div>
                                            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Total Earnings</div>
                                                <div style={{ fontSize: 18, fontWeight: 900, color: '#023149' }}>₹{parseFloat(vcTracking.total_earnings).toLocaleString('en-IN')}</div>
                                            </div>
                                        </div>

                                        {/* Commission breakdown */}
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>10% Due</div>
                                                <div style={{ fontSize: 16, fontWeight: 900, color: '#1e40af' }}>₹{parseFloat(vcTracking.commission_due).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ flex: 1, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Paid</div>
                                                <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>₹{parseFloat(vcTracking.commission_paid).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ flex: 1, background: vcTracking.commission_pending > 0 ? '#fff7ed' : '#f0fdf4', border: `1px solid ${vcTracking.commission_pending > 0 ? '#fed7aa' : '#bbf7d0'}`, borderRadius: 8, padding: '8px 12px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: vcTracking.commission_pending > 0 ? '#c2410c' : '#166534', textTransform: 'uppercase' }}>
                                                    {vcTracking.commission_pending > 0 ? '⚠ Pending' : '✓ Cleared'}
                                                </div>
                                                <div style={{ fontSize: 16, fontWeight: 900, color: vcTracking.commission_pending > 0 ? '#ea580c' : '#16a34a' }}>
                                                    ₹{parseFloat(vcTracking.commission_pending).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Auto-fill pending into amount field */}
                                        {vcTracking.commission_pending > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setCommissionForm(f => ({ ...f, amount: vcTracking.commission_pending, description: `Commission for vehicle ${f.v_id} — ${vcMonth}` }))}
                                                style={{ marginTop: 10, width: '100%', background: '#023149', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                            >
                                                <span className="material-icons" style={{ fontSize: 15 }}>bolt</span>
                                                Auto-fill ₹{parseFloat(vcTracking.commission_pending).toLocaleString('en-IN')} Pending
                                            </button>
                                        )}
                                        {vcTracking.trip_count === 0 && (
                                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, paddingTop: 4 }}>No closed trips found for this vehicle in {vcMonth}.</div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: '4px 0' }}>Vehicle not found or no data.</div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleCommissionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="form-field">
                                <label>Amount (₹) *</label>
                                <input type="number" step="0.01" min="0" value={commissionForm.amount} onChange={e => setCommissionForm({ ...commissionForm, amount: e.target.value })} placeholder="0.00" style={{ fontSize: 18, fontWeight: 800 }} required />
                            </div>
                            <div className="form-field">
                                <label>Note</label>
                                <input type="text" value={commissionForm.description} onChange={e => setCommissionForm({ ...commissionForm, description: e.target.value })} placeholder="Weekly settlement..." />
                            </div>
                            <button type="submit" disabled={loadingData} style={{ background: '#10b981', color: '#fff', padding: '12px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loadingData ? 'not-allowed' : 'pointer', opacity: loadingData ? 0.7 : 1 }}>
                                + Register Commission
                            </button>
                        </form>
                    </div>

                    {/* Card 2: Office Income */}
                    <div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 2px 8px rgba(2,49,73,.06)', borderTop: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#3b82f6', fontSize: 20 }}>savings</span>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Other Office Income</h2>
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Misc incoming payments</p>
                            </div>
                        </div>
                        <form onSubmit={handleOfficeIncomeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-field">
                                    <label>Vehicle ID (Optional)</label>
                                    <input type="text" value={officeIncomeForm.v_id} onChange={e => setOfficeIncomeForm({ ...officeIncomeForm, v_id: e.target.value })} placeholder="e.g. 232" />
                                </div>
                                <div className="form-field">
                                    <label>Amount (₹) *</label>
                                    <input type="number" step="0.01" min="0" value={officeIncomeForm.amount} onChange={e => setOfficeIncomeForm({ ...officeIncomeForm, amount: e.target.value })} placeholder="0.00" style={{ fontSize: 18, fontWeight: 800 }} required />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Details / Receipt Note *</label>
                                <textarea value={officeIncomeForm.description} onChange={e => setOfficeIncomeForm({ ...officeIncomeForm, description: e.target.value })} style={{ minHeight: 80, resize: 'vertical' }} placeholder="e.g. Bonus received..." required />
                            </div>
                            <button type="submit" disabled={loadingData} style={{ background: '#3b82f6', color: '#fff', padding: '12px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loadingData ? 'not-allowed' : 'pointer', opacity: loadingData ? 0.7 : 1 }}>
                                + Register Income
                            </button>
                        </form>
                    </div>

                    {/* Card 3: Office Expenses (NEW) */}
                    <div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 2px 8px rgba(2,49,73,.06)', borderTop: '4px solid #c5111a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#c5111a', fontSize: 20 }}>receipt_long</span>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Office Expenses</h2>
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Rent, EB, Network, Salary...</p>
                            </div>
                        </div>
                        <form onSubmit={handleOfficeExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-field">
                                    <label>Category *</label>
                                    <select value={officeExpenseForm.category} onChange={e => setOfficeExpenseForm({ ...officeExpenseForm, category: e.target.value })}>
                                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Amount (₹) *</label>
                                    <input type="number" step="0.01" min="0" value={officeExpenseForm.amount} onChange={e => setOfficeExpenseForm({ ...officeExpenseForm, amount: e.target.value })} placeholder="0.00" style={{ fontSize: 18, fontWeight: 800 }} required />
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Description *</label>
                                <textarea value={officeExpenseForm.description} onChange={e => setOfficeExpenseForm({ ...officeExpenseForm, description: e.target.value })} style={{ minHeight: 80, resize: 'vertical' }} placeholder="e.g. April rent, EB bill for Mar..." required />
                            </div>
                            <button type="submit" disabled={loadingData} style={{ background: '#c5111a', color: '#fff', padding: '12px', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: loadingData ? 'not-allowed' : 'pointer', opacity: loadingData ? 0.7 : 1 }}>
                                + Register Expense
                            </button>
                        </form>
                    </div>

                </div>

                {/* ── Combined Ledger Table ── */}
                <div className="section" id="print-ledger">

                    {/* Type Filter Tabs */}
                    <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            const count = tab.key === 'all' ? ledger.length : ledger.filter(tx => tx.type === tab.key).length;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '8px 16px',
                                        border: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                                        borderBottom: isActive ? `2px solid #fff` : '2px solid transparent',
                                        borderRadius: '8px 8px 0 0',
                                        background: isActive ? '#fff' : 'transparent',
                                        color: isActive ? tab.color : '#6b7280',
                                        fontWeight: isActive ? 800 : 600,
                                        fontSize: 13,
                                        cursor: 'pointer',
                                        marginBottom: -1,
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: 16 }}>{tab.icon}</span>
                                    {tab.label}
                                    <span style={{
                                        background: isActive ? tab.bg : '#f1f5f9',
                                        color: isActive ? tab.color : '#9ca3af',
                                        borderRadius: 12, fontSize: 11, fontWeight: 700,
                                        padding: '1px 7px', minWidth: 20, textAlign: 'center'
                                    }}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="toolbar">
                        <div className="toolbar-group">
                            <div>
                                <label>FROM MONTH</label>
                                <MonthYearPicker value={filterFrom} onChange={setFilterFrom} placeholder="Select month" />
                            </div>
                            <div>
                                <label>TO MONTH</label>
                                <MonthYearPicker value={filterTo} onChange={setFilterTo} placeholder="Select month" />
                            </div>
                            {(filterFrom || filterTo) && (
                                <button className="btn-ghost no-print" onClick={() => { setFilterFrom(''); setFilterTo(''); }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>clear</span>
                                    Clear
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-primary no-print" onClick={() => handleDownloadFiltered(activeTab)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="material-icons" style={{ fontSize: 18 }}>picture_as_pdf</span>
                                Download {activeTab === 'all' ? 'All' : activeTab === 'commission' ? 'Commission' : activeTab === 'expense' ? 'Expenses' : 'Income'} PDF
                            </button>
                        </div>
                    </div>

                    <div className="table-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-icons" style={{ color: '#023149', fontSize: 20 }}>menu_book</span>
                            {activeTab === 'all' ? 'Finance Ledger' : activeTab === 'commission' ? 'Commission Ledger' : activeTab === 'expense' ? 'Expense Ledger' : 'Income Ledger'}
                            <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>{filteredLedger.length} records</span>
                        </div>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Category</th>
                                    <th>Vehicle</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                                    <th className="no-print" style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLedger.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : filteredLedger.map(tx => (
                                    <tr key={tx.id}>
                                        <td style={{ fontSize: 12, color: '#94a3b8' }}>{tx.id}</td>
                                        <td style={{ fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>
                                            {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            <span style={{ ...TYPE_BADGE[tx.type] || TYPE_BADGE.commission, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 13, fontWeight: 600, color: '#023149' }}>{tx.category}</td>
                                        <td style={{ fontSize: 13, color: '#475569' }}>{tx.v_id || '—'}</td>
                                        <td style={{ fontSize: 13, color: '#0f172a', maxWidth: 220 }}>{tx.description || '—'}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: 14, color: tx.type === 'expense' ? '#c5111a' : '#10b981', whiteSpace: 'nowrap' }}>
                                            {tx.type === 'expense' ? '−' : '+'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="no-print" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            <button onClick={() => openEditModal(tx)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px 6px', borderRadius: 4 }}>
                                                <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteTransaction(tx.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c5111a', padding: '4px 6px', borderRadius: 4 }}>
                                                <span className="material-icons" style={{ fontSize: 18 }}>delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>{/* /page-body */}

            {/* ── Edit Modal ── */}
            {editModalOpen && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModalOpen(false)}>
                    <div className="modal" style={{ maxWidth: 480 }}>
                        <div className="modal-header">
                            <h2>Edit Transaction #{editingTx?.id}</h2>
                            <button onClick={() => setEditModalOpen(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-body">
                                <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="form-field">
                                        <label>Category</label>
                                        {editingTx?.type === 'expense' ? (
                                            <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} />
                                        )}
                                    </div>
                                    <div className="form-field">
                                        <label>Amount (₹) *</label>
                                        <input type="number" step="0.01" min="0" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} style={{ fontSize: 20, fontWeight: 800 }} required />
                                    </div>
                                    <div className="form-field">
                                        <label>Description</label>
                                        <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ minHeight: 80, resize: 'vertical' }} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Print Styles ── */}
            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 landscape; }
                    body { background: white !important; }
                    .page-header, .sidebar, nav { display: none !important; }
                    .page-body > *:not(#print-ledger) { display: none !important; }
                    .no-print { display: none !important; }
                    #print-ledger {
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #print-ledger::before {
                        content: "Finance Ledger Report";
                        display: block;
                        font-size: 18px;
                        font-weight: 800;
                        color: #023149;
                        margin-bottom: 12px;
                    }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th { background: #023149 !important; color: white !important; padding: 8px; text-align: left; }
                    td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>

        </div>
    );
};

export default FinanceManagement;
