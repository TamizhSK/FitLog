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

export async function getWorkoutDatesMap(): Promise<Map<string, number>> {
	const db = await getDB();
	const all = await db.getAll('workouts');
	const map = new Map<string, number>();
	for (const w of all) {
		const count = map.get(w.date) ?? 0;
		const exercises = w.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.completed).length, 0);
		map.set(w.date, count + exercises);
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
