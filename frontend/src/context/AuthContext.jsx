import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure Axios base URL
    // Adjust port if your PHP server runs on a different port. 
    // For development, assuming PHP server on port 8000
    const api = axios.create({
        baseURL: 'http://localhost:8000/backend/api',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/login.php', { username, password });
            if (response.data.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Login error", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, mobile, password) => {
        try {
            const response = await api.post('/register.php', { name, email, mobile, password });
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Registration error", error);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout.php');
        } catch (error) {
            console.error("Logout error", error);
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, api }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
