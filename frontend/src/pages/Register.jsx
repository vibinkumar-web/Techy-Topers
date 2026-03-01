import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const NAVY = '#023149';
const RED = '#c5111a';
const BLUE_MARBLE = '#689abb';

const Register = () => {
    const toast = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(name, email, mobile, password);
        setLoading(false);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message);
        }
    };

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        padding: '12px 16px', fontSize: 14,
        border: '1px solid #e8d4aa', borderRadius: 8,
        outline: 'none', color: NAVY,
        fontFamily: "'Outfit', sans-serif",
        background: '#fdf6e8',
        transition: 'border-color .2s, box-shadow .2s',
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#fdf6e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif", padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: 440 }}>

                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span className="material-icons" style={{ fontSize: 32, color: NAVY }}>local_taxi</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: NAVY, letterSpacing: '-.5px' }}>
                            Taxi<span style={{ color: RED }}>.</span>
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Create your account</p>
                </div>

                {/* Card */}
                <div style={{
                    background: '#fff', borderRadius: 16,
                    border: '1px solid #e8d4aa',
                    boxShadow: '0 4px 24px rgba(2, 49, 73, .08)',
                    padding: '36px 32px',
                }}>
                    <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: NAVY, textAlign: 'center' }}>
                        Join Taxi App
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                Full Name <span style={{ color: RED }}>*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                style={inputStyle}
                                onFocus={e => {
                                    e.target.style.borderColor = NAVY;
                                    e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e8d4aa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                Email <span style={{ color: RED }}>*</span>
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                style={inputStyle}
                                onFocus={e => {
                                    e.target.style.borderColor = NAVY;
                                    e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e8d4aa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                Mobile <span style={{ color: RED }}>*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="Mobile"
                                style={inputStyle}
                                onFocus={e => {
                                    e.target.style.borderColor = NAVY;
                                    e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e8d4aa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>
                                Password <span style={{ color: RED }}>*</span>
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                style={inputStyle}
                                onFocus={e => {
                                    e.target.style.borderColor = NAVY;
                                    e.target.style.boxShadow = '0 0 0 2px rgba(2,49,73,.1)';
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = '#e8d4aa';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                background: '#fee2e2', border: '1px solid #fecaca',
                                borderRadius: 8, padding: '8px 12px',
                                fontSize: 14, color: '#991b1b', fontWeight: 600,
                                textAlign: 'center', marginTop: 8
                            }}>{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px 16px',
                                background: loading ? '#9ca3af' : NAVY,
                                color: '#fff', border: 'none',
                                borderRadius: 8, fontSize: 14,
                                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '.02em', marginTop: 8,
                                transition: 'background .2s',
                            }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#012030'; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = NAVY; }}
                        >
                            {loading ? 'Creating account…' : 'Register'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Link to="/login" style={{ fontSize: 14, color: BLUE_MARBLE, textDecoration: 'none', fontWeight: 600 }}>
                            Already registered? <span style={{ color: NAVY }}>Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
