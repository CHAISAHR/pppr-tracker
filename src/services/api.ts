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

  async resetPassword(currentPassword: string, newPassword: string): Promise<void> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    const response = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
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
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('No auth token');
      // Dev-only mock — role is NOT derived from the token or email.
      return {
        id: '1',
        email: 'user@test.com',
        name: 'Dev User',
        role: 'user',
        organization: 'Test Organization'
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

  async bulkCreateMeetings(meetings: any[]): Promise<{ inserted: any[]; errors: { row: number; message: string }[] }> {
    if (MOCK_MODE) {
      const inserted = meetings.map(m => ({ id: crypto.randomUUID(), ...m }));
      const stored = localStorage.getItem('mock_meetings');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_meetings', JSON.stringify([...inserted, ...all]));
      return { inserted, errors: [] };
    }

    const response = await fetch(`${BASE_URL}/meetings/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(meetings),
    });

    if (!response.ok && response.status !== 207) {
      throw new Error('Failed to bulk upload meetings');
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
      let msg = `Failed to import indicators (HTTP ${response.status})`;
      try {
        const err = await response.json();
        if (err?.message) msg = err.message;
      } catch {}
      if (response.status === 401) msg = 'You must be signed in to import indicators.';
      if (response.status === 403) msg = 'Only admins can bulk-import indicators.';
      throw new Error(msg);
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

  // ==================== Risks (Risk Register) ====================
  async getRisks(): Promise<any[]> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_risks');
      return stored ? JSON.parse(stored) : [];
    }
    const response = await fetch(`${BASE_URL}/risks`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch risks');
    return response.json();
  }

  async createRisk(data: any): Promise<any> {
    if (MOCK_MODE) {
      const risk = { id: crypto.randomUUID(), ...data, riskScore: (data.likelihood || 0) * (data.impact || 0) };
      const stored = localStorage.getItem('mock_risks');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_risks', JSON.stringify([risk, ...all]));
      return risk;
    }
    const response = await fetch(`${BASE_URL}/risks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create risk');
    return response.json();
  }

  async updateRisk(id: string, data: any): Promise<any> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_risks');
      const all = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data, riskScore: (data.likelihood || 0) * (data.impact || 0) };
        localStorage.setItem('mock_risks', JSON.stringify(all));
        return all[idx];
      }
      return { id, ...data };
    }
    const response = await fetch(`${BASE_URL}/risks/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update risk');
    return response.json();
  }

  async deleteRisk(id: string): Promise<void> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_risks');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_risks', JSON.stringify(all.filter((r: any) => r.id !== id)));
      return;
    }
    const response = await fetch(`${BASE_URL}/risks/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete risk');
  }

  async bulkCreateRisks(risks: any[]): Promise<{ inserted: any[]; errors: { row: number; message: string }[] }> {
    if (MOCK_MODE) {
      const inserted = risks.map(r => ({ id: crypto.randomUUID(), ...r, riskScore: (r.likelihood || 0) * (r.impact || 0) }));
      const stored = localStorage.getItem('mock_risks');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_risks', JSON.stringify([...inserted, ...all]));
      return { inserted, errors: [] };
    }
    const response = await fetch(`${BASE_URL}/risks/bulk`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(risks),
    });
    if (!response.ok && response.status !== 207) throw new Error('Failed to bulk upload risks');
    return response.json();
  }

  // ==================== M&E Activity Tracker (admin only) ====================
  async getMEActivities(): Promise<any[]> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_me_activities');
      return stored ? JSON.parse(stored) : [];
    }
    const response = await fetch(`${BASE_URL}/me-activities`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch M&E activities');
    return response.json();
  }

  async createMEActivity(data: any): Promise<any> {
    if (MOCK_MODE) {
      const record = { ...data, id: crypto.randomUUID() };
      const stored = localStorage.getItem('mock_me_activities');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_me_activities', JSON.stringify([record, ...all]));
      return record;
    }
    const response = await fetch(`${BASE_URL}/me-activities`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create M&E activity');
    return response.json();
  }

  async updateMEActivity(id: string, data: any): Promise<any> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_me_activities');
      const all = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data, id };
        localStorage.setItem('mock_me_activities', JSON.stringify(all));
        return all[idx];
      }
      return { ...data, id };
    }
    const response = await fetch(`${BASE_URL}/me-activities/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update M&E activity');
    return response.json();
  }

  async deleteMEActivity(id: string): Promise<void> {
    if (MOCK_MODE) {
      const stored = localStorage.getItem('mock_me_activities');
      const all = stored ? JSON.parse(stored) : [];
      localStorage.setItem('mock_me_activities', JSON.stringify(all.filter((r: any) => r.id !== id)));
      return;
    }
    const response = await fetch(`${BASE_URL}/me-activities/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete M&E activity');
  }
  // ==================== Quarterly Reports ====================
  private mockGet(key: string): any[] { const s = localStorage.getItem(key); return s ? JSON.parse(s) : []; }
  private mockSet(key: string, v: any[]) { localStorage.setItem(key, JSON.stringify(v)); }
  private async req(path: string, method = 'GET', body?: any): Promise<any> {
    const r = await fetch(`${BASE_URL}${path}`, { method, headers: this.getAuthHeaders(), body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.message || 'Request failed'); }
    return r.json();
  }
  async getQuarterlyReports(isAdmin: boolean): Promise<any[]> {
    if (MOCK_MODE) { const all = this.mockGet('mock_qreports'); return isAdmin ? all : all.filter((r: any) => r.status === 'Published'); }
    return this.req('/quarterly-reports');
  }
  async createQuarterlyReport(data: any): Promise<any> {
    if (MOCK_MODE) { const r = { id: crypto.randomUUID(), status: 'Draft', createdAt: new Date().toISOString(), ...data }; this.mockSet('mock_qreports', [r, ...this.mockGet('mock_qreports')]); return r; }
    return this.req('/quarterly-reports', 'POST', data);
  }
  async updateQuarterlyReport(id: string, data: any): Promise<any> {
    if (MOCK_MODE) { const all = this.mockGet('mock_qreports').map((r: any) => r.id === id ? { ...r, ...data, publishedAt: data.status === 'Published' && r.status !== 'Published' ? new Date().toISOString() : r.publishedAt } : r); this.mockSet('mock_qreports', all); return all.find((r: any) => r.id === id); }
    return this.req(`/quarterly-reports/${id}`, 'PUT', data);
  }
  async deleteQuarterlyReport(id: string): Promise<void> {
    if (MOCK_MODE) { this.mockSet('mock_qreports', this.mockGet('mock_qreports').filter((r: any) => r.id !== id)); return; }
    await this.req(`/quarterly-reports/${id}`, 'DELETE');
  }
  async getQuarterlyResponses(reportId: string, isAdmin: boolean, organisation?: string): Promise<any[]> {
    if (MOCK_MODE) { const all = this.mockGet('mock_qresponses').filter((r: any) => r.reportId === reportId); return isAdmin ? all : all.filter((r: any) => r.organisation === (organisation || 'My organisation')); }
    return this.req(`/quarterly-reports/${reportId}/responses`);
  }
  async saveQuarterlyResponse(reportId: string, data: { organisation?: string; answers: any; status: string; submittedBy?: string }): Promise<any> {
    if (MOCK_MODE) {
      const all = this.mockGet('mock_qresponses');
      const org = data.organisation || 'My organisation';
      const rec = { id: crypto.randomUUID(), reportId, ...data, organisation: org, submittedAt: data.status === 'Submitted' ? new Date().toISOString() : null, updatedAt: new Date().toISOString() };
      this.mockSet('mock_qresponses', [...all.filter((r: any) => !(r.reportId === reportId && r.organisation === org)), rec]);
      return rec;
    }
    return this.req(`/quarterly-reports/${reportId}/responses`, 'PUT', data);
  }
}

export const api = new ApiService();
