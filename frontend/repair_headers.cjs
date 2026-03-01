const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'pages');

const filesToFix = [
    'AssignLater.jsx', 'Assignments.jsx', 'AttachedVehicles.jsx', 'Bookings.jsx',
    'CancelBooking.jsx', 'CustomerUpload.jsx', 'EditBooking.jsx', 'EditTrip.jsx',
    'FinanceManagement.jsx', 'LocalTrip.jsx', 'LocalTripClosing.jsx', 'Settings.jsx',
    'Staff.jsx', 'StaffAttendance.jsx', 'Tariff.jsx', 'TripClosing.jsx',
    'TripRefusal.jsx', 'VehicleInOut.jsx', 'VehicleMaster.jsx', 'Vehicles.jsx'
];

filesToFix.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    const compName = file.replace('.jsx', '');

    // 1. Restore the main component header and toast hook right before the first React Hook / state
    // We look for 'const { api' or 'const [loading' or 'const [formData' or 'const navigate'
    // But safely, we can just find the LAST import statement!

    // Find the end of the imports block
    const importMatches = [...content.matchAll(/^import .*?;?\s*$/gm)];
    if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const insertIndex = lastImport.index + lastImport[0].length;

        let header = `\n\nconst ${compName} = () => {\n    const toast = useToast();\n`;

        content = content.slice(0, insertIndex) + header + content.slice(insertIndex).replace(/^\s+/, '');
    }

    fs.writeFileSync(fullPath, content, 'utf8');
});
console.log('Restored main component headers.');
