import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  DumbbellIcon
} from 'lucide-react';
import { z } from 'zod';
import {
  WorkoutPlan,
  WorkoutPlanDay,
  Exercise
} from '../../types';
import { workoutApi } from '../../lib/api';
import { useConfirm } from '../../components/ConfirmDialog';

const planSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
});
const daySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  name: z.string().min(1, 'Nome é obrigatório')
});
const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planDays, setPlanDays] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editingDay, setEditingDay] = useState<any | null>(null);
  const [editingDayPlanId, setEditingDayPlanId] = useState<string | null>(null);
  const confirm = useConfirm();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const data = await workoutApi.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlanDays = async (planId: string) => {
    try {
      const data = await workoutApi.getPlanDays(planId);
      setPlanDays(prev => ({ ...prev, [planId]: data }));
    } catch (error) {
      console.error('Failed to load plan days:', error);
      setPlanDays(prev => ({ ...prev, [planId]: [] }));
    }
  };

  const handleExpandPlan = (planId: string) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
    } else {
      setExpandedPlan(planId);
      fetchPlanDays(planId);
    }
  };

  const handleDeletePlan = async (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    const confirmed = await confirm({ title: 'Excluir plano', message: 'Tem certeza que deseja excluir este plano e todos os dias vinculados?', confirmLabel: 'Excluir', variant: 'danger' });
    if (!confirmed) return;
    try {
      await workoutApi.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      if (expandedPlan === planId) setExpandedPlan(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleEditPlan = (e: React.MouseEvent, plan: WorkoutPlan) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setShowCreateModal(true);
  };

  const handleDeleteDay = async (dayId: string, planId: string) => {
    const confirmed = await confirm({ title: 'Excluir dia', message: 'Tem certeza que deseja excluir este dia do plano?', confirmLabel: 'Excluir', variant: 'danger' });
    if (!confirmed) return;
    try {
      await workoutApi.deletePlanDay(dayId);
      fetchPlanDays(planId);
    } catch (error) {
      console.error('Failed to delete day:', error);
    }
  };

  const handleEditDay = (day: any, planId: string) => {
    setEditingDay(day);
    setEditingDayPlanId(planId);
    setShowAddDayModal(true);
  };

  const handleAddDay = (planId: string) => {
    setEditingDay(null);
    setEditingDayPlanId(null);
    setSelectedPlanId(planId);
    setShowAddDayModal(true);
  };

  const handleDeleteExercise = async (exerciseId: string, planId: string) => {
    const confirmed = await confirm({ title: 'Remover exercício', message: 'Remover este exercício do dia?', confirmLabel: 'Remover', variant: 'danger' });
    if (!confirmed) return;
    try {
      await workoutApi.deletePlanExercise(exerciseId);
      fetchPlanDays(planId);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md"></div>
        <div className="grid gap-4">
          <div className="h-32 bg-card rounded-xl border border-border"></div>
          <div className="h-32 bg-card rounded-xl border border-border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Planos de Treino
        </h1>
        <button
          onClick={() => { setEditingPlan(null); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <PlusIcon size={18} />
          Novo Plano
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">
            Nenhum plano de treino criado ainda.
          </p>
          <button
            onClick={() => { setEditingPlan(null); setShowCreateModal(true); }}
            className="mt-4 text-primary hover:text-primary/80 transition-colors">
            Criar seu primeiro plano
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-card border border-border rounded-xl overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleExpandPlan(plan.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium">{plan.name}</h3>
                      {plan.isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                          Ativo
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {planDays[plan.id]?.length || 0} dias configurados
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditPlan(e, plan)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDeletePlan(e, plan.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <TrashIcon size={16} />
                    </button>
                    <button className="p-2 text-muted-foreground">
                      {expandedPlan === plan.id ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedPlan === plan.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Dias da Semana
                        </h4>
                        <button
                          onClick={() => handleAddDay(plan.id)}
                          className="text-sm text-primary hover:text-primary/80 transition-colors">
                          + Adicionar Dia
                        </button>
                      </div>

                      {planDays[plan.id]?.length > 0 ? (
                        <div className="space-y-3">
                          {planDays[plan.id]
                            .sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek)
                            .map((day: any) => (
                              <div
                                key={day.id}
                                className="p-4 bg-background border border-border rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{day.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {DAYS_OF_WEEK[day.dayOfWeek]}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEditDay(day, plan.id)}
                                      className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                      <EditIcon size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDay(day.id, plan.id)}
                                      className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                      <TrashIcon size={16} />
                                    </button>
                                  </div>
                                </div>

                                {/* Exercícios do dia */}
                                {day.exercises && day.exercises.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                                    {day.exercises.map((ex: any) => (
                                      <div key={ex.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <DumbbellIcon size={14} className="text-muted-foreground" />
                                          <span>{ex.exercise?.name || 'Exercício'}</span>
                                          <span className="text-muted-foreground">
                                            {ex.sets}x {ex.reps}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => handleDeleteExercise(ex.id, plan.id)}
                                          className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                                          <TrashIcon size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <AddExerciseToDay dayId={day.id} planId={plan.id} onSuccess={() => fetchPlanDays(plan.id)} />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Nenhum dia configurado ainda
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingPlan(null); }}
        onSuccess={fetchPlans}
        editingPlan={editingPlan}
      />

      <AddDayModal
        isOpen={showAddDayModal}
        onClose={() => { setShowAddDayModal(false); setEditingDay(null); setEditingDayPlanId(null); }}
        planId={editingDayPlanId || selectedPlanId}
        onSuccess={() => {
          const pid = editingDayPlanId || selectedPlanId;
          if (pid) fetchPlanDays(pid);
        }}
        editingDay={editingDay}
      />
    </div>
  );
}

/* ====== Inline Add Exercise Component ====== */
function AddExerciseToDay({ dayId, planId, onSuccess }: { dayId: string; planId: string; onSuccess: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10-12');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadExercises = async () => {
    try {
      const data = await workoutApi.getExercises();
      setExercises(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpen = () => {
    setShowForm(true);
    loadExercises();
  };

  const handleSubmit = async () => {
    if (!selectedExercise) return;
    setIsSubmitting(true);
    try {
      await workoutApi.addExerciseToPlanDay(dayId, {
        exerciseId: selectedExercise,
        sets,
        reps,
      });
      setShowForm(false);
      setSelectedExercise('');
      setSets(3);
      setReps('10-12');
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={handleOpen}
        className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors">
        + Adicionar exercício
      </button>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      <select
        value={selectedExercise}
        onChange={(e) => setSelectedExercise(e.target.value)}
        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">Selecione um exercício</option>
        {exercises.map(ex => (
          <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
        ))}
      </select>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Séries</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            min={1}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Reps</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full px-3 py-1.5 bg-input border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="8-12"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedExercise}
          className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}

/* ====== Create/Edit Plan Modal ====== */
function CreatePlanModal({
  isOpen, onClose, onSuccess, editingPlan
}: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; editingPlan: WorkoutPlan | null;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name);
      setDescription(editingPlan.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editingPlan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      planSchema.parse({ name, description });
      setIsSubmitting(true);
      try {
        if (editingPlan) {
          await workoutApi.updatePlan(editingPlan.id, { name, description: description || undefined });
        } else {
          await workoutApi.createPlan({ name, description: description || undefined });
        }
        onSuccess();
        onClose();
      } catch (apiError) {
        console.error('Failed to save plan:', apiError);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {editingPlan ? 'Editar Plano' : 'Novo Plano de Treino'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Hipertrofia ABC"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={3} placeholder="Descreva o objetivo deste plano..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : editingPlan ? 'Salvar' : 'Criar Plano'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ====== Add/Edit Day Modal ====== */
function AddDayModal({
  isOpen, onClose, planId, onSuccess, editingDay
}: {
  isOpen: boolean; onClose: () => void; planId: string | null; onSuccess: () => void; editingDay: any | null;
}) {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingDay) {
      setDayOfWeek(editingDay.dayOfWeek);
      setName(editingDay.name);
    } else {
      setDayOfWeek(1);
      setName('');
    }
  }, [editingDay, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      daySchema.parse({ dayOfWeek, name });
      setIsSubmitting(true);
      try {
        if (editingDay) {
          await workoutApi.updatePlanDay(editingDay.id, { dayOfWeek, name });
        } else {
          await workoutApi.createPlanDay(planId!, { dayOfWeek, name });
        }
        onSuccess();
        onClose();
      } catch (apiError) {
        console.error('Failed to save day:', apiError);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {editingDay ? 'Editar Dia' : 'Adicionar Dia'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dia da Semana</label>
            <select
              value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {DAYS_OF_WEEK.map((day, index) => (
                <option key={index} value={index}>{day}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Treino</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Peito e Tríceps"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : editingDay ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
