// FastAPI client
const API_BASE_URL = const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    // Keep both keys in sync to accommodate different auth flows
    localStorage.setItem('auth_token', token);
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Always refresh token from localStorage to avoid stale instance state
    const freshToken = this.token || localStorage.getItem('auth_token') || localStorage.getItem('access_token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (freshToken) {
      headers['Authorization'] = `Bearer ${freshToken}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API error: ${response.status}`);
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(userData: any) {
    const data = await this.request<{ access_token: string }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.access_token);
    return data;
  }

  async logout() {
    await this.request('/api/v1/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getProfile() {
    return this.request('/api/v1/auth/me');
  }

  // Storage endpoints
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();