'use client';

import { useState } from 'react';
import { signIn } from '@/services/authService';
import { useRouter } from 'next/navigation'; // Для редиректа после входа

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn({ email, password });
      
      if (result) {

        console.log(result);
      } else {
        setError('Неверный логин или пароль');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form 
        onSubmit={handleSubmit} 
        className="p-8 border rounded-lg shadow-md w-96 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4">Вход в систему</h1>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        
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
          {isLoading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}