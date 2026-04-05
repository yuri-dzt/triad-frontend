import { AuthTokens, DashboardToday, WeekSummary } from '../types';

const BASE_URL = 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(
  public status: number,
  message: string)
  {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const tokensStr = localStorage.getItem('triad_tokens');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (tokensStr) {
    const tokens: AuthTokens = JSON.parse(tokensStr);
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('triad_tokens');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || errorData.message || 'An error occurred'
    );
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const authApi = {
  login: (data: any) =>
  fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (data: any) =>
  fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export const dashboardApi = {
  getToday: (): Promise<DashboardToday> => fetchWithAuth('/dashboard/today'),
  getWeekSummary: (): Promise<WeekSummary> =>
  fetchWithAuth('/dashboard/week-summary')
};

export const workoutApi = {
  // Workout Plans
  getPlans: () => fetchWithAuth('/workout-plans'),
  getPlan: (id: string) => fetchWithAuth(`/workout-plans/${id}`),
  createPlan: (data: {name: string;description?: string;}) =>
  fetchWithAuth('/workout-plans', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePlan: (
  id: string,
  data: {name?: string;description?: string;isActive?: boolean;}) =>

  fetchWithAuth(`/workout-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlan: (id: string) =>
  fetchWithAuth(`/workout-plans/${id}`, { method: 'DELETE' }),

  // Plan Days
  getPlanDays: (planId: string) =>
  fetchWithAuth(`/workout-plans/${planId}/days`),
  createPlanDay: (planId: string, data: {dayOfWeek: number;name: string;}) =>
  fetchWithAuth(`/workout-plans/${planId}/days`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePlanDay: (id: string, data: {dayOfWeek?: number;name?: string;}) =>
  fetchWithAuth(`/workout-plan-days/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlanDay: (id: string) =>
  fetchWithAuth(`/workout-plan-days/${id}`, { method: 'DELETE' }),

  // Plan Day Exercises
  addExerciseToPlanDay: (
  dayId: string,
  data: {
    exerciseId: string;
    sets: number;
    reps: string;
    restSeconds?: number;
    notes?: string;
  }) =>

  fetchWithAuth(`/workout-plan-days/${dayId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePlanExercise: (
  id: string,
  data: {
    sets?: number;
    reps?: string;
    restSeconds?: number;
    notes?: string;
    order?: number;
  }) =>

  fetchWithAuth(`/workout-plan-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlanExercise: (id: string) =>
  fetchWithAuth(`/workout-plan-exercises/${id}`, { method: 'DELETE' }),

  // Exercises
  getExercises: () => fetchWithAuth('/exercises'),
  createExercise: (data: {
    name: string;
    muscleGroup: string;
    equipment?: string;
    description?: string;
  }) =>
  fetchWithAuth('/exercises', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateExercise: (
  id: string,
  data: {
    name?: string;
    muscleGroup?: string;
    equipment?: string;
    description?: string;
  }) =>

  fetchWithAuth(`/exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteExercise: (id: string) =>
  fetchWithAuth(`/exercises/${id}`, { method: 'DELETE' }),

  // Scheduled Workouts
  getScheduledWorkouts: (week: string) =>
  fetchWithAuth(`/scheduled-workouts?week=${week}`),
  generateWeek: (data: {weekStartDate: number;}) =>
  fetchWithAuth('/scheduled-workouts/generate-week', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  reschedule: (id: string, data: {newDate: number;}) =>
  fetchWithAuth(`/scheduled-workouts/${id}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  skip: (id: string) =>
  fetchWithAuth(`/scheduled-workouts/${id}/skip`, { method: 'PUT' }),
  complete: (id: string) =>
  fetchWithAuth(`/scheduled-workouts/${id}/complete`, { method: 'PUT' }),

  // Workout Sessions
  createSession: (data: {
    scheduledWorkoutId?: string;
    workoutPlanDayId?: string;
    date: number;
    notes?: string;
  }) =>
  fetchWithAuth('/workout-sessions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getSession: (id: string) => fetchWithAuth(`/workout-sessions/${id}`),
  updateSession: (id: string, data: {notes?: string;finishedAt?: number;}) =>
  fetchWithAuth(`/workout-sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  addSessionExercise: (
  sessionId: string,
  data: {exerciseId: string;order: number;}) =>

  fetchWithAuth(`/workout-sessions/${sessionId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  addSet: (
  exerciseId: string,
  data: {
    setNumber: number;
    reps: number;
    weight: number;
    restSeconds?: number;
    rpe?: number;
  }) =>

  fetchWithAuth(`/workout-session-exercises/${exerciseId}/sets`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSet: (
  id: string,
  data: {
    reps?: number;
    weight?: number;
    restSeconds?: number;
    rpe?: number;
  }) =>

  fetchWithAuth(`/workout-sets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Stats
  getExerciseHistory: (id: string) => fetchWithAuth(`/exercises/${id}/history`),
  getExercisePR: (id: string) => fetchWithAuth(`/exercises/${id}/pr`),
  getWeeklyStats: () => fetchWithAuth('/workout-stats/weekly'),
  getConsistency: () => fetchWithAuth('/workout-stats/consistency')
};

export const dietApi = {
  // Goals
  getActiveGoal: () => fetchWithAuth('/diet-goals/active'),
  createGoal: (data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  }) =>
  fetchWithAuth('/diet-goals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateGoal: (
  id: string,
  data: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    waterMl?: number;
  }) =>

  fetchWithAuth(`/diet-goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Logs
  getLogByDate: (date: number) => fetchWithAuth(`/diet-logs?date=${date}`),
  createLog: (data: {date: number;}) =>
  fetchWithAuth('/diet-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateLog: (id: string, data: any) =>
  fetchWithAuth(`/diet-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Entries
  addEntry: (
  logId: string,
  data: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
  }) =>

  fetchWithAuth(`/diet-logs/${logId}/entries`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateEntry: (
  id: string,
  data: {
    name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    mealType?: string;
  }) =>

  fetchWithAuth(`/diet-log-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteEntry: (id: string) =>
  fetchWithAuth(`/diet-log-entries/${id}`, { method: 'DELETE' }),

  // Water
  addWater: (data: {date: number;amountMl: number;}) =>
  fetchWithAuth('/water-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getWaterByDate: (date: number) => fetchWithAuth(`/water-logs?date=${date}`),

  // Stats
  getWeeklyStats: () => fetchWithAuth('/diet-stats/weekly'),
  getGoalAdherence: () => fetchWithAuth('/diet-stats/goal-adherence')
};

export const disciplineApi = {
  // Habits
  getHabits: () => fetchWithAuth('/habits'),
  createHabit: (data: {
    name: string;
    type: string;
    frequency: string;
    specificDays?: string;
    targetValue: number;
    unit: string;
    bookId?: string;
  }) =>
  fetchWithAuth('/habits', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateHabit: (id: string, data: any) =>
  fetchWithAuth(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteHabit: (id: string) =>
  fetchWithAuth(`/habits/${id}`, { method: 'DELETE' }),

  // Habit Logs
  getDailyChecklist: (date: number) =>
  fetchWithAuth(`/habit-stats/daily-checklist?date=${date}`),
  getHabitLogs: (date: number) => fetchWithAuth(`/habit-logs?date=${date}`),
  logHabit: (data: {
    habitId: string;
    date: number;
    value: number;
    isCompleted: boolean;
    notes?: string;
  }) =>
  fetchWithAuth('/habit-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateHabitLog: (id: string, data: any) =>
  fetchWithAuth(`/habit-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Habit Stats
  getHabitStreak: (habitId: string) =>
  fetchWithAuth(`/habits/${habitId}/streak`),
  getHabitConsistency: (habitId: string) =>
  fetchWithAuth(`/habits/${habitId}/consistency`),

  // Books
  getBooks: () => fetchWithAuth('/books'),
  createBook: (data: {title: string;author: string;totalPages: number;}) =>
  fetchWithAuth('/books', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateBook: (id: string, data: any) =>
  fetchWithAuth(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  getBookProgress: (bookId: string) =>
  fetchWithAuth(`/books/${bookId}/progress`),

  // Reading Logs
  getReadingLogs: (bookId?: string, date?: number) => {
    const params = new URLSearchParams();
    if (bookId) params.append('bookId', bookId);
    if (date) params.append('date', date.toString());
    const queryString = params.toString();
    return fetchWithAuth(`/reading-logs${queryString ? `?${queryString}` : ''}`);
  },
  createReadingLog: (data: {
    bookId: string;
    date: number;
    pagesRead: number;
    fromPage: number;
    toPage: number;
    notes?: string;
  }) =>
  fetchWithAuth('/reading-logs', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};