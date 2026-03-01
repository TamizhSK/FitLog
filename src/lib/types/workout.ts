export interface WorkoutLog {
	id: string;
	date: string; // ISO date "2026-02-28"
	startTime: string; // ISO datetime
	endTime: string; // ISO datetime
	duration: number; // Total seconds
	exercises: WorkoutExerciseLog[];
	notes?: string;
}

export interface WorkoutExerciseLog {
	exerciseId: string;
	exerciseName: string;
	sets: SetLog[];
}

export interface SetLog {
	setNumber: number;
	reps: number;
	weight?: number; // in kg or lbs based on user preference
	duration?: number; // for timed exercises (planks, etc.), in seconds
	completed: boolean;
	restTime?: number; // rest taken after this set, in seconds
}

export interface UserPreferences {
	theme: 'light' | 'dark' | 'system';
	weightUnit: 'kg' | 'lbs';
	restTimerDefault: number; // Default rest time in seconds
	soundEnabled: boolean;
	vibrationEnabled: boolean;
	userName?: string;
	onboardingComplete?: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
	theme: 'system',
	weightUnit: 'kg',
	restTimerDefault: 60,
	soundEnabled: true,
	vibrationEnabled: true,
	onboardingComplete: false
};
