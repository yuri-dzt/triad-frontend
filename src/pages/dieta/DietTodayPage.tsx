import React, { useEffect, useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  XIcon,
  DropletsIcon,
  TrashIcon } from
'lucide-react';
import { z } from 'zod';
import { DietGoal, DietLog, DietLogEntry, MealType } from '../../types';
import { cn } from '../../lib/utils';
import { dietApi } from '../../lib/api';
import { useConfirm } from '../../components/ConfirmDialog';
const MEAL_TYPES: {
  value: MealType;
  label: string;
}[] = [
{
  value: 'BREAKFAST',
  label: 'Café da Manhã'
},
{
  value: 'LUNCH',
  label: 'Almoço'
},
{
  value: 'SNACK',
  label: 'Lanche'
},
{
  value: 'DINNER',
  label: 'Jantar'
},
{
  value: 'PRE_WORKOUT',
  label: 'Pré-Treino'
},
{
  value: 'POST_WORKOUT',
  label: 'Pós-Treino'
},
{
  value: 'OTHER',
  label: 'Outro'
}];

const entrySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  calories: z.number().min(0, 'Deve ser maior ou igual a 0'),
  protein: z.number().min(0, 'Deve ser maior ou igual a 0'),
  carbs: z.number().min(0, 'Deve ser maior ou igual a 0'),
  fat: z.number().min(0, 'Deve ser maior ou igual a 0'),
  mealType: z.enum([
  'BREAKFAST',
  'LUNCH',
  'SNACK',
  'DINNER',
  'PRE_WORKOUT',
  'POST_WORKOUT',
  'OTHER']
  )
});
export function DietTodayPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [goal, setGoal] = useState<DietGoal | null>(null);
  const [log, setLog] = useState<DietLog | null>(null);
  const [entries, setEntries] = useState<DietLogEntry[]>([]);
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const confirm = useConfirm();
  useEffect(() => {
    fetchData();
  }, [currentDate]);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const dateTimestamp = new Date(currentDate).setHours(0, 0, 0, 0);
      const [goalData, logData, waterData] = await Promise.all([
        dietApi.getActiveGoal().catch(() => null),
        dietApi.getLogByDate(dateTimestamp).catch(() => null),
        dietApi.getWaterByDate(dateTimestamp).catch(() => null)
      ]);
      setGoal(goalData);
      if (logData) {
        setLog(logData);
        setEntries(logData.entries || []);
      } else {
        setLog(null);
        setEntries([]);
      }
      // waterData is an array of WaterLog objects
      const totalWater = Array.isArray(waterData) ? waterData.reduce((sum: number, w: any) => sum + w.amountMl, 0) : 0;
      setWaterConsumed(totalWater);
    } catch (error) {
      console.error('Erro ao carregar dados da dieta:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePrevDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));
  const handleDeleteEntry = async (entryId: string) => {
    const confirmed = await confirm({ title: 'Remover alimento', message: 'Remover este alimento do registro?', confirmLabel: 'Remover', variant: 'danger' });
    if (!confirmed) return;
    try {
      await dietApi.deleteEntry(entryId);
      fetchData();
    } catch (error) {
      console.error('Erro ao remover alimento:', error);
    }
  };

  const handleAddWater = async () => {
    try {
      const todayTimestamp = new Date(currentDate).setHours(0, 0, 0, 0);
      await dietApi.addWater({ date: todayTimestamp, amountMl: 250 });
      setWaterConsumed((prev) => prev + 250);
    } catch (error) {
      console.error('Erro ao adicionar água:', error);
    }
  };
  const groupedEntries = MEAL_TYPES.map((type) => ({
    ...type,
    entries: entries.filter((e) => e.mealType === type.value),
    totalCalories: entries.
    filter((e) => e.mealType === type.value).
    reduce((sum, e) => sum + e.calories, 0)
  })).filter((group) => group.entries.length > 0);
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded-md mx-auto"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) =>
          <div
            key={i}
            className="h-24 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
        <div className="h-32 bg-card rounded-xl border border-border"></div>
        <div className="h-64 bg-card rounded-xl border border-border"></div>
      </div>);

  }
  return (
    <div className="space-y-6 pb-20">
      {/* Date Header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-secondary rounded-md transition-colors">
          
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="text-lg font-medium capitalize">
          {format(currentDate, "EEEE, d 'de' MMMM", {
            locale: ptBR
          })}
        </h2>
        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-secondary rounded-md transition-colors">
          
          <ChevronRightIcon size={20} />
        </button>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MacroCard
          label="Calorias"
          consumed={log?.totalCalories || 0}
          goal={goal?.calories || 0}
          unit="kcal"
          colorClass="bg-primary" />
        
        <MacroCard
          label="Proteína"
          consumed={log?.totalProtein || 0}
          goal={goal?.protein || 0}
          unit="g"
          colorClass="bg-blue-400" />
        
        <MacroCard
          label="Carboidratos"
          consumed={log?.totalCarbs || 0}
          goal={goal?.carbs || 0}
          unit="g"
          colorClass="bg-amber-400" />
        
        <MacroCard
          label="Gordura"
          consumed={log?.totalFat || 0}
          goal={goal?.fat || 0}
          unit="g"
          colorClass="bg-rose-400" />
        
      </div>

      {/* Water */}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <DropletsIcon size={24} />
          </div>
          <div>
            <h3 className="font-medium">Água</h3>
            <p className="text-sm text-muted-foreground">
              {waterConsumed} / {goal?.waterMl || 2000} ml
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({
            length: Math.ceil((goal?.waterMl || 2000) / 250)
          }).map((_, i) =>
          <div
            key={i}
            className={cn(
              'h-8 w-6 rounded-t-md rounded-b-sm border-2 transition-colors',
              i < Math.floor(waterConsumed / 250) ?
              'border-blue-400 bg-blue-400/20' :
              'border-border bg-transparent'
            )} />

          )}
          <button
            onClick={handleAddWater}
            className="ml-2 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
            
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {groupedEntries.length > 0 ?
        groupedEntries.map((group) =>
        <div
          key={group.value}
          className="bg-card border border-border rounded-xl overflow-hidden">
          
              <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">{group.label}</h3>
                <span className="text-sm font-medium">
                  {group.totalCalories} kcal
                </span>
              </div>
              <div className="divide-y divide-border">
                {group.entries.map((entry) =>
            <div
              key={entry.id}
              className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
              
                    <div>
                      <p className="font-medium text-sm">{entry.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        P: {entry.protein}g • C: {entry.carbs}g • G: {entry.fat}
                        g
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {entry.calories} kcal
                      </span>
                      <button onClick={() => handleDeleteEntry(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
            )}
              </div>
            </div>
        ) :

        <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <PlusIcon size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              Nenhum alimento registrado
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Comece a registrar suas refeições de hoje para acompanhar seus
              macros.
            </p>
          </div>
        }
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setShowAddModal(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105">
          
          <PlusIcon size={24} />
        </button>
      </div>

      <AddFoodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData} />
      
    </div>);

}
function MacroCard({
  label,
  consumed,
  goal,
  unit,
  colorClass






}: {label: string;consumed: number;goal: number;unit: string;colorClass: string;}) {
  const percentage = goal > 0 ? Math.min(100, consumed / goal * 100) : 0;
  const isOver = consumed > goal && goal > 0;
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end gap-1 mb-3">
        <span className="text-xl font-semibold">{consumed}</span>
        <span className="text-xs text-muted-foreground mb-1">
          / {goal} {unit}
        </span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full',
            isOver ? 'bg-destructive' : colorClass
          )}
          style={{
            width: `${percentage}%`
          }} />
        
      </div>
    </div>);

}
function AddFoodModal({
  isOpen,
  onClose,
  onSuccess




}: {isOpen: boolean;onClose: () => void;onSuccess: () => void;}) {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    mealType: 'BREAKFAST' as MealType
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      entrySchema.parse({
        name: formData.name,
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        mealType: formData.mealType
      });
      setIsSubmitting(true);
      try {
        const todayTimestamp = new Date().setHours(0, 0, 0, 0);
        // Get or create today's log
        let currentLog = await dietApi.getLogByDate(todayTimestamp).catch(() => null);
        if (!currentLog) {
          currentLog = await dietApi.createLog({ date: todayTimestamp });
        }
        await dietApi.addEntry(currentLog.id, {
          name: formData.name,
          calories: Number(formData.calories),
          protein: Number(formData.protein),
          carbs: Number(formData.carbs),
          fat: Number(formData.fat),
          mealType: formData.mealType
        });
        onSuccess();
        onClose();
        setFormData({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          mealType: 'BREAKFAST'
        });
      } catch (apiError) {
        console.error('Erro ao adicionar alimento:', apiError);
      } finally {
        setIsSubmitting(false);
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
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose} />
      
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
        className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Adicionar Alimento</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground">
            
            <XIcon size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Alimento</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
              }
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Arroz Branco" />
            
            {errors.name &&
            <p className="text-xs text-destructive">{errors.name}</p>
            }
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calorias (kcal)</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  calories: e.target.value
                })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              
              {errors.calories &&
              <p className="text-xs text-destructive">{errors.calories}</p>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proteína (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  protein: e.target.value
                })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              
              {errors.protein &&
              <p className="text-xs text-destructive">{errors.protein}</p>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Carboidratos (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  carbs: e.target.value
                })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              
              {errors.carbs &&
              <p className="text-xs text-destructive">{errors.carbs}</p>
              }
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gordura (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  fat: e.target.value
                })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              
              {errors.fat &&
              <p className="text-xs text-destructive">{errors.fat}</p>
              }
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Refeição</label>
            <select
              value={formData.mealType}
              onChange={(e) =>
              setFormData({
                ...formData,
                mealType: e.target.value as MealType
              })
              }
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              
              {MEAL_TYPES.map((type) =>
              <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              )}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors">
              
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>);

}