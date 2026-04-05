import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../lib/auth';
export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>);

  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>);

}