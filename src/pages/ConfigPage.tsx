import React, { useState } from 'react';
import { UserIcon, LockIcon, BuildingIcon, CreditCardIcon } from 'lucide-react';
import { useAuth } from '../lib/auth';
export function ConfigPage() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState('');
  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Funcionalidade em breve! Atualização de perfil ainda não disponível.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Funcionalidade em breve! Alteração de senha ainda não disponível.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua conta e preferências do sistema.
        </p>
      </div>

      {successMessage &&
      <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm font-medium">
          {successMessage}
        </div>
      }

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Navigation (Visual only for now) */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium transition-colors">
            <UserIcon size={18} />
            Perfil
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md text-sm font-medium transition-colors">
            <LockIcon size={18} />
            Segurança
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
            title="Em breve">
            
            <BuildingIcon size={18} />
            Organização
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
            title="Em breve">
            
            <CreditCardIcon size={18} />
            Assinatura
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-medium">Informações do Perfil</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Atualize suas informações pessoais e endereço de email.
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary max-w-md" />
                  
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      email: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary max-w-md" />
                  
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50">

                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-medium">Alterar Senha</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Certifique-se de usar uma senha longa e segura.
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha Atual</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary max-w-md" />
                  
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova Senha</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary max-w-md" />
                  
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary max-w-md" />
                  
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword
                    }
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50">

                    Atualizar Senha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>);

}