import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const Tariff = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [tariffData, setTariffData] = useState({});
    const [loading, setLoading] = useState(false);

    // Vehicle Types from legacy tariff.php
    const vehicleTypes = [
        { id: 1, name: 'Indica' },
        { id: 2, name: 'Xcent' },
        { id: 3, name: 'Zest' },
        { id: 4, name: 'Etios' },
        { id: 5, name: 'Swift' },
        { id: 6, name: 'TUV 300' },
        { id: 7, name: 'Tavera' },
        { id: 8, name: 'Xylo' },
        { id: 9, name: 'Tempo' }
    ];

    useEffect(() => {
        if (selectedVehicle) {
            fetchTariff();
        } else {
            setTariffData({});
        }
    }, [selectedVehicle]);

    const fetchTariff = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/tariff.php?v_id=${selectedVehicle}`);
            setTariffData(response.data);
        } catch (error) {
            console.error("Error fetching tariff", error);
            // Initialize with empty if not found
            setTariffData({});
        } finally {
            setLoading(false);
        }
    };

    
        
const handleChange = (e) => {
        const { name, value } = e.target;
        setTariffData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tariff.php', {
                v_id: selectedVehicle,
                ...tariffData
            });
            toast('Tariff updated successfully.');
        } catch (error) {
            console.error("Error updating tariff", error);
            toast('Failed to update tariff.', 'error');
        }
    };

    const renderInput = (label, name) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</label>
            <input
                type="text"
                name={name}
                value={tariffData[name] || ''}
                onChange={handleChange}
                style={{
                    height: 40, padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: 6,
                    fontSize: 14, fontWeight: 700, color: '#0f172a', width: '100%',
                    background: '#f8fafc', transition: 'all 0.2s', outline: 'none'
                }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#0284c7'; e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.1)'; }}
                onBlur={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
            />
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Out-Station Economic Valuation Constants</h1>
                        <p>Configure parametric cost multipliers per classification scalar</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 1200 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
                                <label style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>Map Asset Classification:</label>
                                <div className="input-with-icon" style={{ flex: 1, maxWidth: 360 }}>
                                    <span className="material-icons" style={{ color: '#023149' }}>directions_car</span>
                                    <select
                                        value={selectedVehicle}
                                        onChange={(e) => setSelectedVehicle(e.target.value)}
                                        style={{ height: 48, fontWeight: 800, fontSize: 15 }}
                                    >
                                        <option value="">Awaiting Class Selection...</option>
                                        {vehicleTypes.map(v => (
                                            <option key={v.id} value={v.id}>{v.name} Class Node</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {selectedVehicle && (
                            <form onSubmit={handleSubmit} className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', animation: 'fadeIn 0.3s ease-out' }}>
                                <div style={{ padding: 32 }}>
                                    {loading ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 16 }}>
                                            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', animation: 'spin 2s linear infinite' }}>sync</span>
                                            <div style={{ color: '#475569', fontSize: 16, fontWeight: 700 }}>Extracting valuation scalars...</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>

                                                {/* Column 1 */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e2e8f0' }}>
                                                        <div style={{ background: '#f0f9ff', color: '#0284c7', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span className="material-icons" style={{ fontSize: 20 }}>schedule</span>
                                                        </div>
                                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Standard Profiles</h3>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                                        {renderInput("02 Hrs & 20 Km", "a1")}
                                                        {renderInput("04 Hrs & 70 Km", "a2")}
                                                        {renderInput("05 Hrs & 120 Km", "a3")}
                                                        {renderInput("06 Hrs & 170 Km", "a4")}
                                                        {renderInput("07 Hrs & 220 Km", "a5")}
                                                        {renderInput("09 Hrs & 270 Km", "a6")}
                                                        {renderInput("11 Hrs & 320 Km", "a7")}
                                                        {renderInput("12 Hrs & 370 Km", "a8")}
                                                        {renderInput("14 Hrs & 420 Km", "a9")}
                                                        {renderInput("16 Hrs & 470 Km", "a10")}
                                                        {renderInput("17 Hrs & 520 Km", "a11")}
                                                        {renderInput("19 Hrs & 570 Km", "a12")}
                                                        {renderInput("21 Hrs & 620 Km", "a13")}
                                                        {renderInput("23 Hrs & 670 Km", "a14")}
                                                        {renderInput("24 Hrs & 720 Km", "a15")}
                                                        {renderInput("27 Hrs & 770 Km", "a16")}
                                                        {renderInput("29 Hrs & 820 Km", "a17")}
                                                        {renderInput("32 Hrs & 870 Km", "a18")}
                                                    </div>
                                                </div>

                                                {/* Column 2 */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e2e8f0' }}>
                                                        <div style={{ background: '#f0fdf4', color: '#16a34a', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span className="material-icons" style={{ fontSize: 20 }}>commute</span>
                                                        </div>
                                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Intermediate Profiles</h3>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                                        {renderInput("Below 50 km", "a19")}
                                                        {renderInput("03 Hrs & 30 Km", "a20")}
                                                        {renderInput("04 Hrs & 80 Km", "a21")}
                                                        {renderInput("05 Hrs & 130 Km", "a22")}
                                                        {renderInput("06 Hrs & 180 Km", "a23")}
                                                        {renderInput("08 Hrs & 230 Km", "a24")}
                                                        {renderInput("09 Hrs & 280 Km", "a25")}
                                                        {renderInput("11 Hrs & 330 Km", "a26")}
                                                        {renderInput("13 Hrs & 380 Km", "a27")}
                                                        {renderInput("14 Hrs & 430 Km", "a28")}
                                                        {renderInput("16 Hrs & 480 Km", "a29")}
                                                        {renderInput("18 Hrs & 530 Km", "a30")}
                                                        {renderInput("19 Hrs & 580 Km", "a31")}
                                                        {renderInput("21 Hrs & 630 Km", "a32")}
                                                        {renderInput("23 Hrs & 680 Km", "a33")}
                                                        {renderInput("25 Hrs & 730 Km", "a34")}
                                                        {renderInput("27 Hrs & 780 Km", "a35")}
                                                        {renderInput("30 Hrs & 830 Km", "a36")}
                                                        {renderInput("33 Hrs & 880 Km", "a37")}
                                                    </div>
                                                </div>

                                                {/* Column 3 */}
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e2e8f0' }}>
                                                        <div style={{ background: '#fef2f2', color: '#dc2626', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span className="material-icons" style={{ fontSize: 20 }}>rocket_launch</span>
                                                        </div>
                                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Extended / Variance</h3>
                                                    </div>
                                                    <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                        <div style={{ flex: 1 }}>
                                                            {renderInput("Scalar 50 - 100 Km", "a38")}
                                                            {renderInput("04 Hrs & 50 Km", "a39")}
                                                            {renderInput("04 Hrs & 90 Km", "a40")}
                                                            {renderInput("05 Hrs & 140 Km", "a41")}
                                                            {renderInput("07 Hrs & 190 Km", "a42")}
                                                            {renderInput("08 Hrs & 240 Km", "a43")}
                                                            {renderInput("10 Hrs & 300 Km", "a44")}
                                                            {renderInput("11 Hrs & 340 Km", "a45")}
                                                            {renderInput("13 Hrs & 390 Km", "a46")}
                                                            {renderInput("15 Hrs & 450 Km", "a47")}
                                                            {renderInput("16 Hrs & 490 Km", "a48")}
                                                            {renderInput("18 Hrs & 540 Km", "a49")}
                                                            {renderInput("20 Hrs & 590 Km", "a50")}
                                                            {renderInput("22 Hrs & 640 Km", "a51")}
                                                            {renderInput("23 Hrs & 690 Km", "a52")}
                                                            {renderInput("25 Hrs & 740 Km", "a53")}
                                                            {renderInput("28 Hrs & 790 Km", "a54")}
                                                            {renderInput("30 Hrs & 840 Km", "a55")}
                                                            {renderInput("33 Hrs & 890 Km", "a56")}
                                                        </div>

                                                        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '2px dashed #cbd5e1' }}>
                                                            {renderInput("Scalar > 100 Km", "a57")}
                                                            {renderInput("Multiplier: Per Km", "a76")}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 32, marginTop: 32, borderTop: '1px solid #e2e8f0' }}>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn-primary"
                                                    style={{ height: 48, padding: '0 40px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 16, background: '#16a34a' }}
                                                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15803d'; }}
                                                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#16a34a'; }}
                                                >
                                                    <span className="material-icons" style={{ fontSize: 20 }}>save_as</span>
                                                    {loading ? 'Transmitting Matrix...' : 'Commit Economic Matrix'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Tariff;
