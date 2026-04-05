import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  CheckIcon
} from 'lucide-react';
import { ScheduledWorkout } from '../../types';
import { cn } from '../../lib/utils';
import { workoutApi } from '../../lib/api';

const DAYS_OF_WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function WorkoutSchedulePage() {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchScheduledWorkouts(); }, [currentWeekStart]);

  const fetchScheduledWorkouts = async () => {
    setIsLoading(true);
    try {
      const weekTimestamp = currentWeekStart.getTime().toString();
      const data = await workoutApi.getScheduledWorkouts(weekTimestamp);
      setScheduledWorkouts(data);
    } catch (error) {
      console.error('Failed to load scheduled workouts:', error);
      setScheduledWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  const handleGenerateWeek = async () => {
    try {
      const monday = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
      await workoutApi.generateWeek({ weekStartDate: monday.getTime() });
      fetchScheduledWorkouts();
    } catch (error) {
      console.error('Failed to generate week:', error);
    }
  };

  const handleSkip = async (id: string) => {
    try {
      await workoutApi.skip(id);
      setScheduledWorkouts(prev => prev.map(w => w.id === id ? { ...w, status: 'SKIPPED' as const } : w));
    } catch (error) {
      console.error('Failed to skip workout:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await workoutApi.complete(id);
      setScheduledWorkouts(prev => prev.map(w => w.id === id ? { ...w, status: 'DONE' as const } : w));
    } catch (error) {
      console.error('Failed to complete workout:', error);
    }
  };

  const handleWorkoutClick = (workout: ScheduledWorkout) => {
    if (workout.status === 'PENDING') {
      navigate(`/treino/sessao/${workout.id}`);
    }
  };

  const getStatusBadge = (status: ScheduledWorkout['status']) => {
    switch (status) {
      case 'DONE': return 'bg-primary/20 text-primary';
      case 'PENDING': return 'bg-secondary text-muted-foreground';
      case 'RESCHEDULED': return 'bg-amber-500/20 text-amber-500';
      case 'SKIPPED': return 'bg-destructive/20 text-destructive line-through';
    }
  };

  const getStatusLabel = (status: ScheduledWorkout['status']) => {
    switch (status) {
      case 'DONE': return 'Feito';
      case 'PENDING': return 'Pendente';
      case 'RESCHEDULED': return 'Remarcado';
      case 'SKIPPED': return 'Pulado';
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md"></div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-lg border border-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Agenda de Treinos</h1>
        <button
          onClick={handleGenerateWeek}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <CalendarIcon size={18} />
          Gerar Semana
        </button>
      </div>

      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <button onClick={handlePreviousWeek} className="p-2 hover:bg-secondary rounded-md transition-colors">
          <ChevronLeftIcon size={20} />
        </button>
        <div className="text-center">
          <p className="font-medium">
            {format(weekDays[0]!, 'd MMM', { locale: ptBR })} - {format(weekDays[6]!, 'd MMM yyyy', { locale: ptBR })}
          </p>
        </div>
        <button onClick={handleNextWeek} className="p-2 hover:bg-secondary rounded-md transition-colors">
          <ChevronRightIcon size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayWorkouts = scheduledWorkouts.filter(
            (w) => format(new Date(w.scheduledDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div
              key={index}
              className={cn(
                'bg-card border border-border rounded-lg p-4 min-h-[200px]',
                isToday && 'ring-1 ring-primary'
              )}>
              <div className="text-center mb-4">
                <p className="text-xs text-muted-foreground">{DAYS_OF_WEEK[index]}</p>
                <p className={cn('text-lg font-semibold', isToday && 'text-primary')}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="space-y-2">
                {dayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => handleWorkoutClick(workout)}
                    className={cn(
                      'p-3 bg-background border border-border rounded-md',
                      workout.status === 'PENDING' && 'cursor-pointer hover:bg-secondary/50 transition-colors'
                    )}>
                    <p className="text-sm font-medium mb-2">{workout.workoutPlanDay?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadge(workout.status))}>
                        {getStatusLabel(workout.status)}
                      </span>
                    </div>
                    {workout.status === 'PENDING' && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleComplete(workout.id); }}
                          className="flex-1 text-xs py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors">
                          Feito
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSkip(workout.id); }}
                          className="flex-1 text-xs py-1 bg-destructive/20 text-destructive rounded hover:bg-destructive/30 transition-colors">
                          Pular
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {dayWorkouts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Descanso</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
