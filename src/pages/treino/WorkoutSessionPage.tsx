import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, TimerIcon, CheckIcon } from 'lucide-react';
import { WorkoutSessionExercise, WorkoutSet } from '../../types';
import { cn } from '../../lib/utils';
import { workoutApi } from '../../lib/api';
interface ExerciseWithSets extends WorkoutSessionExercise {
  sets: WorkoutSet[];
}
export function WorkoutSessionPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<ExerciseWithSets[]>([]);
  const [notes, setNotes] = useState('');
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchSession();
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [id, startTime]);
  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const session = await workoutApi.getSession(id!);
      setWorkoutName(session.workoutPlanDay?.name || 'Treino');
      setExercises(session.exercises || []);
      if (session.notes) setNotes(session.notes);
    } catch (error) {
      console.error('Failed to load session:', error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddSet = async (exerciseId: string) => {
    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      const setNumber = (exercise?.sets.length || 0) + 1;
      const newSet = await workoutApi.addSet(exerciseId, {
        setNumber,
        reps: 0,
        weight: 0
      });
      setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, newSet]
          };
        }
        return ex;
      })
      );
    } catch (error) {
      console.error('Failed to add set:', error);
    }
  };
  const handleUpdateSet = (
  exerciseId: string,
  setId: string,
  field: keyof WorkoutSet,
  value: number) =>
  {
    setExercises((prev) =>
    prev.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((set) =>
          set.id === setId ?
          {
            ...set,
            [field]: value
          } :
          set
          )
        };
      }
      return ex;
    })
    );
  };
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
    prev.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter((set) => set.id !== setId)
        };
      }
      return ex;
    })
    );
  };
  const handleFinish = async () => {
    try {
      await workoutApi.updateSession(id!, { finishedAt: Date.now(), notes: notes || undefined });
      navigate('/treino/agenda');
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-48 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
      </div>);

  }
  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {workoutName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg">
          <TimerIcon size={18} className="text-primary" />
          <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) =>
        <motion.div
          key={exercise.id}
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}
          className="bg-card border border-border rounded-xl p-6">
          
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  {exercise.exercise?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {exercise.exercise?.muscleGroup} •{' '}
                  {exercise.exercise?.equipment}
                </p>
              </div>
              <button
              onClick={() => handleAddSet(exercise.id)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              
                <PlusIcon size={16} />
                Série
              </button>
            </div>

            {exercise.sets.length > 0 ?
          <div className="space-y-2">
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_40px] gap-2 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                  <span>Série</span>
                  <span>Reps</span>
                  <span>Peso (kg)</span>
                  <span>Desc (s)</span>
                  <span>RPE</span>
                  <span></span>
                </div>
                {exercise.sets.map((set) =>
            <div
              key={set.id}
              className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_40px] gap-2 items-center">
              
                    <span className="text-sm font-medium">
                      #{set.setNumber}
                    </span>
                    <input
                type="number"
                value={set.reps || ''}
                onChange={(e) =>
                handleUpdateSet(
                  exercise.id,
                  set.id,
                  'reps',
                  Number(e.target.value)
                )
                }
                className="px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0" />
              
                    <input
                type="number"
                step="0.5"
                value={set.weight || ''}
                onChange={(e) =>
                handleUpdateSet(
                  exercise.id,
                  set.id,
                  'weight',
                  Number(e.target.value)
                )
                }
                className="px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0" />
              
                    <input
                type="number"
                value={set.restSeconds || ''}
                onChange={(e) =>
                handleUpdateSet(
                  exercise.id,
                  set.id,
                  'restSeconds',
                  Number(e.target.value)
                )
                }
                className="px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0" />
              
                    <input
                type="number"
                min="1"
                max="10"
                value={set.rpe || ''}
                onChange={(e) =>
                handleUpdateSet(
                  exercise.id,
                  set.id,
                  'rpe',
                  Number(e.target.value)
                )
                }
                className="px-2 py-1.5 bg-input border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="0" />
              
                    <button
                onClick={() => handleDeleteSet(exercise.id, set.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                
                      <TrashIcon size={16} />
                    </button>
                  </div>
            )}
              </div> :

          <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma série registrada ainda
              </p>
          }
          </motion.div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <label className="text-sm font-medium mb-2 block">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={4}
          placeholder="Anotações sobre o treino..." />
        
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:left-64">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
            
            <CheckIcon size={20} />
            Finalizar Treino
          </button>
        </div>
      </div>
    </div>);

}