import { getDB } from './index';
import type { WorkoutLog } from '$lib/types/workout';
import { loadExercises, getExerciseById } from '$lib/stores/exercises.svelte';

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
 * Calculate workout intensity score using exercise-type-aware multi-factor composite.
 * Uses exercise JSON data (exerciseType, bodyParts) for type-specific multipliers.
 * Sqrt-compresses volume so heavy lifting doesn't dwarf everything else.
 */
function calculateWorkoutScore(workout: WorkoutLog): number {
	let completedSets = 0;
	let weightVolume = 0;
	let bodyweightReps = 0;
	let durationExSeconds = 0;
	const uniqueExercises = new Set<string>();
	const uniqueBodyParts = new Set<string>();

	for (const exercise of workout.exercises) {
		const exData = getExerciseById(exercise.exerciseId);
		let exType = exData?.exerciseType ?? 'STRENGTH';

		// Handle HIIT workouts which might not be in the regular exercise DB
		if (!exData && exercise.exerciseId.startsWith('hiit-')) {
			exType = 'CARDIO';
		}

		uniqueExercises.add(exercise.exerciseId);
		if (exData) {
			for (const bp of exData.bodyParts) uniqueBodyParts.add(bp);
		}

		for (const set of exercise.sets) {
			if (!set.completed) continue;
			completedSets++;

			if (set.weight && set.weight > 0) {
				// Weightlifting / Olympic lifts: compound heavy movements get a boost
				const multiplier = exType === 'WEIGHTLIFTING' ? 1.2 : 1;
				weightVolume += set.weight * set.reps * multiplier;
			} else if (set.duration && set.duration > 0) {
				// Cardio: sustained effort worth more per second
				// Yoga/Stretching: valuable but lower intensity
				const multiplier = exType === 'CARDIO' ? 1.5
					: (exType === 'YOGA' || exType === 'STRETCHING') ? 0.8
					: 1;
				durationExSeconds += set.duration * multiplier;
			} else {
				// Plyometrics: explosive reps are harder per rep
				const multiplier = exType === 'PLYOMETRICS' ? 1.5 : 1;
				bodyweightReps += set.reps * multiplier;
			}
		}
	}

	if (completedSets === 0) return 0;

	// Effort-based points — intentionally small so trivial workouts
	// don't inflate the heatmap score on their own
	const setPoints = completedSets * 5;

	// Weighted volume: sqrt-scaled to compress range
	const volumePoints = Math.round(Math.sqrt(weightVolume) * 2);

	// Bodyweight reps: scaled by ×10 before sqrt so comparable to weighted volume
	const bwPoints = Math.round(Math.sqrt(bodyweightReps * 10) * 2);

	// Duration exercises (planks, holds, cardio): sqrt-scaled
	const durationExPoints = Math.round(Math.sqrt(durationExSeconds) * 2);

	// Variety bonus — reduced so "showing up" alone doesn't dominate the score
	const exercisePoints = uniqueExercises.size * 5;
	const bodyPartPoints = uniqueBodyParts.size * 3;

	// Workout time spent (minutes)
	const timePoints = Math.round(workout.duration / 60);

	return setPoints + volumePoints + bwPoints + durationExPoints + exercisePoints + bodyPartPoints + timePoints;
}

/**
 * Get workout dates map with intensity scores instead of just set counts.
 * Returns Map<date, score> where score represents workout effort.
 */
export async function getWorkoutDatesMap(): Promise<Map<string, number>> {
	const db = await getDB();
	const all = await db.getAll('workouts');

	// Ensure exercise data is loaded for type-aware scoring
	await loadExercises();

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
