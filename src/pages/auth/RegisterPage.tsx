import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../lib/auth';
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'A senha deve ter no mínimo 4 caracteres'),
  organizationName: z.
  string().
  min(2, 'Nome da organização deve ter no mínimo 2 caracteres')
});
export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    inviteCode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');
    try {
      const data = registerSchema.parse(formData);
      setIsLoading(true);
      await register(data);
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
        setServerError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-widest text-foreground">
            TRIAD
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua conta para começar.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError &&
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/20 border border-destructive/50 rounded-md">
                {serverError}
              </div>
            }

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="name">
                
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="Seu nome" />
              
              {errors.name &&
              <p className="text-xs text-destructive">{errors.name}</p>
              }
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="email">
                
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="seu@email.com" />
              
              {errors.email &&
              <p className="text-xs text-destructive">{errors.email}</p>
              }
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="password">
                
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="••••••••" />
              
              {errors.password &&
              <p className="text-xs text-destructive">{errors.password}</p>
              }
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="organizationName">
                
                Nome da Organização
              </label>
              <input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="Minha Organização" />
              
              {errors.organizationName &&
              <p className="text-xs text-destructive">
                  {errors.organizationName}
                </p>
              }
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="inviteCode">
                Código de Convite
              </label>
              <input
                id="inviteCode"
                type="text"
                value={formData.inviteCode}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                placeholder="Digite o código de convite" />
              {errors.inviteCode &&
              <p className="text-xs text-destructive">
                  {errors.inviteCode}
                </p>
              }
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6">
              
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors">
              
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>);

}