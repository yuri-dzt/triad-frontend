// Auth & Users
export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Workout (Treino)
export interface WorkoutPlan {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number | null;
}

export interface WorkoutPlanDay {
  id: string;
  organizationId: string;
  workoutPlanId: string;
  dayOfWeek: number; // 0=dom, 1=seg ... 6=sab
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number | null;
}

export interface Exercise {
  id: string;
  organizationId: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  description: string | null;
  createdAt: number;
  updatedAt: number | null;
}

export interface WorkoutPlanExercise {
  id: string;
  organizationId: string;
  workoutPlanDayId: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  notes: string | null;
  order: number;
  createdAt: number;
  updatedAt: number | null;
  exercise?: Exercise;
}

export type ScheduledWorkoutStatus =
  'PENDING' |
  'DONE' |
  'RESCHEDULED' |
  'SKIPPED';

export interface ScheduledWorkout {
  id: string;
  organizationId: string;
  userId: string;
  workoutPlanDayId: string;
  scheduledDate: number;
  originalDate: number;
  status: ScheduledWorkoutStatus;
  createdAt: number;
  updatedAt: number | null;
  workoutPlanDay?: WorkoutPlanDay;
}

export interface WorkoutSession {
  id: string;
  organizationId: string;
  userId: string;
  scheduledWorkoutId: string | null;
  workoutPlanDayId: string | null;
  date: number;
  startedAt: number | null;
  finishedAt: number | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
  exercises?: WorkoutSessionExercise[];
}

export interface WorkoutSet {
  id: string;
  organizationId: string;
  sessionExerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
  restSeconds: number | null;
  rpe: number | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
}

export interface WorkoutSessionExercise {
  id: string;
  organizationId: string;
  workoutSessionId: string;
  exerciseId: string;
  order: number;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
  exercise?: Exercise;
  sets?: WorkoutSet[];
}

// Diet (Dieta)
export interface DietGoal {
  id: string;
  organizationId: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  startsAt: number;
  endsAt: number | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number | null;
}

export interface DietLog {
  id: string;
  organizationId: string;
  userId: string;
  date: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
  entries?: DietLogEntry[];
}

export type MealType =
  'BREAKFAST' |
  'LUNCH' |
  'SNACK' |
  'DINNER' |
  'PRE_WORKOUT' |
  'POST_WORKOUT' |
  'OTHER';

export interface DietLogEntry {
  id: string;
  organizationId: string;
  dietLogId: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  createdAt: number;
  updatedAt: number | null;
}

export interface WaterLog {
  id: string;
  organizationId: string;
  userId: string;
  date: number;
  amountMl: number;
  createdAt: number;
  updatedAt: number | null;
}

// Discipline (Disciplina)
export type HabitType =
  'READING' |
  'STUDY' |
  'ROUTINE' |
  'HEALTH' |
  'FITNESS' |
  'OTHER';
export type HabitFrequency = 'DAILY' | 'WEEKLY' | 'SPECIFIC_DAYS';

export interface Habit {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  type: HabitType;
  frequency: HabitFrequency;
  specificDays: string | null;
  targetValue: number;
  unit: string;
  bookId: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number | null;
}

export interface HabitLog {
  id: string;
  organizationId: string;
  habitId: string;
  userId: string;
  date: number;
  value: number;
  isCompleted: boolean;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
  habit?: Habit;
}

export interface Book {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  author: string;
  totalPages: number;
  isActive: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  createdAt: number;
  updatedAt: number | null;
}

export interface ReadingLog {
  id: string;
  organizationId: string;
  userId: string;
  bookId: string;
  habitId: string | null;
  date: number;
  pagesRead: number;
  fromPage: number;
  toPage: number;
  notes: string | null;
  createdAt: number;
  updatedAt: number | null;
}

// Dashboard
export interface DashboardToday {
  workout: {
    scheduled: ScheduledWorkout | null;
    session: WorkoutSession | null;
  };
  diet: {
    goal: DietGoal | null;
    log: DietLog | null;
    water: number;
  };
  habits: {
    total: number;
    completed: number;
    logs: HabitLog[];
  };
}

export interface WeekSummary {
  workouts: {
    completed: number;
    total: number;
  };
  dietAdherence: number;
  habitCompletionRate: number;
}
