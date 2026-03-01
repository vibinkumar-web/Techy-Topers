import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const NAVY = '#023149';
const RED = '#c5111a';
const CREAM = '#fdf6e8';
const BLUE_MARBLE = '#689abb';

const Home = () => {
    const toast = useToast();
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

            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 800 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24, background: 'rgba(255,255,255,0.7)', padding: '16px 32px', borderRadius: 40, backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <span className="material-icons" style={{ fontSize: 48, color: RED, display: 'inline-block', transform: 'rotate(-5deg)' }}>local_taxi</span>
                    <span style={{ fontSize: 44, fontWeight: 900, color: NAVY, letterSpacing: '-.5px' }}>
                        Taxi<span style={{ color: RED }}>.</span>
                    </span>
                </div>

                <h1 style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 24, lineHeight: 1.2 }}>
                    Fleet & Itinerary Orchestration Matrix
                </h1>

                <p style={{ fontSize: 18, color: '#475569', marginBottom: 48, fontWeight: 500, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 48px' }}>
                    Centralized heuristic engine for fleet telemetry, itinerary generation, and operator assignment vectors.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                    <Link
                        to="/login"
                        style={{
                            background: NAVY,
                            color: '#fff',
                            padding: '16px 40px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: 16,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '.05em',
                            boxShadow: `0 8px 20px ${NAVY}40`,
                            transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#012030';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 12px 24px ${NAVY}60`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = NAVY;
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = `0 8px 20px ${NAVY}40`;
                        }}
                    >
                        Initiate Session
                        <span className="material-icons" style={{ fontSize: 20 }}>login</span>
                    </Link>

                    <Link
                        to="/register"
                        style={{
                            background: '#fff',
                            color: NAVY,
                            border: `2px solid #cbd5e1`,
                            padding: '16px 40px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: 16,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '.05em',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = NAVY;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                        }}
                    >
                        Establish Identity
                    </Link>
                </div>
            </div>

            <p style={{ position: 'absolute', bottom: 32, fontSize: 12, color: '#94a3b8', letterSpacing: '.05em', fontWeight: 600, zIndex: 1 }}>
                © 2026 Core Platform Runtime
            </p>
        </div>
    );
};

export default Home;
