import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const NAVY = '#023149';
const RED = '#c5111a';
const CREAM = '#fdf6e8';
const BLUE_MARBLE = '#689abb';

const RoleSelect = () => {
    const toast = useToast();
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: `radial-gradient(circle at top right, ${CREAM} 0%, #f4eee2 100%)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Background design elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${BLUE_MARBLE}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 800, height: 800, borderRadius: '50%', background: `radial-gradient(circle, ${NAVY}0A 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 12, background: 'rgba(255,255,255,0.7)', padding: '12px 24px', borderRadius: 40, backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <span className="material-icons" style={{ fontSize: 40, color: RED, display: 'inline-block', transform: 'rotate(-5deg)' }}>local_taxi</span>
                    <span style={{ fontSize: 36, fontWeight: 900, color: NAVY, letterSpacing: '-.5px' }}>
                        Taxi<span style={{ color: RED }}>.</span>
                    </span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Systems Command Center
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
                    Declare your operational authorization context
                </p>
            </div>

            {/* Cards */}
            <div style={{
                display: 'flex', gap: 32, width: '100%', maxWidth: 720,
                flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1
            }}>
                <RoleCard
                    icon="admin_panel_settings"
                    title="Administrative Node"
                    desc="Full heuristic and topological oversight. Direct architectural manipulation protocols unlocked."
                    accentColor={NAVY}
                    loginLabel="Initiate Admin Login"
                    onLogin={() => navigate('/admin/login')}
                    onRegister={() => navigate('/admin/register')}
                />
                <RoleCard
                    icon="badge"
                    title="Operational Node"
                    desc="Standard workflow access. Execute itinerary routing, ledger manipulation, and asset mapping."
                    accentColor={RED}
                    loginLabel="Initiate Operator Login"
                    onLogin={() => navigate('/staff/login')}
                    onRegister={() => navigate('/staff/register')}
                />
            </div>

            <p style={{ marginTop: 48, fontSize: 12, color: '#94a3b8', letterSpacing: '.05em', fontWeight: 600, position: 'relative', zIndex: 1 }}>
                © 2026 Core Platform Runtime
            </p>
        </div>
    );
};

const RoleCard = ({ icon, title, desc, accentColor, loginLabel, onLogin, onRegister }) => {
    const [hov, setHov] = useState(false);
    const [btnHov, setBtnHov] = useState(false);
    const [regHov, setRegHov] = useState(false);

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: '1 1 300px', maxWidth: 340,
                background: '#fff',
                border: `1px solid ${hov ? accentColor : '#e2e8f0'}`,
                borderRadius: 20,
                padding: '40px 32px',
                textAlign: 'center',
                boxShadow: hov
                    ? `0 20px 40px rgba(0,0,0,.08), 0 0 0 4px ${accentColor}1A`
                    : '0 4px 6px -1px rgba(0,0,0,.05), 0 2px 4px -1px rgba(0,0,0,.03)',
                transform: hov ? 'translateY(-6px)' : 'none',
                transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
            }}
        >
            {/* Icon circle */}
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: hov ? accentColor : `${accentColor}12`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                transition: 'all .3s ease'
            }}>
                <span className="material-icons" style={{ fontSize: 36, color: hov ? '#fff' : accentColor, transition: 'color .3s ease' }}>{icon}</span>
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{title}</h2>
            <p style={{ margin: '0 0 32px', fontSize: 13, color: '#475569', lineHeight: 1.6, fontWeight: 500, minHeight: 64 }}>{desc}</p>

            {/* Primary Login button */}
            <button
                onClick={onLogin}
                onMouseEnter={() => setBtnHov(true)}
                onMouseLeave={() => setBtnHov(false)}
                style={{
                    width: '100%', padding: '14px', marginBottom: 16,
                    background: btnHov ? shadeColor(accentColor) : accentColor,
                    color: '#fff', border: 'none',
                    borderRadius: 12, fontSize: 14, fontWeight: 800,
                    cursor: 'pointer', letterSpacing: '.05em', textTransform: 'uppercase',
                    boxShadow: btnHov ? `0 8px 20px ${accentColor}40` : 'none',
                    transition: 'all .2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
            >
                {loginLabel}
                <span className="material-icons" style={{ fontSize: 18, transform: btnHov ? 'translateX(4px)' : 'none', transition: 'transform .2s ease' }}>arrow_forward</span>
            </button>

            {/* Ghost Register button */}
            <button
                onClick={onRegister}
                onMouseEnter={() => setRegHov(true)}
                onMouseLeave={() => setRegHov(false)}
                style={{
                    width: '100%', padding: '12px',
                    background: regHov ? '#f8fafc' : 'transparent',
                    color: regHov ? '#0f172a' : '#64748b',
                    border: `1.5px solid ${regHov ? '#cbd5e1' : '#e2e8f0'}`,
                    borderRadius: 12, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '.03em',
                    transition: 'all .2s ease',
                }}
            >
                Establish New Identity
            </button>
        </div>
    );
};

// Darken colour slightly for hover
function shadeColor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 25);
    const g = Math.max(0, ((n >> 8) & 0xff) - 25);
    const b = Math.max(0, (n & 0xff) - 25);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default RoleSelect;
