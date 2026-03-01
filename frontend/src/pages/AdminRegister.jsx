import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAVY = '#023149';
const RED = '#c5111a';
const BLUE_MARBLE = '#689abb';

const AdminRegister = () => {
    const toast = useToast();
    const [form, setForm] = useState({ name: '', email: '', mobile: '', username: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/admin_register.php', {
                name: form.name, email: form.email, mobile: form.mobile,
                username: form.username || form.mobile, password: form.password,
            });
            setSuccess(res.data.message + ' Redirecting to login…');
            setTimeout(() => navigate('/admin/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        padding: '10px 14px', fontSize: 14,
        border: '1px solid #e8d4aa', borderRadius: 8,
        outline: 'none', color: NAVY,
        fontFamily: "'Outfit', sans-serif",
        background: '#fdf6e8',
        transition: 'border-color .2s, box-shadow .2s',
    };

    const labelStyle = {
        display: 'block', fontSize: 11, fontWeight: 700,
        color: '#6b7280', textTransform: 'uppercase',
        letterSpacing: '.07em', marginBottom: 6,
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#fdf6e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: 460 }}>

                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className="material-icons" style={{ fontSize: 32, color: NAVY }}>local_taxi</span>
                        <span style={{ fontSize: 26, fontWeight: 900, color: NAVY, letterSpacing: '-.5px' }}>
                            Taxi<span style={{ color: RED }}>.</span>
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Taxi Management System</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#eef2f5', color: NAVY, borderRadius: 20,
                        border: `1.5px solid ${NAVY}30`,
                        padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
                    }}>
                        <span className="material-icons" style={{ fontSize: 13 }}>shield</span>
                        ADMIN REGISTRATION
                    </span>
                </div>

                {/* Card */}
                <div style={{
                    background: '#fff', borderRadius: 16,
                    border: '1px solid #e8d4aa',
                    boxShadow: '0 4px 24px rgba(2, 49, 73, .08)',
                    padding: '36px 36px 32px',
                }}>
                    <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: NAVY, textAlign: 'center' }}>
                        Create Admin Account
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Full Name</label>
                            <input name="name" type="text" value={form.name} onChange={handleChange} required
                                placeholder="Enter full name" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required
                                placeholder="Enter email address" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Mobile</label>
                            <input name="mobile" type="text" value={form.mobile} onChange={handleChange} required
                                placeholder="Enter mobile number" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Username <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#9ca3af' }}>(optional)</span></label>
                            <input name="username" type="text" value={form.username} onChange={handleChange}
                                placeholder="Choose a username" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                        </div>

                        {/* Password row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <input name="password" type="password" value={form.password} onChange={handleChange} required
                                    placeholder="Password" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm</label>
                                <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required
                                    placeholder="Confirm password" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#e8d4aa'; e.target.style.boxShadow = 'none'; }} />
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: 8, padding: '10px 14px',
                                fontSize: 13, color: '#b91c1c', fontWeight: 600, textAlign: 'center',
                            }}>{error}</div>
                        )}
                        {success && (
                            <div style={{
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                borderRadius: 8, padding: '10px 14px',
                                fontSize: 13, color: '#15803d', fontWeight: 600, textAlign: 'center',
                            }}>{success}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px',
                                background: loading ? '#9ca3af' : NAVY,
                                color: '#fff', border: 'none',
                                borderRadius: 8, fontSize: 14,
                                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '.03em', marginTop: 4,
                                transition: 'background .2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#012030'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = NAVY; }}
                        >
                            {loading ? 'Creating account…' : 'Register as Admin'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link to="/admin/login" style={{ fontSize: 13, color: BLUE_MARBLE, textDecoration: 'none', fontWeight: 600 }}>
                            Already have an account? <span style={{ color: NAVY }}>Sign In</span>
                        </Link>
                        <Link to="/" style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
                            ← Back to role selection
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
