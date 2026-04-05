import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { DietGoal } from '../../types';
import { dietApi } from '../../lib/api';
const goalSchema = z.object({
  calories: z.
  number().
  min(500, 'Calorias muito baixas').
  max(10000, 'Calorias muito altas'),
  protein: z.number().min(0, 'Deve ser maior ou igual a 0'),
  carbs: z.number().min(0, 'Deve ser maior ou igual a 0'),
  fat: z.number().min(0, 'Deve ser maior ou igual a 0'),
  waterMl: z.number().min(500, 'Meta de água muito baixa')
});
export function DietGoalsPage() {
  const [currentGoal, setCurrentGoal] = useState<DietGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    waterMl: ''
  });
  useEffect(() => {
    fetchGoal();
  }, []);
  const fetchGoal = async () => {
    setIsLoading(true);
    try {
      const goal = await dietApi.getActiveGoal();
      if (goal) {
        setCurrentGoal(goal);
        setFormData({
          calories: goal.calories.toString(),
          protein: goal.protein.toString(),
          carbs: goal.carbs.toString(),
          fat: goal.fat.toString(),
          waterMl: goal.waterMl.toString()
        });
      }
    } catch (error) {
      console.error('Erro ao carregar meta:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    try {
      const data = goalSchema.parse({
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        carbs: Number(formData.carbs),
        fat: Number(formData.fat),
        waterMl: Number(formData.waterMl)
      });
      setIsSubmitting(true);
      try {
        let updatedGoal;
        if (currentGoal?.id) {
          updatedGoal = await dietApi.updateGoal(currentGoal.id, data);
        } else {
          updatedGoal = await dietApi.createGoal(data);
        }
        setCurrentGoal(updatedGoal);
        setSuccessMessage('Meta atualizada com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (apiError) {
        console.error('Erro ao salvar meta:', apiError);
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
  const calculatedCalories =
  Number(formData.protein || 0) * 4 +
  Number(formData.carbs || 0) * 4 +
  Number(formData.fat || 0) * 9;
  const calorieDiff = Number(formData.calories || 0) - calculatedCalories;
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-secondary rounded-md"></div>
        <div className="h-32 bg-card rounded-xl border border-border"></div>
        <div className="h-96 bg-card rounded-xl border border-border"></div>
      </div>);

  }
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Metas de Dieta
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure seus objetivos diários de nutrição.
        </p>
      </div>

      {currentGoal &&
      <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Meta Atual Ativa
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-2xl font-semibold">{currentGoal.calories}</p>
              <p className="text-xs text-muted-foreground">kcal</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-blue-400">
                {currentGoal.protein}g
              </p>
              <p className="text-xs text-muted-foreground">Proteína</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-amber-400">
                {currentGoal.carbs}g
              </p>
              <p className="text-xs text-muted-foreground">Carboidratos</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-400">
                {currentGoal.fat}g
              </p>
              <p className="text-xs text-muted-foreground">Gordura</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-blue-300">
                {currentGoal.waterMl}ml
              </p>
              <p className="text-xs text-muted-foreground">Água</p>
            </div>
          </div>
        </div>
      }

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-medium mb-6">Atualizar Meta</h2>

        {successMessage &&
        <div className="mb-6 p-3 bg-primary/10 border border-primary/20 text-primary rounded-md text-sm">
            {successMessage}
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Calorias Diárias (kcal)
              </label>
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
              <label className="text-sm font-medium">Meta de Água (ml)</label>
              <input
                type="number"
                value={formData.waterMl}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  waterMl: e.target.value
                })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              
              {errors.waterMl &&
              <p className="text-xs text-destructive">{errors.waterMl}</p>
              }
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium mb-4">Macronutrientes (g)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-400">
                  Proteína
                </label>
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
                <label className="text-sm font-medium text-amber-400">
                  Carboidratos
                </label>
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
                <label className="text-sm font-medium text-rose-400">
                  Gordura
                </label>
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
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg border border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Calorias dos Macros: {calculatedCalories} kcal
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Diferença para a meta:{' '}
                <span
                  className={
                  Math.abs(calorieDiff) > 100 ? 'text-amber-500' : ''
                  }>
                  
                  {calorieDiff > 0 ? '+' : ''}
                  {calorieDiff} kcal
                </span>
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
              
              {isSubmitting ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>);

}