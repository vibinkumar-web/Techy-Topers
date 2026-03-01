import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAVY = '#023149';
const RED = '#c5111a';

const AdminLogin = () => {
    const toast = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { api, setUser: setCtxUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/admin_login.php', { username, password });
            if (res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                if (typeof setCtxUser === 'function') setCtxUser(res.data.user);
                navigate('/dashboard');
            } else {
                setError(res.data.message || 'Login failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Admin login failed.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        padding: '10px 14px', fontSize: 14,
        border: '1px solid #d5e3ec', borderRadius: 8,
        outline: 'none', color: NAVY,
        fontFamily: "'Outfit', sans-serif",
        background: '#fdf6e8',
        transition: 'border-color .2s',
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#fdf6e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: 420 }}>

                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className="material-icons" style={{ fontSize: 32, color: NAVY }}>local_taxi</span>
                        <span style={{ fontSize: 26, fontWeight: 900, color: NAVY, letterSpacing: '-.5px' }}>
                            Taxi<span style={{ color: RED }}>.</span>
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#8a9baa' }}>Taxi Management System</p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: '#eef2f5', color: NAVY, borderRadius: 20,
                        border: `1.5px solid ${NAVY}30`,
                        padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '.07em',
                    }}>
                        <span className="material-icons" style={{ fontSize: 13 }}>shield</span>
                        ADMINISTRATOR
                    </span>
                </div>

                {/* Card */}
                <div style={{
                    background: '#fff', borderRadius: 18,
                    border: '1px solid #e2e9ef',
                    boxShadow: '0 4px 24px rgba(0,48,73,.08)',
                    padding: '36px 36px 32px',
                }}>
                    <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: NAVY, textAlign: 'center' }}>
                        Admin Sign In
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5a7a8a', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                                Username / Email / Mobile
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = NAVY}
                                onBlur={e => e.target.style.borderColor = '#d5e3ec'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5a7a8a', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = NAVY}
                                onBlur={e => e.target.style.borderColor = '#d5e3ec'}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: 8, padding: '10px 14px',
                                fontSize: 13, color: '#b91c1c', fontWeight: 600,
                                textAlign: 'center',
                            }}>{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px',
                                background: loading ? '#999' : NAVY,
                                color: '#fff', border: 'none',
                                borderRadius: 10, fontSize: 14,
                                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '.03em', marginTop: 4,
                                transition: 'background .2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#012030'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = NAVY; }}
                        >
                            {loading ? 'Signing in…' : 'Sign In as Admin'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link to="/admin/register" style={{ fontSize: 13, color: '#689abb', textDecoration: 'none', fontWeight: 600 }}>
                            Don't have an admin account? <span style={{ color: NAVY }}>Register</span>
                        </Link>
                        <Link to="/" style={{ fontSize: 12, color: '#8a9baa', textDecoration: 'none' }}>
                            ← Back to role selection
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
