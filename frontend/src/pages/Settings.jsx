import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Settings = () => {
    const { api, user } = useContext(AuthContext);
    const [smsOption, setSmsOption] = useState('0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const response = await api.get(`/settings.php?user_id=${user.emp_id}`);
            if (response.data && response.data.smsoption !== undefined) {
                setSmsOption(response.data.smsoption);
            }
        } catch (error) {
            console.error("Error fetching settings", error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/settings.php', {
                user_id: user.emp_id,
                smsoption: smsOption
            });
            alert('Settings saved successfully.');
        } catch (error) {
            console.error("Error saving settings", error);
            alert('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
                    <div className="mt-4 flex items-center space-x-6">
                        <div className="flex items-center">
                            <input
                                id="sms-on"
                                name="sms-option"
                                type="radio"
                                value="1"
                                checked={smsOption === '1'}
                                onChange={(e) => setSmsOption(e.target.value)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor="sms-on" className="ml-3 block text-sm font-medium text-gray-700">
                                ON
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="sms-off"
                                name="sms-option"
                                type="radio"
                                value="0"
                                checked={smsOption === '0'}
                                onChange={(e) => setSmsOption(e.target.value)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor="sms-off" className="ml-3 block text-sm font-medium text-gray-700">
                                OFF
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
