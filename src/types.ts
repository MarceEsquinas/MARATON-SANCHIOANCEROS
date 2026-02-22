export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface Marathon {
  id: string;
  name: string;
  date: string;
}

export interface Workout {
  id: string;
  marathon_id: string;
  week_number: number;
  title: string;
  description: string;
}

export interface UserProgress {
  id?: string;
  user_id: string;
  workout_id: string;
  completed: boolean;
  sensations: string;
  discomfort: string;
}

export interface UserMetric {
  user_id: string;
  email: string;
  total_workouts: number;
  completed_workouts: number;
  percentage: number;
}
