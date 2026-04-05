import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DumbbellIcon,
  FlameIcon,
  DropletsIcon,
  CheckCircle2Icon,
  CircleIcon,
  ArrowRightIcon } from
'lucide-react';
import { useAuth } from '../lib/auth';
import { dashboardApi } from '../lib/api';
import { DashboardToday, WeekSummary } from '../types';
import { cn } from '../lib/utils';
export function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [todayData, setTodayData] = useState<DashboardToday | null>(null);
  const [weekData, setWeekData] = useState<WeekSummary | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [today, week] = await Promise.all([
          dashboardApi.getToday(),
          dashboardApi.getWeekSummary()
        ]);
        setTodayData(today);
        setWeekData(week);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        setTodayData({ workout: { scheduled: null, session: null }, diet: { goal: null, log: null, water: 0 }, habits: { total: 0, completed: 0, logs: [] } });
        setWeekData({ workouts: { completed: 0, total: 0 }, dietAdherence: 0, habitCompletionRate: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", {
    locale: ptBR
  });
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-secondary rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-card rounded-xl border border-border"></div>
          <div className="h-64 bg-card rounded-xl border border-border"></div>
          <div className="h-64 bg-card rounded-xl border border-border"></div>
        </div>
      </div>);

  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}
        </h1>
        <p className="text-muted-foreground capitalize">{todayFormatted}</p>
      </div>

      {/* Week Summary Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Treinos na Semana
            </p>
            <p className="text-2xl font-semibold mt-1">
              {weekData?.workouts.completed} / {weekData?.workouts.total}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <DumbbellIcon size={20} />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Aderência à Dieta
            </p>
            <p className="text-2xl font-semibold mt-1">
              {weekData?.dietAdherence}%
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <FlameIcon size={20} />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Hábitos Concluídos
            </p>
            <p className="text-2xl font-semibold mt-1">
              {weekData?.habitCompletionRate}%
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2Icon size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treino do Dia */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Treino do Dia</h2>
            {todayData?.workout.scheduled?.status === 'PENDING' &&
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                Pendente
              </span>
            }
            {todayData?.workout.scheduled?.status === 'DONE' &&
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                Feito
              </span>
            }
          </div>

          {todayData?.workout.scheduled ?
          <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-2xl font-semibold">
                  {todayData.workout.scheduled.workoutPlanDay?.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Plano atual
                </p>
              </div>

              {todayData.workout.scheduled.status === 'PENDING' &&
            <button className="mt-8 w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                  Iniciar Treino
                  <ArrowRightIcon size={16} />
                </button>
            }
            </div> :

          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
              <DumbbellIcon size={32} className="mb-2 opacity-50" />
              <p>Dia de descanso</p>
            </div>
          }
        </div>

        {/* Dieta do Dia */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-medium mb-6">Dieta do Dia</h2>

          {todayData?.diet.goal ?
          <div className="space-y-5">
              {/* Calories */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Calorias</span>
                  <span className="font-medium">
                    {todayData.diet.log?.totalCalories || 0} /{' '}
                    {todayData.diet.goal.calories} kcal
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min(100, (todayData.diet.log?.totalCalories || 0) / todayData.diet.goal.calories * 100)}%`
                  }} />
                
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Prot</span>
                    <span>{todayData.diet.log?.totalProtein || 0}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (todayData.diet.log?.totalProtein || 0) / todayData.diet.goal.protein * 100)}%`
                    }} />
                  
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Carb</span>
                    <span>{todayData.diet.log?.totalCarbs || 0}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (todayData.diet.log?.totalCarbs || 0) / todayData.diet.goal.carbs * 100)}%`
                    }} />
                  
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Gord</span>
                    <span>{todayData.diet.log?.totalFat || 0}g</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (todayData.diet.log?.totalFat || 0) / todayData.diet.goal.fat * 100)}%`
                    }} />
                  
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DropletsIcon size={18} className="text-blue-400" />
                  <span className="text-sm font-medium">Água</span>
                </div>
                <span className="text-sm">
                  {todayData.diet.water} / {todayData.diet.goal.waterMl} ml
                </span>
              </div>
            </div> :

          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground h-full min-h-[150px]">
              <p>Nenhuma meta definida</p>
            </div>
          }
        </div>

        {/* Hábitos do Dia */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Hábitos do Dia</h2>
            <span className="text-sm text-muted-foreground">
              {todayData?.habits.completed} / {todayData?.habits.total}
            </span>
          </div>

          <div className="space-y-3">
            {todayData?.habits.logs.map((log) =>
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
              
                <div className="flex items-center gap-3">
                  <button
                  className={cn(
                    'text-muted-foreground hover:text-primary transition-colors',
                    log.isCompleted && 'text-primary'
                  )}>
                  
                    {log.isCompleted ?
                  <CheckCircle2Icon size={20} /> :

                  <CircleIcon size={20} />
                  }
                  </button>
                  <span
                  className={cn(
                    'text-sm font-medium',
                    log.isCompleted && 'text-muted-foreground line-through'
                  )}>
                  
                    {log.habit?.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.value} / {log.habit?.targetValue} {log.habit?.unit}
                </span>
              </div>
            )}

            {(!todayData?.habits.logs ||
            todayData.habits.logs.length === 0) &&
            <div className="text-center text-muted-foreground py-6 text-sm">
                Nenhum hábito para hoje
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

}