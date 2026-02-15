import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AttachedVehicles = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
        ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
        v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
        o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/attached_vehicles.php');
            setVehicles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/attached_vehicles.php', formData);
                alert('Vehicle updated successfully');
            } else {
                await api.post('/attached_vehicles.php', formData);
                alert('Vehicle attached successfully');
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            console.error("Error saving vehicle", error);
            alert('Failed to save vehicle');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Attached Vehicles</h1>
                <button onClick={() => { setFormData(initialFormState); setIsEdit(false); setShowModal(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    + Attach New Vehicle
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand/Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr> :
                            vehicles.map((v) => (
                                <tr key={v.v_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.v_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.v_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.v_brand} {v.v_model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.o_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.o_mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => { setFormData(v); setIsEdit(true); setShowModal(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-6">{isEdit ? 'Edit Vehicle' : 'Attach New Vehicle'}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            <input name="v_id" placeholder="Vehicle ID" value={formData.v_id} onChange={handleInputChange} className="border p-2 rounded" required />
                            <input name="v_no" placeholder="Vehicle No" value={formData.v_no} onChange={handleInputChange} className="border p-2 rounded" required />
                            <select name="v_cat" value={formData.v_cat} onChange={handleInputChange} className="border p-2 rounded">
                                <option value="">Select Category</option><option>Mini</option><option>Sedan</option><option>SUV</option><option>Van</option>
                            </select>

                            <input name="v_brand" placeholder="Brand" value={formData.v_brand} onChange={handleInputChange} className="border p-2 rounded" />
                            <input name="v_model" placeholder="Model" value={formData.v_model} onChange={handleInputChange} className="border p-2 rounded" />
                            <input name="joining" type="date" placeholder="Joining Date" value={formData.joining} onChange={handleInputChange} className="border p-2 rounded" />

                            <input name="o_name" placeholder="Owner Name" value={formData.o_name} onChange={handleInputChange} className="border p-2 rounded" />
                            <input name="o_mobile" placeholder="Owner Mobile" value={formData.o_mobile} onChange={handleInputChange} className="border p-2 rounded" />
                            <input name="d_name" placeholder="Driver Name" value={formData.d_name} onChange={handleInputChange} className="border p-2 rounded" />

                            <input name="d_mobile" placeholder="Driver Mobile" value={formData.d_mobile} onChange={handleInputChange} className="border p-2 rounded" />
                            <select name="v_own" value={formData.v_own} onChange={handleInputChange} className="border p-2 rounded">
                                <option value="1">Attach</option><option value="0">Admin</option>
                            </select>
                            <input name="adv_amt" placeholder="Advance Amount" value={formData.adv_amt} onChange={handleInputChange} className="border p-2 rounded" />

                            <div className="col-span-3 flex justify-end space-x-4 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachedVehicles;
