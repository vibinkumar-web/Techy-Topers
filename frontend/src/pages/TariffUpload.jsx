import { useState, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TariffUpload = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
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
            setFile(null); // Clear context
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Upload failed", error);
            setResult({ message: 'Upload failed', error: error.message, failed: 1 });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Global Tariff Ingestion</h1>
                        <p>Import and update volumetric pricing matrices via CSV telemetry</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="section" style={{ padding: 40 }}>

                        {/* Format Directive Alert */}
                        <div style={{ background: '#fdf6e8', border: '1px solid #e8d4aa', padding: 20, borderRadius: 8, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #fef08a' }}>
                                <span className="material-icons" style={{ fontSize: 20 }}>data_object</span>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', letterSpacing: '.05em' }}>Schema Requirement</h4>
                                <p style={{ margin: 0, fontSize: 14, color: '#a16207', fontWeight: 600 }}>
                                    Ingestion layer expects exactly defined columns: <span style={{ fontFamily: 'monospace', color: '#713f12', background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>V-Type, Tariff-Type, A1...A103</span>.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#023149', marginBottom: 16 }}>
                                    <span className="material-icons" style={{ color: '#c5111a', fontSize: 18 }}>upload_file</span>
                                    Select Tariff Matrix (CSV)
                                </label>
                                <div
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: 12,
                                        padding: 48,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f8fafc',
                                        transition: 'all .2s ease-in-out',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                                >
                                    <span className="material-icons" style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }}>cloud_upload</span>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#023149', marginBottom: 8 }}>
                                        Click here to browse or drag file over
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>CSV format strictly required. Max 10MB.</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {file && (
                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeIn 0.2s ease-out' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 16, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: 18 }}>drafts</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: 2 }}>Target Buffer</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0369a1' }}>{file.name}</div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', background: '#e0f2fe', padding: '4px 8px', borderRadius: 4 }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '2px dashed #e2e8f0' }}>
                                <button
                                    type="submit"
                                    disabled={!file || uploading}
                                    className="btn-primary"
                                    style={{
                                        height: 48,
                                        padding: '0 40px',
                                        background: (!file || uploading) ? '#cbd5e1' : '#023149',
                                        color: (!file || uploading) ? '#f8fafc' : '#fff',
                                        opacity: 1,
                                        cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
                                        boxShadow: (!file || uploading) ? 'none' : '0 4px 6px -1px rgba(2, 49, 73, 0.2)',
                                        fontSize: 15
                                    }}
                                    onMouseEnter={e => { if (file && !uploading) e.currentTarget.style.background = '#012030'; }}
                                    onMouseLeave={e => { if (file && !uploading) e.currentTarget.style.background = '#023149'; }}
                                >
                                    <span className="material-icons" style={{ fontSize: 20 }}>{uploading ? 'sync' : 'publish'}</span>
                                    {uploading ? 'Processing Matrix Data...' : 'Execute Tariff Ingestion'}
                                </button>
                            </div>
                        </form>

                        {/* Processing Results Dashboard */}
                        {result && (
                            <div style={{
                                marginTop: 32,
                                padding: 32,
                                borderRadius: 8,
                                background: result.failed > 0 || result.error ? '#fefce8' : '#f0fdf4',
                                border: `1px solid ${result.failed > 0 || result.error ? '#fef08a' : '#bbf7d0'}`,
                                animation: 'slideUp 0.3s ease-out'
                            }}>
                                <h4 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 800, color: result.failed > 0 || result.error ? '#854d0e' : '#166534', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${result.failed > 0 || result.error ? '#fef08a' : '#bbf7d0'}`, paddingBottom: 16 }}>
                                    <span className="material-icons" style={{ fontSize: 22 }}>
                                        {result.failed > 0 || result.error ? 'report_problem' : 'task_alt'}
                                    </span>
                                    Ingestion Telemetry Results
                                </h4>

                                {result.message && (
                                    <div style={{ margin: '0 0 24px', fontSize: 14, color: '#334155', fontWeight: 600, background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span className="material-icons" style={{ color: '#94a3b8', fontSize: 20 }}>info</span>
                                        {result.message}
                                    </div>
                                )}

                                {result.success !== undefined && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: '#15803d' }}></div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Successfully Processed</div>
                                            <div style={{ fontSize: 32, fontWeight: 900, color: '#15803d' }}>{result.success}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Tariff Nodes Updated</div>
                                        </div>
                                        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: '#c5111a' }}></div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: '#c5111a', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Failed or Rejected</div>
                                            <div style={{ fontSize: 32, fontWeight: 900, color: '#c5111a' }}>{result.failed}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Anomalous Rows Dropped</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TariffUpload;
