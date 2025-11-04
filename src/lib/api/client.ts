// FastAPI client for backend services and data access
const API_BASE_URL = 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    const response = await this.request<{ access_token: string; user: any }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async register(email: string, password: string, name?: string, role?: string): Promise<ApiResponse<{ access_token: string; user: any }>> {
    const response = await this.request<{ access_token: string; user: any }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });

    if (response.data) {
      this.setToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/api/v1/auth/logout', {
      method: 'POST',
    });
    
    this.clearToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/auth/me');
  }

  // File upload methods
  async uploadFile(file: File, bucket?: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Determine the correct endpoint based on bucket or file type
    let endpoint = '/api/v1/files/upload/course-content'; // default
    if (bucket) {
      // Normalize common plural bucket names to match backend route names
      const normalizedBucket =
        bucket === 'course-videos' ? 'course-video' :
        bucket === 'course-images' ? 'course-image' :
        bucket;

      endpoint = `/api/v1/files/upload/${normalizedBucket}`;
    } else {
      // Auto-detect based on file type if no bucket specified
      const fileType = file.type.toLowerCase();
      if (fileType.startsWith('image/')) {
        endpoint = '/api/v1/files/upload/course-image';
      } else if (fileType.startsWith('video/')) {
        endpoint = '/api/v1/files/upload/course-video';
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        data: { url: data.file_path },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Course methods (to be implemented when backend endpoints are ready)
  async getCourses(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/v1/courses/');
  }

  async getCourse(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${id}`);
  }
  
  async getCourseProgress(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${id}/progress`);
  }

  async createCourse(courseData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/v1/courses/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // Course enrollment methods
  async enrollInCourse(courseId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  async unenrollFromCourse(courseId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/courses/${courseId}/unenroll`, {
      method: 'DELETE',
    });
  }

  // Course modules methods
  async getCourseModules(courseId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/courses/${courseId}/modules`);
  }

  async createCourseModule(courseId: string, moduleData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async updateCourseModule(courseId: string, moduleId: string, moduleData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
  }

  async deleteCourseModule(courseId: string, moduleId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    });
  }

  // Legacy lecture methods removed; use lesson methods below

  // Lesson methods (preferred)
  async getModuleLessons(moduleId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/courses/modules/${moduleId}/lessons`);
  }

  async createModuleLesson(moduleId: string, lessonData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(lessonId: string, lessonData: any): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/courses/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  async getLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/lessons/${lessonId}`);
  }

  async getLessonProgress(lessonId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/lessons/${lessonId}/progress`);
  }

  async upsertLessonProgress(lessonId: string, progress: number, is_completed: boolean): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/courses/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId, progress, is_completed }),
    });
  }

  // Activity methods
  async getRecentActivity(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/courses/recent-activity`);
  }

  // Generic request method for custom endpoints
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Messaging methods
  async getContacts(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/api/v1/messages/contacts`);
  }

  async getConversation(contactId: string): Promise<ApiResponse<{ messages: any[] }>> {
    return this.request<{ messages: any[] }>(`/api/v1/messages/conversation/${contactId}`);
  }

  async sendMessage(recipientId: string, content: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/v1/messages/send`, {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, content }),
    });
  }

  async markRead(contactId: string): Promise<ApiResponse<{ status: string }>> {
    // POST with contact_id as query or body; backend expects parameter path body
    // We'll send as JSON body and fetch will handle it
    return this.request<{ status: string }>(`/api/v1/messages/mark-read?contact_id=${contactId}`, {
      method: 'POST',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;