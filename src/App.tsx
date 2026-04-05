import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutPlansPage } from './pages/treino/WorkoutPlansPage';
import { ExerciseCatalogPage } from './pages/treino/ExerciseCatalogPage';
import { WorkoutSchedulePage } from './pages/treino/WorkoutSchedulePage';
import { WorkoutSessionPage } from './pages/treino/WorkoutSessionPage';
import { WorkoutHistoryPage } from './pages/treino/WorkoutHistoryPage';
import { DietTodayPage } from './pages/dieta/DietTodayPage';
import { DietGoalsPage } from './pages/dieta/DietGoalsPage';
import { DietHistoryPage } from './pages/dieta/DietHistoryPage';
import { DisciplineTodayPage } from './pages/disciplina/DisciplineTodayPage';
import { HabitsPage } from './pages/disciplina/HabitsPage';
import { BooksPage } from './pages/disciplina/BooksPage';
import { DisciplineStatsPage } from './pages/disciplina/DisciplineStatsPage';
import { ConfigPage } from './pages/ConfigPage';
import { ConfirmProvider } from './components/ConfirmDialog';
export function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Treino Routes */}
            <Route
              path="treino"
              element={<Navigate to="/treino/planos" replace />} />
            
            <Route path="treino/planos" element={<WorkoutPlansPage />} />
            <Route path="treino/exercicios" element={<ExerciseCatalogPage />} />
            <Route path="treino/agenda" element={<WorkoutSchedulePage />} />
            <Route path="treino/sessao/:id" element={<WorkoutSessionPage />} />
            <Route path="treino/historico" element={<WorkoutHistoryPage />} />

            {/* Dieta Routes */}
            <Route
              path="dieta"
              element={<Navigate to="/dieta/hoje" replace />} />
            
            <Route path="dieta/hoje" element={<DietTodayPage />} />
            <Route path="dieta/metas" element={<DietGoalsPage />} />
            <Route path="dieta/historico" element={<DietHistoryPage />} />

            {/* Disciplina Routes */}
            <Route
              path="disciplina"
              element={<Navigate to="/disciplina/hoje" replace />} />
            
            <Route path="disciplina/hoje" element={<DisciplineTodayPage />} />
            <Route path="disciplina/habitos" element={<HabitsPage />} />
            <Route path="disciplina/livros" element={<BooksPage />} />
            <Route path="disciplina/stats" element={<DisciplineStatsPage />} />

            {/* Config Routes */}
            <Route path="config" element={<ConfigPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ConfirmProvider>
    </AuthProvider>);

}