import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Staff = () => {
    const { api } = useContext(AuthContext);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        emp_id: '',
        name: '',
        u_type: 'Call Center Executive',
        mobile: '',
        pwd: '',
        address: '',
        dob: '',
        email: '',
        j_date: '',
        salary: '',
        per_month: '',
        hrsp_day: '',
        hrs_day: '',
        hrs_night: '',
        emp_status: '0', // 0: Working, 1: Resigned
        r_date: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff.php');
            setStaffList(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching staff", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'emp_status') {
            // For radio/checkbox handling if needed, but here we use select or value logic
            setFormData({ ...formData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const openNewModal = () => {
        setFormData(initialFormState);
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (staff) => {
        setFormData(staff);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/staff.php', formData);
                alert('Staff updated successfully');
            } else {
                await api.post('/staff.php', formData);
                alert('Staff created successfully');
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            console.error("Error saving staff", error);
            alert('Failed to save operation');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <button
                    onClick={openNewModal}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                    <span className="mr-2">+</span> Add New
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                        ) : staffList.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No staff found.</td></tr>
                        ) : (
                            staffList.map((staff) => (
                                <tr key={staff.emp_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.emp_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.u_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.mobile}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.emp_status === '0' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {staff.emp_status === '0' ? 'Working' : 'Resigned'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => openEditModal(staff)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
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
                    <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Staff' : 'Add New Staff'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Details */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700 border-b pb-2">Personal Details</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                                    <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">DOB</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" rows="2"></textarea>
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700 border-b pb-2">Employment Details</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">User Type</label>
                                    <select name="u_type" value={formData.u_type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Call Center Executive">Call Center Executive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input type="text" name="pwd" value={formData.pwd} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                    <input type="date" name="j_date" value={formData.j_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                                        <input type="text" name="salary" value={formData.salary} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Per Month</label>
                                        <input type="text" name="per_month" value={formData.per_month} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Hrs/Day</label>
                                        <input type="text" name="hrsp_day" value={formData.hrsp_day} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">1Hr Sal (Day)</label>
                                        <input type="text" name="hrs_day" value={formData.hrs_day} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">1Hr Sal (Nit)</label>
                                        <input type="text" name="hrs_night" value={formData.hrs_night} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <label className="flex items-center">
                                            <input type="radio" name="emp_status" value="0" checked={formData.emp_status === '0'} onChange={handleInputChange} className="mr-2" />
                                            Working
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="emp_status" value="1" checked={formData.emp_status === '1'} onChange={handleInputChange} className="mr-2" />
                                            Resigned
                                        </label>
                                    </div>
                                </div>
                                {formData.emp_status === '1' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Resigned Date</label>
                                        <input type="date" name="r_date" value={formData.r_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                                    </div>
                                )}
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end space-x-4 mt-4 pt-4 border-t">
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
                                    {isEdit ? 'Update Staff' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Staff;
