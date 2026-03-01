import { useState } from 'react';
import CustomerReport from '../components/CustomerReport';
import VehicleReport from '../components/VehicleReport';
import CompanyReport from '../components/CompanyReport';
import { useToast } from '../context/ToastContext';

const Reports = () => {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('customer');

    const tabStyle = (isActive) => ({
        padding: '16px 32px',
        fontWeight: isActive ? 800 : 700,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: '.05em',
        borderBottom: isActive ? '3px solid #023149' : '3px solid transparent',
        color: isActive ? '#023149' : '#64748b',
        background: isActive ? '#f8fafc' : 'transparent',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        cursor: 'pointer',
        transition: 'all .2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12
    });

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Global Reporting Matrix</h1>
                        <p>Generate chronological ledger extracts for B2B nodes and system entities</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#fefce8' }}>
                        <button onClick={() => setActiveTab('customer')} style={tabStyle(activeTab === 'customer')}>
                            <span className="material-icons" style={{ fontSize: 20, color: activeTab === 'customer' ? '#c5111a' : '#94a3b8' }}>person_search</span>
                            Customer Heuristics
                        </button>
                        <button onClick={() => setActiveTab('vehicle')} style={tabStyle(activeTab === 'vehicle')}>
                            <span className="material-icons" style={{ fontSize: 20, color: activeTab === 'vehicle' ? '#15803d' : '#94a3b8' }}>directions_car</span>
                            Asset Telemetry
                        </button>
                        <button onClick={() => setActiveTab('company')} style={tabStyle(activeTab === 'company')}>
                            <span className="material-icons" style={{ fontSize: 20, color: activeTab === 'company' ? '#0284c7' : '#94a3b8' }}>corporate_fare</span>
                            Corporate Ledgers
                        </button>
                    </div>

                    {/* Tab Content Area */}
                    <div style={{ padding: 0, background: '#f8fafc', minHeight: 'calc(100vh - 280px)' }}>
                        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
                            {activeTab === 'customer' && <CustomerReport />}
                            {activeTab === 'vehicle' && <VehicleReport />}
                            {activeTab === 'company' && <CompanyReport />}
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Reports;
