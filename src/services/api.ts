// API service for Railway backend
// Set your Railway backend URL here after deploying
const BASE_URL = import.meta.env.VITE_API_URL || 'https://your-railway-app.railway.app/api';
// Mock mode is for local dev only — never enabled in production builds.
const MOCK_MODE = !import.meta.env.VITE_API_URL && !import.meta.env.PROD;

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  // Fail loudly so a production deploy missing VITE_API_URL never silently
  // falls back to the in-browser mock.
  throw new Error('VITE_API_URL is required in production builds');
}


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
      // Dev-only mock — roles are NOT derived from the email. Default to
      // the least-privileged role; switch a test account to admin via the
      // backend (or the Users page) once the real API is wired up.
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'Dev User',
        role: 'user',
        organization: 'Test Organization'
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
        role: 'user',
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

  async resetPassword(email: string, newPassword: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
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

  async createUser(data: { name: string; email: string; password: string; role: 'admin' | 'user'; organization?: string }): Promise<User> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        role: data.role,
        organization: data.organization,
      };
    }

    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
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
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_projects');
      return stored ? JSON.parse(stored) : [];
    }

    const response = await fetch(`${BASE_URL}/projects`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return response.json();
  }

  async createProject(data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const project = { id: crypto.randomUUID(), ...data };
      const stored = localStorage.getItem('mock_projects');
      const projects = stored ? JSON.parse(stored) : [];
      projects.unshift(project);
      localStorage.setItem('mock_projects', JSON.stringify(projects));
      return project;
    }

    const response = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return response.json();
  }

  async updateProject(id: string, data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_projects');
      const projects = stored ? JSON.parse(stored) : [];
      const index = projects.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...data };
        localStorage.setItem('mock_projects', JSON.stringify(projects));
        return projects[index];
      }
      return { id, ...data };
    }

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

  async deleteProject(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_projects');
      const projects = stored ? JSON.parse(stored) : [];
      const filtered = projects.filter((p: any) => p.id !== id);
      localStorage.setItem('mock_projects', JSON.stringify(filtered));
      return;
    }

    const response = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  }

  async getMeetings(): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_meetings');
      return stored ? JSON.parse(stored) : [];
    }

    const response = await fetch(`${BASE_URL}/meetings`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }

    return response.json();
  }

  async createMeeting(data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const meeting = { id: crypto.randomUUID(), ...data };
      const stored = localStorage.getItem('mock_meetings');
      const meetings = stored ? JSON.parse(stored) : [];
      meetings.unshift(meeting);
      localStorage.setItem('mock_meetings', JSON.stringify(meetings));
      return meeting;
    }

    const response = await fetch(`${BASE_URL}/meetings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create meeting');
    }

    return response.json();
  }

  async updateMeeting(id: string, data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_meetings');
      const meetings = stored ? JSON.parse(stored) : [];
      const index = meetings.findIndex((m: any) => m.id === id);
      if (index !== -1) {
        meetings[index] = { ...meetings[index], ...data };
        localStorage.setItem('mock_meetings', JSON.stringify(meetings));
        return meetings[index];
      }
      return { id, ...data };
    }

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

  async deleteMeeting(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_meetings');
      const meetings = stored ? JSON.parse(stored) : [];
      const filtered = meetings.filter((m: any) => m.id !== id);
      localStorage.setItem('mock_meetings', JSON.stringify(filtered));
      return;
    }

    const response = await fetch(`${BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete meeting');
    }
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

  async getWorkshopAttendance(workshopId?: string): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockAttendance = [
        {
          id: '1',
          workshopId: '1',
          workshopName: 'Digital Transformation Workshop',
          workshopDate: '2024-02-15',
          name: 'John Doe',
          email: 'john@example.com',
          organization: 'ABC Corp',
          phoneNumber: '+27123456789',
          submittedAt: '2024-02-10T10:30:00Z'
        },
        {
          id: '2',
          workshopId: '1',
          workshopName: 'Digital Transformation Workshop',
          workshopDate: '2024-02-15',
          name: 'Jane Smith',
          email: 'jane@example.com',
          organization: 'XYZ Ltd',
          phoneNumber: '+27987654321',
          submittedAt: '2024-02-11T14:20:00Z'
        },
        {
          id: '3',
          workshopId: '2',
          workshopName: 'Leadership Development Programme',
          workshopDate: '2024-03-10',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          organization: 'DEF Inc',
          phoneNumber: '+27111222333',
          submittedAt: '2024-03-05T09:15:00Z'
        }
      ];
      
      if (workshopId) {
        return mockAttendance.filter(a => a.workshopId === workshopId);
      }
      return mockAttendance;
    }

    const url = workshopId 
      ? `${BASE_URL}/workshops/${workshopId}/attendance`
      : `${BASE_URL}/workshops/attendance`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workshop attendance');
    }

    return response.json();
  }

  async getOrganisations(): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const mockAttendance = await this.getWorkshopAttendance();
      
      const orgMap = new Map<string, Set<string>>();
      mockAttendance.forEach(attendance => {
        if (attendance.organization) {
          if (!orgMap.has(attendance.organization)) {
            orgMap.set(attendance.organization, new Set());
          }
          orgMap.get(attendance.organization)?.add(attendance.name);
        }
      });
      
      const organisations = Array.from(orgMap.entries()).map(([name, attendees]) => ({
        name,
        count: attendees.size,
        attendees: Array.from(attendees)
      }));
      
      return organisations.sort((a, b) => b.count - a.count);
    }

    const response = await fetch(`${BASE_URL}/organisations`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch organisations');
    }

    return response.json();
  }

  async createOrganisation(data: { name: string; description?: string; types?: string[] }): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: crypto.randomUUID(), ...data, attendee_count: 0 };
    }

    const response = await fetch(`${BASE_URL}/organisations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create organisation');
    }

    return response.json();
  }

  async updateOrganisation(id: string, data: { name?: string; description?: string; types?: string[] }): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id, ...data };
    }

    const response = await fetch(`${BASE_URL}/organisations/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update organisation');
    }

    return response.json();
  }

  async deleteOrganisation(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }

    const response = await fetch(`${BASE_URL}/organisations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete organisation');
    }
  }



  async getIndicators(): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_indicators');
      return stored ? JSON.parse(stored) : [];
    }

    const response = await fetch(`${BASE_URL}/indicators`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch indicators');
    }

    return response.json();
  }

  async createIndicator(data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const indicator = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data };
      const stored = localStorage.getItem('mock_indicators');
      const indicators = stored ? JSON.parse(stored) : [];
      indicators.unshift(indicator);
      localStorage.setItem('mock_indicators', JSON.stringify(indicators));
      return indicator;
    }

    const response = await fetch(`${BASE_URL}/indicators`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create indicator');
    }

    return response.json();
  }

  async createIndicatorsBulk(data: any[]): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_indicators');
      const indicators = stored ? JSON.parse(stored) : [];
      const newIndicators = data.map(d => ({ id: crypto.randomUUID(), created_at: new Date().toISOString(), ...d }));
      indicators.unshift(...newIndicators);
      localStorage.setItem('mock_indicators', JSON.stringify(indicators));
      return newIndicators;
    }

    const response = await fetch(`${BASE_URL}/indicators/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to import indicators');
    }

    return response.json();
  }

  async updateIndicator(id: string, data: any): Promise<any> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_indicators');
      const indicators = stored ? JSON.parse(stored) : [];
      const index = indicators.findIndex((i: any) => i.id === id);
      if (index !== -1) {
        indicators[index] = { ...indicators[index], ...data };
        localStorage.setItem('mock_indicators', JSON.stringify(indicators));
        return indicators[index];
      }
      return { id, ...data };
    }

    const response = await fetch(`${BASE_URL}/indicators/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update indicator');
    }

    return response.json();
  }

  async deleteIndicator(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_indicators');
      const indicators = stored ? JSON.parse(stored) : [];
      const filtered = indicators.filter((i: any) => i.id !== id);
      localStorage.setItem('mock_indicators', JSON.stringify(filtered));
      return;
    }

    const response = await fetch(`${BASE_URL}/indicators/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete indicator');
    }
  }

  // ============ User Access Requests ============
  async requestAccess(data: RegisterData): Promise<{ message: string }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const stored = localStorage.getItem('mock_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      if (requests.some((r: any) => r.email === data.email && r.status === 'pending')) {
        throw new Error('A pending request for this email already exists');
      }
      requests.unshift({
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        organization: data.organization || null,
        status: 'pending',
        requested_at: new Date().toISOString(),
        password: data.password,
      });
      localStorage.setItem('mock_user_requests', JSON.stringify(requests));
      return { message: 'Request submitted. An administrator will review it shortly.' };
    }
    const response = await fetch(`${BASE_URL}/user-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit request');
    }
    return response.json();
  }

  async getUserRequests(): Promise<any[]> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('mock_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      return requests.filter((r: any) => r.status === 'pending');
    }
    const response = await fetch(`${BASE_URL}/user-requests`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch user requests');
    return response.json();
  }

  async getUserRequestsCount(): Promise<number> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      return requests.filter((r: any) => r.status === 'pending').length;
    }
    const response = await fetch(`${BASE_URL}/user-requests/count`, { headers: this.getAuthHeaders() });
    if (!response.ok) return 0;
    const data = await response.json();
    return data.count ?? 0;
  }

  async approveUserRequest(id: string, role: 'admin' | 'user' = 'user'): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('mock_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      const idx = requests.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        requests[idx].status = 'approved';
        requests[idx].role = role;
        localStorage.setItem('mock_user_requests', JSON.stringify(requests));
      }
      return;
    }
    const response = await fetch(`${BASE_URL}/user-requests/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve request');
    }
  }

  async rejectUserRequest(id: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const stored = localStorage.getItem('mock_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      const idx = requests.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        requests[idx].status = 'rejected';
        localStorage.setItem('mock_user_requests', JSON.stringify(requests));
      }
      return;
    }
    const response = await fetch(`${BASE_URL}/user-requests/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reject request');
  }
}

export const api = new ApiService();
