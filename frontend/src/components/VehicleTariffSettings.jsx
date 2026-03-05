import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const VehicleTariffSettings = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editNonAc, setEditNonAc] = useState('');
    const [editAc, setEditAc] = useState('');
    const [saving, setSaving] = useState(false);

    const [isAdding, setIsAdding] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ v_name: '', kmnonac: '', kmac: '' });

    // Base Fare state
    const [baseFare, setBaseFare] = useState(190);
    const [baseFareEdit, setBaseFareEdit] = useState('');
    const [editingBaseFare, setEditingBaseFare] = useState(false);
    const [savingBaseFare, setSavingBaseFare] = useState(false);

    useEffect(() => {
        fetchPrices();
        fetchBaseFare();
    }, []);

    const fetchBaseFare = async () => {
        try {
            const res = await api.get('/settings.php?config=base_fare');
            setBaseFare(res.data.base_fare ?? 190);
        } catch (e) {
            console.error('Failed to load base fare', e);
        }
    };

    const handleSaveBaseFare = async () => {
        const val = parseFloat(baseFareEdit);
        if (!val || val <= 0) { toast('Please enter a valid base fare amount.', 'error'); return; }
        setSavingBaseFare(true);
        try {
            await api.post('/settings.php', { action: 'save_base_fare', base_fare: val });
            setBaseFare(val);
            setEditingBaseFare(false);
            toast('Base fare updated successfully!');
        } catch (e) {
            toast('Failed to save base fare.', 'error');
        } finally {
            setSavingBaseFare(false);
        }
    };

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await api.get('/vehicle_pricing.php');
            setVehicles(response.data || []);
        } catch (error) {
            console.error("Error fetching vehicle prices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingId(vehicle.id);
        setEditNonAc(vehicle.kmnonac);
        setEditAc(vehicle.kmac);
    };

    const handleSave = async (v) => {
        setSaving(true);
        try {
            await api.post('/vehicle_pricing.php', {
                id: v.id,
                kmnonac: editNonAc,
                kmac: editAc
            });
            // Update local state without refetching to be fast
            setVehicles(vehicles.map(item => item.id === v.id ? { ...item, kmnonac: editNonAc, kmac: editAc } : item));
            setEditingId(null);
        } catch (error) {
            console.error("Error updating price:", error);
            toast("Failed to update price.", 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (v) => {
        if (!window.confirm(`Delete "${v.v_name}"? This cannot be undone.`)) return;
        try {
            await api.post('/vehicle_pricing.php', { action: 'delete', id: v.id });
            setVehicles(vehicles.filter(item => item.id !== v.id));
            toast(`"${v.v_name}" deleted.`);
        } catch (error) {
            toast('Failed to delete vehicle.', 'error');
        }
    };

    const handleCreateNew = async () => {
        if (!newVehicle.v_name) return toast("Please enter a vehicle name", 'warning');
        setSaving(true);
        try {
            await api.post('/vehicle_pricing.php', {
                v_name: newVehicle.v_name,
                kmnonac: newVehicle.kmnonac || 0,
                kmac: newVehicle.kmac || 0
            });
            // Refetch to get the accurate ID from database
            await fetchPrices();
            setIsAdding(false);
            setNewVehicle({ v_name: '', kmnonac: '', kmac: '' });
        } catch (error) {
            console.error("Error creating vehicle:", error);
            toast("Failed to create new vehicle.", 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 20, color: '#64748b' }}>Loading price matrix...</div>;

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fdf4ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-icons" style={{ fontSize: 24 }}>local_taxi</span>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                        Vehicle Per-Kilometer Tariff
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                        Base rate calculations for extra kilometers on Outstation and Local trips
                    </p>
                </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Vehicle Classification</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Non-AC Rate/KM (₹)</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>AC Rate/KM (₹)</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background .2s', background: editingId === v.id ? '#fdf8f6' : '#fff' }}>
                                <td style={{ padding: '16px 24px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                                    {v.v_name}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {editingId === v.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ color: '#64748b', fontWeight: 700 }}>₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editNonAc}
                                                onChange={(e) => setEditNonAc(e.target.value)}
                                                autoFocus
                                                style={{
                                                    width: 80, height: 36, padding: '0 12px',
                                                    border: '2px solid #0284c7', borderRadius: 6,
                                                    fontSize: 15, fontWeight: 800, color: '#0f172a',
                                                    outline: 'none', background: '#fff'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 14, color: '#64748b' }}>₹</span>
                                            {Number(v.kmnonac).toFixed(2)}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {editingId === v.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ color: '#64748b', fontWeight: 700 }}>₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editAc}
                                                onChange={(e) => setEditAc(e.target.value)}
                                                style={{
                                                    width: 80, height: 36, padding: '0 12px',
                                                    border: '2px solid #0284c7', borderRadius: 6,
                                                    fontSize: 15, fontWeight: 800, color: '#0f172a',
                                                    outline: 'none', background: '#fff'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 14, color: '#64748b' }}>₹</span>
                                            {Number(v.kmac).toFixed(2)}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    {editingId === v.id ? (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                                            >Cancel</button>
                                            <button
                                                onClick={() => handleSave(v)}
                                                disabled={saving}
                                                style={{ padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#fff', background: '#c026d3', border: 'none', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                {saving ? <span className="material-icons" style={{ fontSize: 14, animation: 'spin 1s linear infinite' }}>sync</span> : <span className="material-icons" style={{ fontSize: 14 }}>check</span>}
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleEdit(v)}
                                                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#c026d3', background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all .2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#fae8ff'; e.currentTarget.style.borderColor = '#e879f9'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fdf4ff'; e.currentTarget.style.borderColor = '#f5d0fe'; }}
                                            >
                                                <span className="material-icons" style={{ fontSize: 14 }}>edit</span>
                                                Edit Rate
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v)}
                                                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#c5111a', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all .2s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#ffe4e6'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#fecdd3'; }}
                                                title="Delete vehicle"
                                            >
                                                <span className="material-icons" style={{ fontSize: 14 }}>delete</span>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {isAdding && (
                            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fdf8f6' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <input
                                        type="text"
                                        placeholder="Add New Vehicle..."
                                        value={newVehicle.v_name}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, v_name: e.target.value })}
                                        autoFocus
                                        style={{
                                            width: '100%', height: 36, padding: '0 12px',
                                            border: '2px solid #0284c7', borderRadius: 6,
                                            fontSize: 15, fontWeight: 800, color: '#0f172a',
                                            outline: 'none', background: '#fff'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ color: '#64748b', fontWeight: 700 }}>₹</span>
                                        <input
                                            type="number" step="0.01" placeholder="0.00"
                                            value={newVehicle.kmnonac}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, kmnonac: e.target.value })}
                                            style={{
                                                width: 80, height: 36, padding: '0 12px',
                                                border: '2px solid #0284c7', borderRadius: 6,
                                                fontSize: 15, fontWeight: 800, color: '#0f172a',
                                                outline: 'none', background: '#fff'
                                            }}
                                        />
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ color: '#64748b', fontWeight: 700 }}>₹</span>
                                        <input
                                            type="number" step="0.01" placeholder="0.00"
                                            value={newVehicle.kmac}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, kmac: e.target.value })}
                                            style={{
                                                width: 80, height: 36, padding: '0 12px',
                                                border: '2px solid #0284c7', borderRadius: 6,
                                                fontSize: 15, fontWeight: 800, color: '#0f172a',
                                                outline: 'none', background: '#fff'
                                            }}
                                        />
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        <button
                                            onClick={() => setIsAdding(false)}
                                            style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer' }}
                                        >Cancel</button>
                                        <button
                                            onClick={handleCreateNew}
                                            disabled={saving}
                                            style={{ padding: '6px 16px', fontSize: 12, fontWeight: 700, color: '#fff', background: '#0284c7', border: 'none', borderRadius: 6, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            {saving ? <span className="material-icons" style={{ fontSize: 14, animation: 'spin 1s linear infinite' }}>sync</span> : <span className="material-icons" style={{ fontSize: 14 }}>add</span>}
                                            Add
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isAdding && (
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    <button
                        onClick={() => setIsAdding(true)}
                        style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, color: '#fff', background: '#0f172a', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>add_circle</span>
                        Create New Vehicle
                    </button>
                </div>
            )}
        </div>
    );
};

export default VehicleTariffSettings;
