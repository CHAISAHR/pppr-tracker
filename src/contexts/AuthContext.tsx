import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, LoginCredentials, RegisterData } from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  canEditProject: (deliveryPartners: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const { user } = await api.login(credentials);
    setUser(user);
  };

  const register = async (data: RegisterData) => {
    const { user } = await api.register(data);
    setUser(user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  const canEditProject = (deliveryPartners: string[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.organization ? deliveryPartners.includes(user.organization) : false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, canEditProject }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
