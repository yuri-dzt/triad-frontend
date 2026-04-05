import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend } from
'recharts';
import { dietApi } from '../../lib/api';
export function DietHistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [adherenceData, setAdherenceData] = useState<any>(null);
  useEffect(() => {
    fetchHistory();
  }, []);
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [weeklyStats, goalAdherence] = await Promise.all([
        dietApi.getWeeklyStats().catch(() => []),
        dietApi.getGoalAdherence().catch(() => null)
      ]);
      setHistoryData(Array.isArray(weeklyStats) ? weeklyStats : []);
      setAdherenceData(goalAdherence || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: 0
      });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistoryData([]);
      setAdherenceData({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-card rounded-xl border border-border md:col-span-1"></div>
          <div className="h-32 bg-card rounded-xl border border-border md:col-span-2"></div>
        </div>
        <div className="h-[400px] bg-card rounded-xl border border-border"></div>
      </div>);

  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Histórico de Dieta
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua evolução e consistência.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adherence Card */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-1">
          <h2 className="text-lg font-medium mb-6">
            Aderência (Últimos 14 dias)
          </h2>
          <div className="space-y-4">
            <AdherenceRow
              label="Calorias"
              value={adherenceData?.calories}
              colorClass="bg-primary" />
            
            <AdherenceRow
              label="Proteína"
              value={adherenceData?.protein}
              colorClass="bg-blue-400" />
            
            <AdherenceRow
              label="Carboidratos"
              value={adherenceData?.carbs}
              colorClass="bg-amber-400" />
            
            <AdherenceRow
              label="Gordura"
              value={adherenceData?.fat}
              colorClass="bg-rose-400" />
            
            <AdherenceRow
              label="Água"
              value={adherenceData?.water}
              colorClass="bg-blue-300" />
            
          </div>
        </div>

        {/* Calories Chart */}
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-6">
            Calorias Consumidas vs Meta
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false} />
                
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false} />
                
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{
                    color: 'hsl(var(--foreground))'
                  }} />
                
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '10px'
                  }} />
                
                <Bar
                  dataKey="calories"
                  name="Consumido"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]} />
                
                <Bar
                  dataKey="goalCalories"
                  name="Meta"
                  fill="hsl(var(--secondary))"
                  radius={[4, 4, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Macros Chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-6">
          Evolução de Macronutrientes
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0
              }}>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false} />
              
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false} />
              
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }} />
              
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }} />
              
              <Line
                type="monotone"
                dataKey="protein"
                name="Proteína (g)"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={{
                  r: 3
                }}
                activeDot={{
                  r: 5
                }} />
              
              <Line
                type="monotone"
                dataKey="carbs"
                name="Carboidratos (g)"
                stroke="#fbbf24"
                strokeWidth={2}
                dot={{
                  r: 3
                }}
                activeDot={{
                  r: 5
                }} />
              
              <Line
                type="monotone"
                dataKey="fat"
                name="Gordura (g)"
                stroke="#fb7185"
                strokeWidth={2}
                dot={{
                  r: 3
                }}
                activeDot={{
                  r: 5
                }} />
              
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);

}
function AdherenceRow({
  label,
  value,
  colorClass




}: {label: string;value: number;colorClass: string;}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{
            width: `${value}%`
          }} />
        
      </div>
    </div>);

}