import { getAllWorkouts } from '$lib/db/workouts';
import { getAllFavoriteIds } from '$lib/db/favorites';
import { saveWorkout } from '$lib/db/workouts';
import { addFavorite } from '$lib/db/favorites';
import type { WorkoutLog } from '$lib/types/workout';

interface ExportData {
	version: 1;
	exportedAt: string;
	workouts: WorkoutLog[];
	favoriteIds: string[];
}

export async function exportData(): Promise<void> {
	const workouts = await getAllWorkouts();
	const favoriteIds = await getAllFavoriteIds();

	const data: ExportData = {
		version: 1,
		exportedAt: new Date().toISOString(),
		workouts,
		favoriteIds
	};

	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `fitlog-export-${new Date().toISOString().split('T')[0]}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<{ workouts: number; favorites: number }> {
	const text = await file.text();
	const data: ExportData = JSON.parse(text);

	let workoutCount = 0;
	let favoriteCount = 0;

	if (data.workouts) {
		for (const w of data.workouts) {
			await saveWorkout(w);
			workoutCount++;
		}
	}

	if (data.favoriteIds) {
		for (const id of data.favoriteIds) {
			await addFavorite(id);
			favoriteCount++;
		}
	}

	return { workouts: workoutCount, favorites: favoriteCount };
}
