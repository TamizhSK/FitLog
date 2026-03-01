import type { WorkoutLog } from '$lib/types/workout';

export function calculateStreak(workouts: WorkoutLog[]): number {
	if (workouts.length === 0) return 0;

	const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse();
	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

	// Streak must include today or yesterday
	if (dates[0] !== today && dates[0] !== yesterday) return 0;

	let streak = 1;
	for (let i = 1; i < dates.length; i++) {
		const prev = new Date(dates[i - 1]);
		const curr = new Date(dates[i]);
		const diff = (prev.getTime() - curr.getTime()) / 86400000;
		if (diff === 1) {
			streak++;
		} else {
			break;
		}
	}
	return streak;
}

export function calculateTotalVolume(workout: WorkoutLog): number {
	return workout.exercises.reduce((total, ex) => {
		return (
			total +
			ex.sets
				.filter((s) => s.completed)
				.reduce((setTotal, s) => setTotal + (s.weight ?? 0) * s.reps, 0)
		);
	}, 0);
}

export function calculateWeeklyStats(workouts: WorkoutLog[]) {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - now.getDay());
	weekStart.setHours(0, 0, 0, 0);
	const weekStartStr = weekStart.toISOString().split('T')[0];

	const thisWeek = workouts.filter((w) => w.date >= weekStartStr);

	const totalVolume = thisWeek.reduce((sum, w) => sum + calculateTotalVolume(w), 0);
	const totalDuration = thisWeek.reduce((sum, w) => sum + w.duration, 0);

	// Most trained body part (would need exercise data to determine)
	return {
		workoutCount: thisWeek.length,
		totalVolume,
		totalDuration
	};
}

export function formatVolume(volume: number, unit: 'kg' | 'lbs' = 'kg'): string {
	if (volume >= 1000) {
		return `${(volume / 1000).toFixed(1)}k ${unit}`;
	}
	return `${Math.round(volume)} ${unit}`;
}
