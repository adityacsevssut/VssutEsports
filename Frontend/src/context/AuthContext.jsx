import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import PageLoader from '../components/PageLoader';


const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Only this email unlocks developer features
const DEVELOPER_EMAIL = 'devlopervssutesports@gmail.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devMode, setDevMode] = useState(false); // developer acting as developer vs user

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedDevMode = localStorage.getItem('devMode');
    if (storedDevMode === 'true') setDevMode(true);
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('devMode');
    } catch (e) {
      console.error('Error clearing localStorage on logout:', e);
    }
    setUser(null);
    setDevMode(false);
    toast.success('Logged out successfully.');
  };

  // Is the currently logged-in player the developer?
  const isDeveloper = user?.email === DEVELOPER_EMAIL;

  // Toggle developer ↔ user mode (only works for the dev)
  const toggleDevMode = () => {
    if (!isDeveloper) return;
    const next = !devMode;
    setDevMode(next);
    localStorage.setItem('devMode', String(next));
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isDeveloper,
    devMode,
    toggleDevMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
};
