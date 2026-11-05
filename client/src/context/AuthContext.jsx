import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('classshare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('classshare_token') || null);
  const [loading, setLoading] = useState(true);

  // Vérifier la session au démarrage
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('classshare_user', JSON.stringify(res.data.data));
        } catch (error) {
          console.error('Erreur session :', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, ...userData } = res.data.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('classshare_token', newToken);
    localStorage.setItem('classshare_user', JSON.stringify(userData));
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: newToken, ...userData } = res.data.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('classshare_token', newToken);
    localStorage.setItem('classshare_user', JSON.stringify(userData));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('classshare_token');
    localStorage.removeItem('classshare_user');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('classshare_user', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
