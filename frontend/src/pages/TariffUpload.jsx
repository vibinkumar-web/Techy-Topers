import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const TariffUpload = () => {
    const { api } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/tariff_upload.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
        } catch (error) {
            console.error("Upload failed", error);
            setResult({ message: 'Upload failed', error: error.message });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Tariff Bulk Upload</h1>

            <div className="bg-white shadow rounded-lg p-6 max-w-xl">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Format Requirement:</strong> CSV file with columns: V-Type, Tariff-Type, A1...A103.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select CSV File</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-gray-400"
                    >
                        {uploading ? 'Uploading...' : 'Upload Tariffs'}
                    </button>
                </form>

                {result && (
                    <div className="mt-6 p-4 rounded-md bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">Result</h3>
                        <p className="text-sm text-gray-600">{result.message}</p>
                        {result.success !== undefined && (
                            <div className="mt-2 text-sm">
                                <span className="text-green-600 font-bold">{result.success} Rows Imported</span>
                                <span className="mx-2">|</span>
                                <span className="text-red-600 font-bold">{result.failed} Rows Failed</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TariffUpload;
