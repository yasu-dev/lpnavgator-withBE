// API Service Layer
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod';
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA as string) === 'true' || true; // デフォルトでモックデータを使用

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'standard' | 'premium' | 'enterprise';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  company?: string;
  position?: string;
  phone?: string;
  notes?: string;
  usageLimit: number;
  apiAccess: boolean;
  usage: {
    lpGenerated: number;
    apiCalls: number;
  };
}

export interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
  isActive: boolean;
  helperText?: string;
  sampleAnswer?: string;
  isRequired?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  company?: string;
  position?: string;
}

// API Helper Functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Mock Data Import (fallback)
import { mockUsers, mockQuestions } from '../utils/mockData';

// Authentication API
export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      // Mock login
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }
      return {
        accessToken: 'mock-access-token',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    return handleApiResponse(response);
  },

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      // Mock signup
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name
      };
      return {
        accessToken: 'mock-access-token',
        user: newUser
      };
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    return handleApiResponse(response);
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// User API
export const userApi = {
  async getUser(userId: string): Promise<User> {
    if (USE_MOCK_DATA) {
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }
      return user as User;
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleApiResponse(response);
  },

  async getAllUsers(): Promise<User[]> {
    if (USE_MOCK_DATA) {
      return mockUsers as User[];
    }

    const response = await fetch(`${API_BASE_URL}/v1/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleApiResponse(response);
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    if (USE_MOCK_DATA) {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('ユーザーが見つかりません');
      }
      const updatedUser = { ...mockUsers[userIndex], ...userData } as User;
              (mockUsers as any)[userIndex] = updatedUser;
      return updatedUser;
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    return handleApiResponse(response);
  },

  async deleteUser(userId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('ユーザーが見つかりません');
      }
      mockUsers.splice(userIndex, 1);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
};

// Questions API
export const questionsApi = {
  async getAllQuestions(): Promise<Question[]> {
    if (USE_MOCK_DATA) {
      return mockQuestions;
    }

    const response = await fetch(`${API_BASE_URL}/v1/questions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleApiResponse(response);
  },

  async getQuestion(questionId: string): Promise<Question> {
    if (USE_MOCK_DATA) {
      const question = mockQuestions.find(q => q.id === questionId);
      if (!question) {
        throw new Error('質問が見つかりません');
      }
      return question;
    }

    const response = await fetch(`${API_BASE_URL}/v1/questions/${questionId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    return handleApiResponse(response);
  },

  async createQuestion(questionData: Omit<Question, 'id'>): Promise<Question> {
    if (USE_MOCK_DATA) {
      const newQuestion = {
        ...questionData,
        id: `question-${Date.now()}`
      };
      (mockQuestions as any).push(newQuestion);
      return newQuestion as Question;
    }

    const response = await fetch(`${API_BASE_URL}/v1/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });

    return handleApiResponse(response);
  },

  async updateQuestion(questionId: string, questionData: Partial<Question>): Promise<Question> {
    if (USE_MOCK_DATA) {
      const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) {
        throw new Error('質問が見つかりません');
      }
      const updatedQuestion = { ...mockQuestions[questionIndex], ...questionData };
      mockQuestions[questionIndex] = updatedQuestion;
      return updatedQuestion;
    }

    const response = await fetch(`${API_BASE_URL}/v1/questions/${questionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(questionData)
    });

    return handleApiResponse(response);
  },

  async deleteQuestion(questionId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
      if (questionIndex === -1) {
        throw new Error('質問が見つかりません');
      }
      mockQuestions.splice(questionIndex, 1);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/v1/questions/${questionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  }
};

// Export all APIs
export const api = {
  auth: authApi,
  users: userApi,
  questions: questionsApi
}; 