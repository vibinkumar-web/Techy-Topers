import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrintBooking = () => {
    const { b_id } = useParams();
    const { api } = useContext(AuthContext);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [b_id]);

    const fetchBooking = async () => {
        try {
            // Using reports logic to find booking
            const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
            const found = response.data.find(b => b.b_id == b_id);
            setBooking(found);
        } catch (error) {
            console.error("Error fetching booking", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!booking) return <div>Booking not found.</div>;

    return (
        <div className="p-8 max-w-3xl mx-auto bg-white text-black">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-3xl font-bold uppercase">Friends Track</h1>
                <p className="text-sm">Tour & Travels</p>
                <h2 className="text-xl font-bold mt-2">Booking Confirmation</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm font-serif">
                <div className="border p-2">
                    <strong>Booking ID:</strong> {booking.b_id}
                </div>
                <div className="border p-2">
                    <strong>Date:</strong> {booking.date}
                </div>

                <div className="border p-2">
                    <strong>Customer Name:</strong> {booking.cus_name}
                </div>
                <div className="border p-2">
                    <strong>Mobile:</strong> {booking.cus_mobile}
                </div>

                <div className="border p-2 col-span-2">
                    <strong>Pickup Place:</strong> {booking.pickup}
                </div>
                <div className="border p-2 col-span-2">
                    <strong>Drop Place:</strong> {booking.drop_place}
                </div>

                <div className="border p-2">
                    <strong>Pickup Time:</strong> {booking.pickup_time}
                </div>
                <div className="border p-2">
                    <strong>Vehicle Type:</strong> {booking.v_types}
                </div>
                <div className="border p-2">
                    <strong>AC Type:</strong> {booking.ac_type}
                </div>
                <div className="border p-2">
                    <strong>Booking Type:</strong> {booking.b_type === '1' ? 'Advance' : 'Current'}
                </div>

                <div className="border p-2 col-span-2">
                    <strong>Remarks:</strong> {booking.remarks}
                </div>
            </div>

            <div className="mt-8 pt-8 border-t-2 border-black flex justify-between">
                <div>
                    <p className="font-bold">Customer Signature</p>
                </div>
                <div>
                    <p className="font-bold">Authorized Signature</p>
                </div>
            </div>

            <div className="mt-8 text-center no-print">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    Print Booking
                </button>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none; }
                    body { background: white; }
                    .max-w-3xl { max-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default PrintBooking;
