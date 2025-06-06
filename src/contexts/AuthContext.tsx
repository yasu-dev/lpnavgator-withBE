import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  autoLogin: (role?: 'admin' | 'user') => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: '管理者',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin' as const,
  },
  {
    id: '2',
    name: '一般ユーザー',
    email: 'user@example.com',
    password: 'password',
    role: 'user' as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('lp_navigator_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('lp_navigator_user');
      }
    }
    
    // ローカルストレージにユーザーがなければ、デモ用に一般ユーザーとして自動ログイン
    else {
      // デモ環境では自動ログイン
      const isDemo = localStorage.getItem('lp_navigator_demo_mode') === 'true';
      if (isDemo) {
        const demoUser = MOCK_USERS.find(user => user.role === 'user');
        if (demoUser) {
          const { password, ...userWithoutPassword } = demoUser;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('lp_navigator_user', JSON.stringify(userWithoutPassword));
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  // 初回レンダリング時にデモモードを有効にする
  useEffect(() => {
    localStorage.setItem('lp_navigator_demo_mode', 'true');
  }, []);

  // 実際のAWS APIを使用したログイン機能
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // 開発環境と本番環境でAPIのURLを切り替え
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : 'https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod';
        
      const response = await fetch(`${API_BASE_URL}/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'ログインに失敗しました');
      }

      const result = await response.json();
      
      // ログイン成功時、ユーザー情報を作成
      const user = {
        id: email, // 一時的にemailをIDとして使用
        name: email.split('@')[0], // メールアドレスの@前部分を名前として使用
        email,
        role: 'user' as const
      };
      
      // JWTトークンを保存
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
      if (result.idToken) {
        localStorage.setItem('idToken', result.idToken);
      }
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      // ユーザー情報を保存
      setCurrentUser(user);
      localStorage.setItem('lp_navigator_user', JSON.stringify(user));
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // ユーザー登録機能 - 実際のAWS APIに接続
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // 開発環境と本番環境でAPIのURLを切り替え
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001'
        : 'https://7dm1erset7.execute-api.ap-northeast-1.amazonaws.com/prod';
        
      const response = await fetch(`${API_BASE_URL}/v1/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 登録成功時、自動的にログイン処理を行う
      const loginResponse = await fetch(`${API_BASE_URL}/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        // JWTトークンを保存
        if (loginResult.accessToken) {
          localStorage.setItem('accessToken', loginResult.accessToken);
        }
        if (loginResult.idToken) {
          localStorage.setItem('idToken', loginResult.idToken);
        }
        if (loginResult.refreshToken) {
          localStorage.setItem('refreshToken', loginResult.refreshToken);
        }
      }
      
      // ユーザー情報を作成
      const newUser = {
        id: result.userId || String(Date.now()),
        name,
        email,
        role: 'user' as const
      };
      
      // ユーザー情報を保存
      setCurrentUser(newUser);
      localStorage.setItem('lp_navigator_user', JSON.stringify(newUser));
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };
  
  // パスワードリセット機能
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate network request
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(
          (user) => user.email === email
        );
        
        if (foundUser) {
          // In a real app, this would send a password reset email
          console.log(`Password reset email sent to ${email}`);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error('このメールアドレスは登録されていません。'));
        }
      }, 1000);
    });
  };

  // 自動ログイン機能（デモ用）
  const autoLogin = (role: 'admin' | 'user' = 'user') => {
    const demoUser = MOCK_USERS.find(user => user.role === role);
    if (demoUser) {
      const { password, ...userWithoutPassword } = demoUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('lp_navigator_user', JSON.stringify(userWithoutPassword));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lp_navigator_user');
    // デモモードは維持
  };

  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isAdmin,
    autoLogin,
    register,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};