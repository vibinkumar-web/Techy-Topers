import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import AuthContext from '../context/AuthContext';

const EXPENSE_CATEGORIES = ['Rent', 'EB Bill', 'Network Bill', 'Staff Salary', 'Maintenance', 'Other'];

const TYPE_BADGE = {
    income:     { background: '#dcfce7', color: '#166534' },
    expense:    { background: '#fee2e2', color: '#991b1b' },
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

    // Form states
    const [commissionForm, setCommissionForm] = useState({ v_id: '', b_id: '', amount: '', description: '' });
    const [officeIncomeForm, setOfficeIncomeForm] = useState({ v_id: '', amount: '', description: '' });
    const [officeExpenseForm, setOfficeExpenseForm] = useState({ category: 'Rent', amount: '', description: '' });

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);
    const [editForm, setEditForm] = useState({ amount: '', description: '', category: '' });

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) fetchFinanceData();
    }, [user, filterFrom, filterTo]);

    const fetchFinanceData = async () => {
        try {
            const from = filterFrom ? `&from=${filterFrom}` : '';
            const to   = filterTo   ? `&to=${filterTo}`     : '';
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
                setCommissionForm({ v_id: '', b_id: '', amount: '', description: '' });
                fetchFinanceData();
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

    if (authLoading || !user) return <div className="loading-screen">Authenticating...</div>;

    const netColor = parseFloat(summary.net_balance) >= 0 ? '#10b981' : '#c5111a';

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '0 40px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, padding: '0 40px' }}>

                    {/* Card 1: Taxi Commission */}
                    <div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 2px 8px rgba(2,49,73,.06)', borderTop: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-icons" style={{ color: '#10b981', fontSize: 20 }}>account_balance_wallet</span>
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Taxi Commission</h2>
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Manual commission from drivers</p>
                            </div>
                        </div>
                        <form onSubmit={handleCommissionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="form-field">
                                    <label>Driver / Vehicle ID *</label>
                                    <input type="text" value={commissionForm.v_id} onChange={e => setCommissionForm({ ...commissionForm, v_id: e.target.value })} placeholder="e.g. 232" required />
                                </div>
                                <div className="form-field">
                                    <label>Booking ID (Optional)</label>
                                    <input type="number" value={commissionForm.b_id} onChange={e => setCommissionForm({ ...commissionForm, b_id: e.target.value })} placeholder="Trip ID" />
                                </div>
                            </div>
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
                <div className="section" id="print-ledger" style={{ margin: '0 40px' }}>

                    <div className="toolbar">
                        <div className="toolbar-group">
                            <div>
                                <label>From Month</label>
                                <input type="month" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} style={{ width: 160 }} />
                            </div>
                            <div>
                                <label>To Month</label>
                                <input type="month" value={filterTo} onChange={e => setFilterTo(e.target.value)} style={{ width: 160 }} />
                            </div>
                            {(filterFrom || filterTo) && (
                                <button className="btn-ghost no-print" onClick={() => { setFilterFrom(''); setFilterTo(''); }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>clear</span>
                                    Clear
                                </button>
                            )}
                        </div>
                        <button className="btn-primary no-print" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-icons" style={{ fontSize: 18 }}>picture_as_pdf</span>
                            Download PDF
                        </button>
                    </div>

                    <div className="table-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-icons" style={{ color: '#023149', fontSize: 20 }}>menu_book</span>
                            Finance Ledger
                            <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>{ledger.length} records</span>
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
                                {ledger.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                            No transactions found.
                                        </td>
                                    </tr>
                                ) : ledger.map(tx => (
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
