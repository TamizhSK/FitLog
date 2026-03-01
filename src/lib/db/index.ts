import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { WorkoutLog } from '$lib/types/workout';

interface FitLogDB extends DBSchema {
	workouts: {
		key: string;
		value: WorkoutLog;
		indexes: {
			'by-date': string;
		};
	};
	favorites: {
		key: string;
		value: { exerciseId: string; addedAt: string };
	};
}

let dbPromise: Promise<IDBPDatabase<FitLogDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<FitLogDB>> {
	if (!dbPromise) {
		dbPromise = openDB<FitLogDB>('fitlog', 1, {
			upgrade(db) {
				const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
				workoutStore.createIndex('by-date', 'date');

				db.createObjectStore('favorites', { keyPath: 'exerciseId' });
			}
		});
	}
	return dbPromise;
}
