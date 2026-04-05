import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../lib/auth';
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'A senha deve ter no mínimo 4 caracteres')
});
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    try {
      const data = loginSchema.parse({
        email,
        password
      });
      setIsLoading(true);
      await login(data);
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        setServerError('Credenciais inválidas. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-widest text-foreground">
            TRIAD
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entre para gerenciar seu treino, dieta e disciplina.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError &&
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/20 border border-destructive/50 rounded-md">
                {serverError}
              </div>
            }

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="email">
                
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="seu@email.com" />
              
              {errors.email &&
              <p className="text-xs text-destructive">{errors.email}</p>
              }
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-medium text-foreground"
                  htmlFor="password">
                  
                  Senha
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="••••••••" />
              
              {errors.password &&
              <p className="text-xs text-destructive">{errors.password}</p>
              }
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors">
              
              Registre-se
            </Link>
          </div>
        </div>
      </div>
    </div>);

}