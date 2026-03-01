import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PrintBooking = () => {
    const toast = useToast();
    const { b_id } = useParams();
    const { api } = useContext(AuthContext);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // Using reports logic to find booking - note: this might be inefficient for single booking
                const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
                const found = response.data.find(b => b.b_id == b_id);
                setBooking(found);
            } catch (error) {
                console.error("Error fetching booking", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [b_id, api]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fdf6e8' }}>
            <div style={{ color: '#023149', fontWeight: 600 }}>Loading booking details...</div>
        </div>
    );

    if (!booking) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fdf6e8' }}>
            <div style={{ color: '#c5111a', fontWeight: 600 }}>Booking not found.</div>
        </div>
    );

    return (
        <div style={{ background: '#fdf6e8', minHeight: '100vh', padding: '40px 20px' }} className="print-wrapper">
            <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 48, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: 8 }} className="print-container">

                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #023149', paddingBottom: 24, marginBottom: 32 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#c5111a', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 8px 0' }}>Taxi Trips &amp; Travels</h1>
                    <p style={{ fontSize: 12, color: '#689abb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 16px 0' }}>Booking Confirmation Receipt</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, alignItems: 'center', background: '#f8fafc', padding: '16px 24px', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Confirmed Booking ID</span>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#023149', marginTop: 4 }}>#{booking.b_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Issue Date</span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#023149', marginTop: 4 }}>{booking.date || new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px 32px', fontSize: 14, color: '#374151', marginBottom: 48 }}>

                    <div style={{ borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Customer Name</span>
                        <span style={{ fontWeight: 800, color: '#023149', fontSize: 16 }}>{booking.cus_name}</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Customer Contact</span>
                        <span style={{ fontWeight: 700, color: '#023149', fontSize: 16 }}>{booking.cus_mobile}</span>
                    </div>

                    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Pickup Location</span>
                        <span style={{ fontWeight: 600, color: '#023149', fontSize: 15 }}>{booking.pickup}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Destination Drop</span>
                        <span style={{ fontWeight: 600, color: '#023149', fontSize: 15 }}>{booking.drop_place}</span>
                    </div>

                    <div style={{ borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Scheduled Pickup Time</span>
                        <span style={{ fontWeight: 700, color: '#023149', fontSize: 15 }}>{booking.pickup_time}</span>
                    </div>
                    <div style={{ borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Vehicle Category Preference</span>
                        <span style={{ fontWeight: 700, color: '#023149', fontSize: 15 }}>{booking.v_types} ({booking.ac_type})</span>
                    </div>

                    <div style={{ borderBottom: '1px solid #e8d4aa', paddingBottom: 12 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Booking Type</span>
                        <span style={{ fontWeight: 800, color: booking.b_type === '1' ? '#15803d' : '#023149', fontSize: 15 }}>
                            {booking.b_type === '1' ? 'ADVANCE BOOKING' : 'CURRENT BOOKING'}
                        </span>
                    </div>

                    <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e8d4aa', paddingBottom: 12, marginTop: 16 }}>
                        <span style={{ color: '#6b7280', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Special Request / Remarks</span>
                        <span style={{ fontStyle: 'italic', color: '#475569', fontSize: 14 }}>{booking.remarks || 'No special requirements noted.'}</span>
                    </div>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 64, paddingTop: 32, borderTop: '2px solid #023149' }}>
                    <div style={{ textAlign: 'center', width: 200 }}>
                        <div style={{ height: 64, borderBottom: '1px dashed #cbd5e1', marginBottom: 12 }}></div>
                        <p style={{ fontWeight: 700, color: '#023149', margin: 0, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em' }}>Customer Signature</p>
                    </div>
                    <div style={{ textAlign: 'center', width: 200 }}>
                        <div style={{ height: 64, borderBottom: '1px dashed #cbd5e1', marginBottom: 12 }}></div>
                        <p style={{ fontWeight: 700, color: '#023149', margin: 0, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.05em' }}>Authorized Agent Signature</p>
                    </div>
                </div>

                {/* Action */}
                <div className="no-print" style={{ marginTop: 64, textAlign: 'center' }}>
                    <button
                        onClick={() => window.print()}
                        className="btn-primary"
                        style={{ height: 48, padding: '0 40px', fontSize: 14 }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>print</span>
                        Print Official Booking Receipt
                    </button>
                    <div style={{ marginTop: 16, fontSize: 12, color: '#6b7280' }}>Document will be printed precisely as formatted above.</div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print-wrapper { background: transparent !important; padding: 0 !important; }
                    .print-container { box-shadow: none !important; border: none !important; padding: 0 !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
};

export default PrintBooking;
