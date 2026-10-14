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
  /** Admins edit everything; others only records naming their organisation. */
  canEditOrg: (...values: unknown[]) => boolean;
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

  const canEditOrg = (...values: unknown[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const org = (user.organization || '').trim().toLowerCase();
    if (!org) return false;
    const flat = (v: unknown): string[] =>
      v == null ? [] : Array.isArray(v) ? v.flatMap(flat) : String(v).split(/[;,]/).map((s) => s.trim().toLowerCase());
    return values.flatMap(flat).includes(org);
  };

  const canEditProject = (orgs: string[]) => canEditOrg(orgs);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, canEditProject, canEditOrg }}>
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
