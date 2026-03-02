import { getDB } from './index';
import type { WorkoutLog } from '$lib/types/workout';

export async function saveWorkout(workout: WorkoutLog): Promise<void> {
	const db = await getDB();
	await db.put('workouts', workout);
}

export async function getWorkout(id: string): Promise<WorkoutLog | undefined> {
	const db = await getDB();
	return db.get('workouts', id);
}

export async function getWorkoutsByDate(date: string): Promise<WorkoutLog[]> {
	const db = await getDB();
	return db.getAllFromIndex('workouts', 'by-date', date);
}

export async function getAllWorkouts(): Promise<WorkoutLog[]> {
	const db = await getDB();
	const all = await db.getAll('workouts');
	return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteWorkout(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('workouts', id);
}

/**
 * Calculate workout intensity score based on volume, reps, and duration.
 * Returns a weighted score that represents workout effort.
 */
function calculateWorkoutScore(workout: WorkoutLog): number {
	let score = 0;
	
	for (const exercise of workout.exercises) {
		for (const set of exercise.sets) {
			if (!set.completed) continue;
			
			// Weight-based exercises: weight × reps
			if (set.weight && set.weight > 0) {
				score += set.weight * set.reps;
			}
			// Bodyweight or duration-based: reps or duration
			else if (set.duration && set.duration > 0) {
				// Duration exercises (planks, etc.): 1 point per second
				score += set.duration;
			} else {
				// Bodyweight reps: 5 points per rep (arbitrary baseline)
				score += set.reps * 5;
			}
		}
	}
	
	return score;
}

/**
 * Get workout dates map with intensity scores instead of just set counts.
 * Returns Map<date, score> where score represents workout effort.
 */
export async function getWorkoutDatesMap(): Promise<Map<string, number>> {
	const db = await getDB();
	const all = await db.getAll('workouts');
	const map = new Map<string, number>();
	
	for (const workout of all) {
		const currentScore = map.get(workout.date) ?? 0;
		const workoutScore = calculateWorkoutScore(workout);
		map.set(workout.date, currentScore + workoutScore);
	}
	
	return map;
}

export async function getLastWorkoutForExercise(
	exerciseId: string
): Promise<WorkoutLog | undefined> {
	const db = await getDB();
	const all = await db.getAll('workouts');
	// Sort by date desc, find first containing this exercise
	const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
	return sorted.find((w) => w.exercises.some((e) => e.exerciseId === exerciseId));
}
