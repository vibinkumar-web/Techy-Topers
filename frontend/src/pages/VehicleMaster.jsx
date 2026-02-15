import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const VehicleMaster = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        v_cat: '',
        v_brand: '',
        v_model: '',
        v_no: '',
        joining: '',
        ie_date: '',
        fc_date: '',
        pe_date: '', // Permit Exp
        puc_date: '', // Pollution C
        rt_date: '', // Road Tax
        v_id: '',
        v_own: '1', // 1: Attach, 0: Admin
        seat_a: '',
        att_type: '',
        d_mobile: '',
        o_mobile: '',
        adv_amt: '',
        y_model: '',
        d_name: '',
        o_name: '',
        vacant_place: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles.php');
            setVehicles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openNewModal = () => {
        setFormData(initialFormState);
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setFormData(vehicle);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/vehicles.php', formData);
                alert('Vehicle updated successfully');
            } else {
                await api.post('/vehicles.php', formData);
                alert('Vehicle attached successfully');
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            console.error("Error saving vehicle", error);
            alert('Failed to save operation. ' + (error.response?.data?.message || ''));
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Vehicle Master</h1>
                <button
                    onClick={openNewModal}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                    <span className="mr-2">+</span> Add Vehicle
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">V-ID</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
                        ) : vehicles.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-4">No vehicles found.</td></tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.v_id} className="hover:bg-gray-50">
                                    <td className="px-3 py-4 whitespace-nowrap font-bold text-gray-900">{v.v_id}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.v_cat}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.v_brand}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.v_model}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.v_no}</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.d_name} ({v.d_mobile})</td>
                                    <td className="px-3 py-4 whitespace-nowrap text-gray-500">{v.o_name} ({v.o_mobile})</td>
                                    <td className="px-3 py-4 whitespace-nowrap font-medium">
                                        <button onClick={() => openEditModal(v)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-6xl m-4 max-h-[95vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Vehicle' : 'Attach New Vehicle'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            {/* Column 1 */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-700">Vehicle Category</label>
                                    <select name="v_cat" value={formData.v_cat} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1">
                                        <option value="">Select Category</option>
                                        <option value="Mini">Mini</option>
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Van">Van</option>
                                        <option value="Tempo">Tempo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700">Joining Date</label>
                                    <input type="date" name="joining" value={formData.joining} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Pollution Exp Date</label>
                                    <input type="date" name="puc_date" value={formData.puc_date} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Seat Availability</label>
                                    <input type="text" name="seat_a" value={formData.seat_a} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Advance Amount</label>
                                    <input type="text" name="adv_amt" value={formData.adv_amt} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-700">Vehicle Brand</label>
                                    <select name="v_brand" value={formData.v_brand} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1">
                                        <option value="">Select Brand</option>
                                        <option value="Honda">Honda</option>
                                        <option value="Toyota">Toyota</option>
                                        <option value="Maruthi">Maruthi</option>
                                        <option value="Hyundai">Hyundai</option>
                                        <option value="Tata">Tata</option>
                                        <option value="chevrolate">Chevrolate</option>
                                        <option value="Ashok Laylond">Ashok Laylond</option>
                                        <option value="Ford">Ford</option>
                                        <option value="Mahendra">Mahendra</option>
                                        <option value="Nissan">Nissan</option>
                                        <option value="Renault">Renault</option>
                                        <option value="Tempo">Tempo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700">Ins Exp Date</label>
                                    <input type="date" name="ie_date" value={formData.ie_date} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Road Tax Date</label>
                                    <input type="date" name="rt_date" value={formData.rt_date} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Attach Type</label>
                                    <select name="att_type" value={formData.att_type} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1">
                                        <option value="">Select Attachment Type</option>
                                        <option value="OCD">Owner Cum Driver</option>
                                        <option value="O&D">Owner With Driver</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700">Year Model</label>
                                    <input type="text" name="y_model" value={formData.y_model} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-700">Vehicle Model</label>
                                    <select name="v_model" value={formData.v_model} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1">
                                        <option value="">Select Model</option>
                                        <option value="Swift">Swift</option>
                                        <option value="Xcent">Xcent</option>
                                        <option value="Indica">Indica</option>
                                        <option value="Bolt">Bolt</option>
                                        {/* Add more as needed */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700">FC Exp Date</label>
                                    <input type="date" name="fc_date" value={formData.fc_date} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Vehicle ID</label>
                                    <input type="text" name="v_id" value={formData.v_id} onChange={handleInputChange} readOnly={isEdit} className={`mt-1 block w-full border rounded p-1 ${isEdit ? 'bg-gray-100' : ''}`} required />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Driver Name</label>
                                    <input type="text" name="d_name" value={formData.d_name} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Driver Mobile</label>
                                    <input type="text" name="d_mobile" value={formData.d_mobile} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Vacant</label>
                                    <input type="text" name="vacant_place" value={formData.vacant_place} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                            </div>

                            {/* Column 4 */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-700">Vehicle No</label>
                                    <input type="text" name="v_no" value={formData.v_no} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" required />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Permit Exp Date</label>
                                    <input type="date" name="pe_date" value={formData.pe_date} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Ownership</label>
                                    <select name="v_own" value={formData.v_own} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1">
                                        <option value="1">Attach</option>
                                        <option value="0">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700">Owner Name</label>
                                    <input type="text" name="o_name" value={formData.o_name} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Owner Mobile</label>
                                    <input type="text" name="o_mobile" value={formData.o_mobile} onChange={handleInputChange} className="mt-1 block w-full border rounded p-1" />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-4 flex justify-end space-x-4 mt-4 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {isEdit ? 'Update Vehicle' : 'Attach Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleMaster;
