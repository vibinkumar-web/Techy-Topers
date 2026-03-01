import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => (
    <div style={{
        width: '100%',
        minHeight: '100vh',
        background: '#fdf6e8',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    }}>
        <Navbar />
        <div style={{ flex: 1, width: '100%', overflowX: 'hidden' }}>
            <Outlet />
        </div>
    </div>
);

export default Layout;
