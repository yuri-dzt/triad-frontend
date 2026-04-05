import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, XIcon } from 'lucide-react';
import { z } from 'zod';
import { Exercise } from '../../types';
import { cn } from '../../lib/utils';
import { workoutApi } from '../../lib/api';
import { useConfirm } from '../../components/ConfirmDialog';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  muscleGroup: z.string().min(1, 'Grupo muscular é obrigatório'),
  equipment: z.string().optional(),
  description: z.string().optional()
});
const MUSCLE_GROUPS = [
  'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos'
];

export function ExerciseCatalogPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const confirm = useConfirm();

  useEffect(() => { fetchExercises(); }, []);
  useEffect(() => { filterExercises(); }, [exercises, searchQuery, selectedMuscleGroup]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const data = await workoutApi.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;
    if (searchQuery) {
      filtered = filtered.filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedMuscleGroup !== 'Todos') {
      filtered = filtered.filter((ex) => ex.muscleGroup === selectedMuscleGroup);
    }
    setFilteredExercises(filtered);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({ title: 'Excluir exercício', message: 'Tem certeza que deseja excluir este exercício?', confirmLabel: 'Excluir', variant: 'danger' });
    if (!confirmed) return;
    try {
      await workoutApi.deleteExercise(id);
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md"></div>
        <div className="h-12 bg-card rounded-md border border-border"></div>
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-card rounded-lg border border-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Catálogo de Exercícios</h1>
        <button
          onClick={() => { setEditingExercise(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <PlusIcon size={18} />
          Novo Exercício
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar exercícios..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group} onClick={() => setSelectedMuscleGroup(group)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedMuscleGroup === group
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}>
              {group}
            </button>
          ))}
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">Nenhum exercício encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{exercise.muscleGroup}</span>
                    {exercise.equipment && (
                      <>
                        <span>•</span>
                        <span>{exercise.equipment}</span>
                      </>
                    )}
                  </div>
                  {exercise.description && (
                    <p className="text-sm text-muted-foreground mt-2">{exercise.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <EditIcon size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ExerciseModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingExercise(null); }}
        onSuccess={fetchExercises}
        editingExercise={editingExercise}
      />
    </div>
  );
}

function ExerciseModal({
  isOpen, onClose, onSuccess, editingExercise
}: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; editingExercise: Exercise | null;
}) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Peito');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MUSCLE_GROUPS = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Glúteos'];

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
      setMuscleGroup(editingExercise.muscleGroup);
      setEquipment(editingExercise.equipment || '');
      setDescription(editingExercise.description || '');
    } else {
      setName(''); setMuscleGroup('Peito'); setEquipment(''); setDescription('');
    }
  }, [editingExercise, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      exerciseSchema.parse({ name, muscleGroup, equipment, description });
      setIsSubmitting(true);
      try {
        if (editingExercise) {
          await workoutApi.updateExercise(editingExercise.id, {
            name, muscleGroup, equipment: equipment || undefined, description: description || undefined
          });
        } else {
          await workoutApi.createExercise({
            name, muscleGroup, equipment: equipment || undefined, description: description || undefined
          });
        }
        onSuccess();
        onClose();
      } catch (apiError) {
        console.error('Failed to save exercise:', apiError);
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
            {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <XIcon size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Supino Reto" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Grupo Muscular</label>
            <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              {MUSCLE_GROUPS.map((group) => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Equipamento (opcional)</label>
            <input type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Barra, Halteres, Máquina..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              rows={3} placeholder="Observações sobre o exercício..." />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : editingExercise ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
