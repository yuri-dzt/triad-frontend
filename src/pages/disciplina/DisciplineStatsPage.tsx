import React, { useEffect, useState } from 'react';
import { FlameIcon, CheckCircle2Icon, BookOpenIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
'recharts';
import { cn } from '../../lib/utils';
import { disciplineApi } from '../../lib/api';
export function DisciplineStatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetchStats();
  }, []);
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const habits = await disciplineApi.getHabits().catch(() => []);
      const habitsBreakdown = await Promise.all(
        (habits || []).map(async (habit: any) => {
          const [streak, consistency] = await Promise.all([
            disciplineApi.getHabitStreak(habit.id).catch(() => ({ currentStreak: 0, longestStreak: 0 })),
            disciplineApi.getHabitConsistency(habit.id).catch(() => ({ rate: 0 }))
          ]);
          return {
            name: habit.name,
            type: habit.type,
            rate: consistency?.rate || 0,
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0
          };
        })
      );
      const longestStreakHabit = habitsBreakdown.reduce(
        (best: any, h: any) => (h.longestStreak > (best?.longestStreak || 0) ? h : best),
        null
      );
      setStats({
        summary: {
          longestStreak: longestStreakHabit?.longestStreak || 0,
          longestStreakHabit: longestStreakHabit?.name || '-',
          totalCompletedThisMonth: 0,
          booksFinished: 0
        },
        consistencyData: [],
        habitsBreakdown
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        summary: { longestStreak: 0, longestStreakHabit: '-', totalCompletedThisMonth: 0, booksFinished: 0 },
        consistencyData: [],
        habitsBreakdown: []
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-32 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
        <div className="h-80 bg-card rounded-xl border border-border"></div>
      </div>);

  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Estatísticas
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua consistência e evolução ao longo do tempo.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <FlameIcon size={24} className="fill-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Maior Ofensiva
            </p>
            <p className="text-2xl font-semibold mt-1">
              {stats?.summary.longestStreak} dias
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.summary.longestStreakHabit}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CheckCircle2Icon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Concluídos no Mês
            </p>
            <p className="text-2xl font-semibold mt-1">
              {stats?.summary.totalCompletedThisMonth}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              hábitos realizados
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <BookOpenIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Livros Lidos
            </p>
            <p className="text-2xl font-semibold mt-1">
              {stats?.summary.booksFinished}
            </p>
            <p className="text-xs text-muted-foreground mt-1">este ano</p>
          </div>
        </div>
      </div>

      {/* Consistency Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-6">
          Consistência (Últimos 30 dias)
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats?.consistencyData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0
              }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))" />
              
              <XAxis
                dataKey="date"
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={20} />
              
              <YAxis
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12
                }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`} />
              
              <Tooltip
                cursor={{
                  fill: 'hsl(var(--secondary))'
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{
                  color: 'hsl(var(--primary))'
                }}
                formatter={(value: number) => [`${value}%`, 'Concluído']}
                labelStyle={{
                  color: 'hsl(var(--muted-foreground))',
                  marginBottom: '4px'
                }} />
              
              <Bar
                dataKey="rate"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40} />
              
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Habits Breakdown Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-medium">Detalhamento por Hábito</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Hábito</th>
                <th className="px-6 py-4 font-medium text-center">
                  Taxa de Conclusão
                </th>
                <th className="px-6 py-4 font-medium text-center">
                  Ofensiva Atual
                </th>
                <th className="px-6 py-4 font-medium text-center">
                  Maior Ofensiva
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats?.habitsBreakdown.map((habit: any, index: number) =>
              <tr
                key={index}
                className="hover:bg-secondary/20 transition-colors">
                
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">
                      {habit.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {habit.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <span
                      className={cn(
                        'font-medium',
                        habit.rate >= 80 ?
                        'text-primary' :
                        habit.rate >= 50 ?
                        'text-amber-500' :
                        'text-destructive'
                      )}>
                      
                        {habit.rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full text-xs font-medium">
                      <FlameIcon
                      size={12}
                      className={
                      habit.currentStreak > 0 ? 'fill-orange-500' : ''
                      } />
                    
                      {habit.currentStreak}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-muted-foreground">
                    {habit.longestStreak} dias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}