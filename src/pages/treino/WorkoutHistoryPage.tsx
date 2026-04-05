import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDownIcon, ChevronUpIcon, TrophyIcon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { WorkoutSession, Exercise } from '../../types';
import { workoutApi } from '../../lib/api';

export function WorkoutHistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedSessionData, setExpandedSessionData] = useState<WorkoutSession | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [evolutionData, setEvolutionData] = useState<{ date: string; weight: number }[]>([]);
  const [prData, setPrData] = useState<{ weight: number; reps: number } | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sessionList, exerciseList] = await Promise.all([
        workoutApi.getWeeklyStats().catch(() => []),
        workoutApi.getExercises().catch(() => [])
      ]);
      // getWeeklyStats might return sessions array or an object
      const list = Array.isArray(sessionList) ? sessionList : [];
      setSessions(list);
      setExercises(exerciseList || []);
    } catch (error) {
      console.error('Failed to load history:', error);
      setSessions([]);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDuration = (session: WorkoutSession) => {
    if (!session.finishedAt || !session.startedAt) return 'Em andamento';
    const duration = Math.floor((session.finishedAt - session.startedAt) / 60000);
    return `${duration} min`;
  };

  const handleExpandSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setExpandedSessionData(null);
      return;
    }
    setExpandedSession(sessionId);
    try {
      const data = await workoutApi.getSession(sessionId);
      setExpandedSessionData(data);
    } catch (error) {
      console.error('Failed to load session details:', error);
    }
  };

  useEffect(() => {
    if (!selectedExercise) return;
    const fetchExerciseData = async () => {
      try {
        const [history, pr] = await Promise.all([
          workoutApi.getExerciseHistory(selectedExercise),
          workoutApi.getExercisePR(selectedExercise)
        ]);
        const formattedHistory = (history || []).map((h: any) => ({
          date: format(new Date(h.date), 'dd/MM'),
          weight: h.weight
        }));
        setEvolutionData(formattedHistory);
        setPrData(pr || null);
      } catch (error) {
        console.error('Failed to load exercise data:', error);
        setEvolutionData([]);
        setPrData(null);
      }
    };
    fetchExerciseData();
  }, [selectedExercise]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-card rounded-xl border border-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Histórico de Treinos</h1>

      {/* Exercise Evolution */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Evolução por Exercício</h2>
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(e.target.value || null)}
            className="px-3 py-1.5 bg-input border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Selecione um exercício</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {selectedExercise && evolutionData.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
              </LineChart>
            </ResponsiveContainer>

            {prData && (
              <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrophyIcon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recorde Pessoal</p>
                  <p className="text-xl font-semibold">{prData.weight} kg x {prData.reps} reps</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">
            {selectedExercise ? 'Nenhum registro encontrado para este exercício' : 'Selecione um exercício para ver a evolução'}
          </p>
        )}
      </div>

      {/* Sessions List */}
      <div>
        <h2 className="text-lg font-medium mb-4">Sessões Anteriores</h2>
        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhuma sessão registrada ainda</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleExpandSession(session.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {format(new Date(session.date), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Duração: {getDuration(session)}
                      </p>
                    </div>
                    <button className="text-muted-foreground">
                      {expandedSession === session.id ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                    </button>
                  </div>
                </div>

                {expandedSession === session.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border p-4 bg-background/50">
                    {expandedSessionData?.exercises && expandedSessionData.exercises.length > 0 ? (
                      <div className="space-y-3">
                        {expandedSessionData.exercises.map((ex: any) => (
                          <div key={ex.id} className="p-3 border border-border rounded-lg">
                            <p className="font-medium text-sm">{ex.exercise?.name || 'Exercício'}</p>
                            {ex.sets && ex.sets.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {ex.sets.map((set: any) => (
                                  <p key={set.id} className="text-xs text-muted-foreground">
                                    Série {set.setNumber}: {set.weight}kg x {set.reps} reps
                                    {set.rpe ? ` (RPE ${set.rpe})` : ''}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">Sem séries registradas</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {session.notes || 'Sem detalhes registrados'}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
