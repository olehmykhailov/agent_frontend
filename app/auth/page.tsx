'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/services/authService';
import { useRouter } from 'next/navigation';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'sign-in') {
        const result = await signIn({ email, password });
        if (result) {
          router.push('/chat');
        } else {
          setError('Неверный логин или пароль');
        }
      } else {
        // await signUp({ email, username, password });
        setMode('sign-in'); // Switch to sign-in after successful sign-up
      }
    } catch (err) {
      setError(`Произошла ошибка при ${mode === 'sign-in' ? 'входе' : 'регистрации'}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 border rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-4 border-b">
          <button 
            onClick={() => handleModeChange('sign-in')}
            className={`px-4 py-2 text-lg font-medium ${mode === 'sign-in' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Вход
          </button>
          <button 
            onClick={() => handleModeChange('sign-up')}
            className={`px-4 py-2 text-lg font-medium ${mode === 'sign-up' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Регистрация
          </button>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold mb-4 text-center">
            {mode === 'sign-in' ? 'Вход в систему' : 'Создание аккаунта'}
          </h1>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          {mode === 'sign-up' && (
            <input
              type="text"
              placeholder="Username"
              className="border p-2 rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          )}
          
          <input
            type="password"
            placeholder="Пароль"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <button 
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : (mode === 'sign-in' ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
      </div>
    </div>
  );
}