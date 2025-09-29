import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo login logic - replace with actual API call
    const demoUsers = {
      'admin@brighway.com': { 
        id: 1, 
        email: 'admin@brighway.com', 
        name: 'Admin User', 
        role: 'admin',
        avatar: '/avatars/admin.jpg'
      },
      'teacher@brighway.com': { 
        id: 2, 
        email: 'teacher@brighway.com', 
        name: 'Nguyễn Văn A', 
        role: 'teacher',
        avatar: '/avatars/teacher.jpg'
      },
      'parent@brighway.com': { 
        id: 3, 
        email: 'parent@brighway.com', 
        name: 'Trần Thị B', 
        role: 'parent',
        avatar: '/avatars/parent.jpg'
      }
    };

    if (demoUsers[email] && password === 'password123') {
      const userData = demoUsers[email];
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
