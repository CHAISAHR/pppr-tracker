// API service for Railway backend
// TODO: Update BASE_URL with your Railway backend URL
const BASE_URL = 'https://your-railway-app.railway.app/api';
const MOCK_MODE = true; // Set to false when Railway backend is ready

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  organization?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  organization?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    if (MOCK_MODE) {
      // Mock login for testing
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: credentials.email.includes('admin') ? 'Admin User' : 'User',
        role: credentials.email.includes('admin') ? 'admin' : 'user',
        organization: credentials.email.includes('admin') ? undefined : 'Test Organization'
      };
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('auth_token', mockToken);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { user: mockUser, token: mockToken };
    }

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    if (MOCK_MODE) {
      // Mock registration for testing
      const mockUser: User = {
        id: '2',
        email: data.email,
        name: data.name,
        role: data.email.includes('admin') ? 'admin' : 'user',
        organization: data.organization
      };
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('auth_token', mockToken);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { user: mockUser, token: mockToken };
    }

    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result = await response.json();
    localStorage.setItem('auth_token', result.token);
    return result;
  }

  async logout(): Promise<void> {
    if (MOCK_MODE) {
      localStorage.removeItem('auth_token');
      return;
    }

    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    localStorage.removeItem('auth_token');
  }

  async getCurrentUser(): Promise<User> {
    if (MOCK_MODE) {
      // Mock get current user for testing
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token');
      
      // Extract email from token for consistent mock data
      const isAdmin = token.includes('admin');
      return {
        id: '1',
        email: isAdmin ? 'admin@test.com' : 'user@test.com',
        name: isAdmin ? 'Admin User' : 'User',
        role: isAdmin ? 'admin' : 'user',
        organization: isAdmin ? undefined : 'Test Organization'
      };
    }

    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return response.json();
  }


  async getUsers(): Promise<User[]> {
    if (MOCK_MODE) {
      // Mock users data for testing
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
          organization: undefined
        },
        {
          id: '2',
          email: 'user1@test.com',
          name: 'John Doe',
          role: 'user',
          organization: 'Test Organization'
        },
        {
          id: '3',
          email: 'user2@test.com',
          name: 'Jane Smith',
          role: 'user',
          organization: 'Another Org'
        }
      ];
    }

    const response = await fetch(`${BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ...data } as User;
    }

    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  async getProjects(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/projects`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  }

  async updateProject(id: string, data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    return response.json();
  }

  async getMeetings(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/meetings`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }

    return response.json();
  }

  async updateMeeting(id: string, data: any): Promise<any> {
    const response = await fetch(`${BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update meeting');
    }

    return response.json();
  }

  async getWorkshops(): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        {
          id: '1',
          name: 'Digital Transformation Workshop',
          activity: 'Training',
          date: '2024-02-15',
          venue: 'Cape Town Convention Centre',
          numberOfDays: 3,
          registrations: 45
        },
        {
          id: '2',
          name: 'Leadership Development Programme',
          activity: 'Capacity Building',
          date: '2024-03-10',
          venue: 'Johannesburg Conference Hall',
          numberOfDays: 5,
          registrations: 32
        }
      ];
    }

    const response = await fetch(`${BASE_URL}/workshops`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workshops');
    }

    return response.json();
  }

  async createWorkshop(data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Date.now().toString(), ...data, registrations: 0 };
    }

    const response = await fetch(`${BASE_URL}/workshops`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create workshop');
    }

    return response.json();
  }

  async deleteWorkshop(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    const response = await fetch(`${BASE_URL}/workshops/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete workshop');
    }
  }

  async submitWorkshopAttendance(data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: Date.now().toString(), ...data };
    }

    const response = await fetch(`${BASE_URL}/workshops/attendance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit attendance');
    }

    return response.json();
  }
}

export const api = new ApiService();
