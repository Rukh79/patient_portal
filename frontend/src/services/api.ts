const API_BASE_URL = 'http://localhost:5000';

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'patient' | 'clinician';
    specialization?: string;
    license_number?: string;
  };
  role: string;
  redirect: string;
}

export interface Query {
  id: number;
  question: string;
  category: string;
  status: 'pending' | 'pending_review' | 'verified';
  urgency_level: 'low' | 'normal' | 'high';
  created_at: string;
  ai_response?: string;
  clinician_response?: string;
  is_anonymous: boolean;
}

export interface QueryResponse {
  queries: Query[];
  pages: number;
}

export interface RegisterFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'clinician';
  specialization?: string;
  license_number?: string;
}

// Helper function to ensure consistent URL formatting
const formatUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`http://localhost:5000/${endpoint}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`http://localhost:5000/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    
    return response.json();
  },

  async login(email: string, password: string, remember?: boolean): Promise<LoginResponse> {
    return this.post<LoginResponse>('api/auth/login', {
      email,
      password,
      remember,
    });
  },

  async register(formData: RegisterFormData): Promise<LoginResponse> {
    return this.post<LoginResponse>('api/auth/register', formData);
  },

  async logout(): Promise<void> {
    await this.post('api/auth/logout');
  },
};

export { api }; 