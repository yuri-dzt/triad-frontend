import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, EditIcon, TrashIcon, FlameIcon, XIcon } from 'lucide-react';
import { z } from 'zod';
import { Habit } from '../../types';
import { cn } from '../../lib/utils';
import { disciplineApi } from '../../lib/api';
import { useConfirm } from '../../components/ConfirmDialog';
const habitSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['READING', 'STUDY', 'ROUTINE', 'HEALTH', 'FITNESS', 'OTHER']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS']),
  targetValue: z.number().min(1, 'Meta deve ser maior que 0'),
  unit: z.string().min(1, 'Unidade é obrigatória')
});
const HABIT_TYPES = {
  READING: 'Leitura',
  STUDY: 'Estudo',
  ROUTINE: 'Rotina',
  HEALTH: 'Saúde',
  FITNESS: 'Fitness',
  OTHER: 'Outro'
};
const FREQUENCIES = {
  DAILY: 'Diário',
  WEEKLY: 'Semanal',
  SPECIFIC_DAYS: 'Dias Específicos'
};
export function HabitsPage() {
  const confirm = useConfirm();
  const [habits, setHabits] = useState<
    (Habit & {
      streak: number;
    })[]>(
    []);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'ROUTINE',
    frequency: 'DAILY',
    targetValue: 1,
    unit: 'vez'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchHabits();
  }, []);
  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const habitsData = await disciplineApi.getHabits();
      const habitsWithStreaks = await Promise.all(
        (habitsData || []).map(async (habit: Habit) => {
          const streak = await disciplineApi.getHabitStreak(habit.id).catch(() => ({ currentStreak: 0 }));
          return { ...habit, streak: streak?.currentStreak || 0 };
        })
      );
      setHabits(habitsWithStreaks);
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
      setHabits([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenModal = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setFormData({
        name: habit.name,
        type: habit.type,
        frequency: habit.frequency,
        targetValue: habit.targetValue,
        unit: habit.unit
      });
    } else {
      setEditingHabit(null);
      setFormData({
        name: '',
        type: 'ROUTINE',
        frequency: 'DAILY',
        targetValue: 1,
        unit: 'vez'
      });
    }
    setErrors({});
    setShowModal(true);
  };
  const handleDelete = async (habitId: string) => {
    const confirmed = await confirm({ title: 'Excluir hábito', message: 'Tem certeza que deseja excluir este hábito?', confirmLabel: 'Excluir', variant: 'danger' });
    if (!confirmed) return;
    try {
      await disciplineApi.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    } catch (error) {
      console.error('Erro ao excluir hábito:', error);
    }
  };
  const handleSave = async () => {
    try {
      const validData = habitSchema.parse(formData);
      try {
        if (editingHabit) {
          await disciplineApi.updateHabit(editingHabit.id, validData);
        } else {
          await disciplineApi.createHabit(validData);
        }
        setShowModal(false);
        fetchHabits();
      } catch (apiError) {
        console.error('Erro ao salvar hábito:', apiError);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-secondary rounded-md"></div>
          <div className="h-10 w-32 bg-secondary rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-40 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
      </div>);

  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Hábitos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus hábitos e acompanhe suas ofensivas.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium">
          
          <PlusIcon size={18} />
          Novo Hábito
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) =>
        <div
          key={habit.id}
          className="bg-card border border-border rounded-xl p-6 flex flex-col">
          
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-lg">{habit.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground uppercase tracking-wider">
                  {HABIT_TYPES[habit.type as keyof typeof HABIT_TYPES]}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full text-xs font-medium">
                <FlameIcon size={14} className="fill-orange-500" />
                {habit.streak} dias
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <p>
                  {habit.targetValue} {habit.unit}
                </p>
                <p className="text-xs">
                  {FREQUENCIES[habit.frequency as keyof typeof FREQUENCIES]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                onClick={() => handleOpenModal(habit)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors">
                
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)} />
          
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
                </h2>
                <button
                onClick={() => setShowModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ex: Ler 10 páginas" />
                
                  {errors.name &&
                <p className="text-xs text-destructive">{errors.name}</p>
                }
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                    value={formData.type}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                    
                      {Object.entries(HABIT_TYPES).map(([key, label]) =>
                    <option key={key} value={key}>
                          {label}
                        </option>
                    )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequência</label>
                    <select
                    value={formData.frequency}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                    
                      {Object.entries(FREQUENCIES).map(([key, label]) =>
                    <option key={key} value={key}>
                          {label}
                        </option>
                    )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meta (Número)</label>
                    <input
                    type="number"
                    min="1"
                    value={formData.targetValue}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetValue: Number(e.target.value)
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                  
                    {errors.targetValue &&
                  <p className="text-xs text-destructive">
                        {errors.targetValue}
                      </p>
                  }
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Unidade</label>
                    <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                    setFormData({
                      ...formData,
                      unit: e.target.value
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ex: páginas, min" />
                  
                    {errors.unit &&
                  <p className="text-xs text-destructive">{errors.unit}</p>
                  }
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/20">
                <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                
                  Cancelar
                </button>
                <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}