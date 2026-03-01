import { useState, useContext, useRef } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const CustomerUpload = () => {
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

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/customer_upload.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
            setFile(null); // Clear file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error("Upload error", error);
            toast('Upload failed: ' + (error.response?.data?.message || error.message, 'error'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Client DB Ingestion</h1>
                        <p>Bulk import customer profiles and telephonic metadata via CSV arrays</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <div className="section" style={{ padding: 40 }}>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#023149', marginBottom: 16 }}>
                                    <span className="material-icons" style={{ color: '#c5111a', fontSize: 18 }}>manage_search</span>
                                    Target CSV Source
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
                                    <span className="material-icons" style={{ fontSize: 48, color: '#94a3b8', marginBottom: 16 }}>input</span>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#023149', marginBottom: 8 }}>
                                        Click to locate array file or drag block here
                                    </div>
                                    <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>Accepts precise CSV schema only. 10MB Threshold.</p>
                                    <input
                                        ref={fileInputRef}
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        style={{ display: 'none' }}
                                        accept=".csv"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {file && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16, animation: 'fadeIn 0.2s ease-out' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 16, background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: 18 }}>check</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: 2 }}>Mounted File</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>{file.name}</div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', background: '#dcfce7', padding: '4px 8px', borderRadius: 4 }}>
                                        {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                            )}

                            {/* Schema Guidelines */}
                            <div style={{ background: '#fdf6e8', padding: 24, borderRadius: 8, border: '1px solid #e8d4aa' }}>
                                <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                                    <span className="material-icons" style={{ fontSize: 16, color: '#c5111a' }}>rule</span>
                                    Valid Structural Guidelines
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 24, fontSize: 14, color: '#475569', display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 600 }}>
                                    <li><strong style={{ color: '#023149' }}>Data Vector 1:</strong> Legal Customer Identity (e.g., John Doe)</li>
                                    <li><strong style={{ color: '#023149' }}>Data Vector 2:</strong> Handset Routing Number (e.g., 9876543210)</li>
                                    <li style={{ color: '#c5111a' }}>Header blocks are explicitly isolated. Do not include string headers.</li>
                                </ul>
                            </div>

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
                                    <span className="material-icons" style={{ fontSize: 20 }}>{uploading ? 'cloud_sync' : 'library_add'}</span>
                                    {uploading ? 'Integrating Dataset...' : 'Execute Profile Injection'}
                                </button>
                            </div>
                        </form>

                        {/* Summary Output */}
                        {result && (
                            <div style={{
                                marginTop: 40,
                                padding: 32,
                                borderRadius: 8,
                                background: result.failed > 0 ? '#fefce8' : '#f0fdf4',
                                border: `1px solid ${result.failed > 0 ? '#fef08a' : '#bbf7d0'}`,
                                animation: 'slideUp 0.3s ease-out'
                            }}>
                                <h4 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 800, color: result.failed > 0 ? '#854d0e' : '#166534', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${result.failed > 0 ? '#fef08a' : '#bbf7d0'}`, paddingBottom: 16 }}>
                                    <span className="material-icons" style={{ fontSize: 22 }}>
                                        {result.failed > 0 ? 'warning_amber' : 'fact_check'}
                                    </span>
                                    Injection Telemetry Log
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
                                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Nodes Evaluated</div>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: '#023149' }}>{result.processed}</div>
                                    </div>
                                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: '#15803d' }}></div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Merged Valid</div>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: '#15803d' }}>{result.success}</div>
                                    </div>
                                    <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4, background: '#c5111a' }}></div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Defective</div>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: '#c5111a' }}>{result.failed}</div>
                                    </div>
                                </div>

                                {result.message && (
                                    <p style={{ margin: 0, fontSize: 14, color: '#334155', background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', fontWeight: 600, display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span className="material-icons" style={{ fontSize: 20, color: '#94a3b8' }}>message</span>
                                        {result.message}
                                    </p>
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

export default CustomerUpload;
