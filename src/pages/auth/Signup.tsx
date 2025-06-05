import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, Building } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // エラーをクリア
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('名前を入力してください');
      return false;
    }
    if (!formData.email.trim()) {
      setError('メールアドレスを入力してください');
      return false;
    }
    if (!formData.password.trim()) {
      setError('パスワードを入力してください');
      return false;
    }
    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        company: formData.company || undefined,
        position: formData.position || undefined
      });

      // サインアップ成功時の処理
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.user));

      // ダッシュボードにリダイレクト
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アカウント作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            新しいアカウントを作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            または{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              既存のアカウントでログイン
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                名前 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="山田 太郎"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="your@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                会社名
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building size={18} className="text-gray-400" />
                </div>
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  className="pl-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="株式会社サンプル"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                役職
              </label>
              <div className="mt-1">
                <input
                  id="position"
                  name="position"
                  type="text"
                  autoComplete="organization-title"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="マーケティング部長"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="pl-10 pr-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="8文字以上のパスワード"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                8文字以上で入力してください
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="pl-10 pr-10 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500"
                >
                  利用規約
                </Link>
                および
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500"
                >
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                leftIcon={<UserPlus size={18} />}
                disabled={!isFormValid || isLoading}
                isLoading={isLoading}
              >
                アカウントを作成
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup; 