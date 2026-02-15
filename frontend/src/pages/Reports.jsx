import { useState } from 'react';
import CustomerReport from '../components/CustomerReport';
import VehicleReport from '../components/VehicleReport';
import CompanyReport from '../components/CompanyReport';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('customer');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`${activeTab === 'customer'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Customer Report
                    </button>
                    <button
                        onClick={() => setActiveTab('vehicle')}
                        className={`${activeTab === 'vehicle'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Vehicle Report
                    </button>
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`${activeTab === 'company'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Company Report
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'customer' && <CustomerReport />}
                {activeTab === 'vehicle' && <VehicleReport />}
                {activeTab === 'company' && <CompanyReport />}
            </div>
        </div>
    );
};

export default Reports;
