import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2Icon, CircleIcon, TargetIcon } from 'lucide-react';
import { HabitLog } from '../../types';
import { cn } from '../../lib/utils';
import { disciplineApi } from '../../lib/api';
export function DisciplineTodayPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", {
    locale: ptBR
  });
  useEffect(() => {
    fetchTodayHabits();
  }, []);
  const fetchTodayHabits = async () => {
    setIsLoading(true);
    try {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      const data = await disciplineApi.getDailyChecklist(todayTimestamp);
      setHabitLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar hábitos do dia:', error);
      setHabitLogs([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggleComplete = async (logId: string) => {
    const log = habitLogs.find((l) => l.id === logId);
    if (!log) return;
    const newCompleted = !log.isCompleted;
    const newValue = newCompleted ? log.habit?.targetValue || 1 : 0;
    setHabitLogs((prev) =>
    prev.map((l) => {
      if (l.id === logId) {
        return { ...l, isCompleted: newCompleted, value: newValue };
      }
      return l;
    })
    );
    try {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      if (log.id && !log.id.startsWith('temp-')) {
        await disciplineApi.updateHabitLog(log.id, { value: newValue, isCompleted: newCompleted });
      } else {
        await disciplineApi.logHabit({
          habitId: log.habitId,
          date: todayTimestamp,
          value: newValue,
          isCompleted: newCompleted
        });
        fetchTodayHabits();
      }
    } catch (error) {
      console.error('Erro ao atualizar hábito:', error);
      fetchTodayHabits();
    }
  };
  const handleValueChange = async (logId: string, newValue: number) => {
    const log = habitLogs.find((l) => l.id === logId);
    if (!log) return;
    const target = log.habit?.targetValue || 1;
    const isCompleted = newValue >= target;
    setHabitLogs((prev) =>
    prev.map((l) => {
      if (l.id === logId) {
        return { ...l, value: newValue, isCompleted };
      }
      return l;
    })
    );
    try {
      const todayTimestamp = new Date().setHours(0, 0, 0, 0);
      if (log.id && !log.id.startsWith('temp-')) {
        await disciplineApi.updateHabitLog(log.id, { value: newValue, isCompleted });
      } else {
        await disciplineApi.logHabit({
          habitId: log.habitId,
          date: todayTimestamp,
          value: newValue,
          isCompleted
        });
        fetchTodayHabits();
      }
    } catch (error) {
      console.error('Erro ao atualizar valor do hábito:', error);
      fetchTodayHabits();
    }
  };
  const completedCount = habitLogs.filter((log) => log.isCompleted).length;
  const totalCount = habitLogs.length;
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-secondary rounded-md"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-24 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
      </div>);

  }
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check-in Diário
          </h1>
          <p className="text-muted-foreground capitalize mt-1">
            {todayFormatted}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-3">
          <TargetIcon size={20} className="text-primary" />
          <div>
            <p className="text-sm font-medium">Progresso</p>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {totalCount} hábitos
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {habitLogs.length === 0 ?
        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <TargetIcon
            size={48}
            className="text-muted-foreground opacity-50 mb-4" />
          
            <h3 className="text-lg font-medium">Nenhum hábito para hoje</h3>
            <p className="text-muted-foreground mt-1">
              Você não tem hábitos agendados para o dia de hoje.
            </p>
          </div> :

        habitLogs.map((log) =>
        <div
          key={log.id}
          className={cn(
            'bg-card border rounded-xl p-4 sm:p-6 transition-all duration-200',
            log.isCompleted ?
            'border-primary/50 bg-primary/5' :
            'border-border'
          )}>
          
              <div className="flex items-center gap-4">
                <button
              onClick={() => handleToggleComplete(log.id)}
              className={cn(
                'shrink-0 transition-colors',
                log.isCompleted ?
                'text-primary' :
                'text-muted-foreground hover:text-foreground'
              )}>
              
                  {log.isCompleted ?
              <CheckCircle2Icon size={28} /> :

              <CircleIcon size={28} />
              }
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                  className={cn(
                    'font-medium truncate',
                    log.isCompleted && 'text-muted-foreground line-through'
                  )}>
                  
                      {log.habit?.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground uppercase tracking-wider">
                      {log.habit?.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                  type="number"
                  min="0"
                  value={log.value}
                  onChange={(e) =>
                  handleValueChange(log.id, Number(e.target.value))
                  }
                  className="w-16 px-2 py-1 text-sm bg-input border border-border rounded text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                
                    <span className="text-sm text-muted-foreground">
                      / {log.habit?.targetValue} {log.habit?.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
        )
        }
      </div>
    </div>);

}