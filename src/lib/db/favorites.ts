import { getDB } from './index';

export async function addFavorite(exerciseId: string): Promise<void> {
	const db = await getDB();
	await db.put('favorites', { exerciseId, addedAt: new Date().toISOString() });
}

export async function removeFavorite(exerciseId: string): Promise<void> {
	const db = await getDB();
	await db.delete('favorites', exerciseId);
}

export async function isFavorite(exerciseId: string): Promise<boolean> {
	const db = await getDB();
	const fav = await db.get('favorites', exerciseId);
	return !!fav;
}

export async function getAllFavoriteIds(): Promise<string[]> {
	const db = await getDB();
	const all = await db.getAll('favorites');
	return all.map((f) => f.exerciseId);
}
