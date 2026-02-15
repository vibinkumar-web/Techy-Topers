import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Vehicles = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [formData, setFormData] = useState({
        v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
        ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
        v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
        o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles.php');
            if (Array.isArray(response.data)) {
                setVehicles(response.data);
            } else {
                setVehicles([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setVehicles([]);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (vehicle = null) => {
        if (vehicle) {
            setCurrentVehicle(vehicle);
            setFormData(vehicle);
        } else {
            setCurrentVehicle(null);
            setFormData({
                v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
                ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
                v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
                o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentVehicle(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentVehicle) {
                await api.put('/vehicles.php', formData);
            } else {
                await api.post('/vehicles.php', formData);
            }
            fetchVehicles();
            closeModal();
        } catch (error) {
            console.error("Error saving vehicle", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add Vehicle
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(vehicles) && vehicles.map((vehicle) => (
                            <tr key={vehicle.v_id || Math.random()}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle.v_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.v_cat}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.v_no}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.v_brand} {vehicle.v_model}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.d_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.d_mobile}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => openModal(vehicle)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{currentVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Row 1 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                                <input type="text" name="v_id" value={formData.v_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select name="v_cat" value={formData.v_cat} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                    <option value="">Select Category</option>
                                    <option value="Mini">Mini</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Van">Van</option>
                                    <option value="Tempo">Tempo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                <input type="text" name="v_brand" value={formData.v_brand} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>

                            {/* Row 2 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Model</label>
                                <input type="text" name="v_model" value={formData.v_model} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Number</label>
                                <input type="text" name="v_no" value={formData.v_no} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                <input type="date" name="joining" value={formData.joining} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>

                            {/* Row 3 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Insurance Exp</label>
                                <input type="date" name="ie_date" value={formData.ie_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">FC Exp</label>
                                <input type="date" name="fc_date" value={formData.fc_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Permit Exp</label>
                                <input type="date" name="pe_date" value={formData.pe_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>

                            {/* Row 4 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pollution Exp</label>
                                <input type="date" name="puc_date" value={formData.puc_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Road Tax Date</label>
                                <input type="date" name="rt_date" value={formData.rt_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Year Model</label>
                                <input type="text" name="y_model" value={formData.y_model} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>

                            {/* Row 5 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                                <input type="text" name="d_name" value={formData.d_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Driver Mobile</label>
                                <input type="text" name="d_mobile" value={formData.d_mobile} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Seats</label>
                                <input type="text" name="seat_a" value={formData.seat_a} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>

                            {/* Row 6 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                                <input type="text" name="o_name" value={formData.o_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Owner Mobile</label>
                                <input type="text" name="o_mobile" value={formData.o_mobile} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ownership</label>
                                <select name="v_own" value={formData.v_own} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                    <option value="1">Attach</option>
                                    <option value="0">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Advance Amount</label>
                                <input type="text" name="adv_amt" value={formData.adv_amt} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vacant Place</label>
                                <input type="text" name="vacant_place" value={formData.vacant_place} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attach Type</label>
                                <select name="att_type" value={formData.att_type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                    <option value="">Select Type</option>
                                    <option value="OCD">Owner Cum Driver</option>
                                    <option value="O&D">Owner With Driver</option>
                                </select>
                            </div>

                            <div className="col-span-1 md:col-span-3 flex justify-end space-x-3 mt-4">
                                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
