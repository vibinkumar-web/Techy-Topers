const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');

const patches = [
    { file: 'Assignments.jsx', s: '        setSelectedBooking(booking);\n        setSelectedVehicleId(\'\');', r: 'const handleSelectBooking = (booking) => {\n        setSelectedBooking(booking);\n        setSelectedVehicleId(\'\');' },
    { file: 'Assignments.jsx', s: '        setIsModalOpen(false);\n        setSelectedBooking(null);\n    };', r: 'const closeModal = () => {\n        setIsModalOpen(false);\n        setSelectedBooking(null);\n    };' },
    { file: 'AttachedVehicles.jsx', s: '        setFormData({ ...formData, [e.target.name]: e.target.value });\n    };', r: 'const handleChange = (e) => {\n        setFormData({ ...formData, [e.target.name]: e.target.value });\n    };' },
    { file: 'Bookings.jsx', s: '            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {\n                setShowSuggestions(false);', r: 'const handleClickOutside = (e) => {\n            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {\n                setShowSuggestions(false);' },
    { file: 'CustomerUpload.jsx', s: '        setFile(e.target.files[0]);\n        setResult(null);\n    };', r: 'const handleFileChange = (e) => {\n        setFile(e.target.files[0]);\n        setResult(null);\n    };' },
    { file: 'EditBooking.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };' },
    { file: 'EditTrip.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };' },
    { file: 'LocalTrip.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };' },
    { file: 'LocalTripClosing.jsx', s: '        return parseFloat(formData.net_total || 0);\n    };', r: 'const calculateNetTotal = () => {\n        return parseFloat(formData.net_total || 0);\n    };' },
    { file: 'Staff.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };' },
    { file: 'Staff.jsx', s: '        setFormData(initialFormState);\n        setIsEdit(false);\n        setShowModal(true);\n    };', r: 'const handleAdd = () => {\n        setFormData(initialFormState);\n        setIsEdit(false);\n        setShowModal(true);\n    };' },
    { file: 'Staff.jsx', s: '        setFormData(staff);\n        setIsEdit(true);\n        setShowModal(true);\n    };', r: 'const handleEdit = (staff) => {\n        setFormData(staff);\n        setIsEdit(true);\n        setShowModal(true);\n    };' },
    { file: 'StaffAttendance.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });' },
    { file: 'Tariff.jsx', s: '        const { name, value } = e.target;\n        setTariffData(prev => ({ ...prev, [name]: value }));\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setTariffData(prev => ({ ...prev, [name]: value }));\n    };' },
    { file: 'TripClosing.jsx', s: '        const b_id = e.target.value;\n        setSelectedBid(b_id);', r: 'const handleVehicleSelect = (e) => {\n        const b_id = e.target.value;\n        setSelectedBid(b_id);' },
    { file: 'TripClosing.jsx', s: '        const { name, value } = e.target;\n        setFormData(prev => ({ ...prev, [name]: value }));\n    };', r: 'const handleInputChange = (e) => {\n        const { name, value } = e.target;\n        setFormData(prev => ({ ...prev, [name]: value }));\n    };' },
    { file: 'TripClosing.jsx', s: '        if (!tripDetails) return;\n\n        const openKm = parseFloat(tripDetails.open_km)', r: 'const calculateFare = () => {\n        if (!tripDetails) return;\n\n        const openKm = parseFloat(tripDetails.open_km)' },
    { file: 'VehicleMaster.jsx', s: '        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData({ ...formData, [name]: value });\n    };' },
    { file: 'VehicleMaster.jsx', s: '        setFormData(initialFormState);\n        setIsEdit(false);\n        setShowModal(true);\n    };', r: 'const handleAdd = () => {\n        setFormData(initialFormState);\n        setIsEdit(false);\n        setShowModal(true);\n    };' },
    { file: 'VehicleMaster.jsx', s: '        setFormData(vehicle);\n        setIsEdit(true);\n        setShowModal(true);\n    };', r: 'const handleEdit = (vehicle) => {\n        setFormData(vehicle);\n        setIsEdit(true);\n        setShowModal(true);\n    };' },
    { file: 'Vehicles.jsx', s: '        const { name, value } = e.target;\n        setFormData(prev => ({ ...prev, [name]: value }));\n    };', r: 'const handleChange = (e) => {\n        const { name, value } = e.target;\n        setFormData(prev => ({ ...prev, [name]: value }));\n    };' },
    { file: 'Vehicles.jsx', s: '        if (vehicle) {\n            setCurrentVehicle(vehicle);', r: 'const openModal = (vehicle = null) => {\n        if (vehicle) {\n            setCurrentVehicle(vehicle);' }
];

patches.forEach(p => {
    const fullPath = path.join(dir, p.file);
    let content = fs.readFileSync(fullPath, 'utf8');

    if (content.indexOf(p.s) !== -1) {
        content = content.replace(p.s, p.r);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Patched ${p.file}`);
    } else {
        console.log(`Failed to find string in ${p.file}:\n${p.s}`);
    }
});
