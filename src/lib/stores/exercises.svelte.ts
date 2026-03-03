import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Exercise } from '$lib/types/exercise';

let exercises = $state<Exercise[]>([]);
let loading = $state(true);
let fuse = $state<Fuse<Exercise> | null>(null);

let searchQuery = $state('');
let selectedBodyPart = $state('ALL');
let selectedEquipment = $state('ALL');

const fuseOptions: IFuseOptions<Exercise> = {
	keys: [
		{ name: 'name', weight: 2 },
		{ name: 'targetMuscles', weight: 1.5 },
		{ name: 'bodyParts', weight: 1 },
		{ name: 'equipments', weight: 0.8 },
		{ name: 'keywords', weight: 0.5 }
	],
	threshold: 0.4,
	includeScore: true
};

export async function loadExercises() {
	if (exercises.length > 0) return;
	loading = true;
	try {
		const res = await fetch('/data/exercises.json');
		const data: Exercise[] = await res.json();
		exercises = data;
		fuse = new Fuse(data, fuseOptions);
	} finally {
		loading = false;
	}
}

export function getFilteredExercises(): Exercise[] {
	let result = exercises;

	// Apply fuzzy search
	if (searchQuery.trim() && fuse) {
		result = fuse.search(searchQuery.trim()).map((r) => r.item);
	}

	// Filter by body part
	if (selectedBodyPart !== 'ALL') {
		result = result.filter((e) => e.bodyParts.includes(selectedBodyPart));
	}

	// Filter by equipment
	if (selectedEquipment !== 'ALL') {
		result = result.filter((e) => e.equipments.includes(selectedEquipment));
	}

	return result;
}

export function getExerciseById(id: string): Exercise | undefined {
	return exercises.find((e) => e.exerciseId === id);
}

export function getRelatedExercises(exercise: Exercise, limit = 6): Exercise[] {
	// First try relatedExerciseIds
	if (exercise.relatedExerciseIds?.length) {
		const related = exercise.relatedExerciseIds
			.map((id) => exercises.find((e) => e.exerciseId === id))
			.filter((e): e is Exercise => !!e);
		if (related.length > 0) return related.slice(0, limit);
	}
	// Fallback: same target muscle, different exercise
	return exercises
		.filter(
			(e) =>
				e.exerciseId !== exercise.exerciseId &&
				e.targetMuscles.some((m) => exercise.targetMuscles.includes(m))
		)
		.slice(0, limit);
}

export function getAllBodyParts(): string[] {
	const set = new Set<string>();
	for (const e of exercises) {
		for (const bp of e.bodyParts) set.add(bp);
	}
	return Array.from(set).sort();
}

export function getAllEquipments(): string[] {
	const set = new Set<string>();
	for (const e of exercises) {
		for (const eq of e.equipments) set.add(eq);
	}
	return Array.from(set).sort();
}

export function setSearchQuery(q: string) {
	searchQuery = q;
}

export function setSelectedBodyPart(bp: string) {
	selectedBodyPart = bp;
}

export function setSelectedEquipment(eq: string) {
	selectedEquipment = eq;
}

export function getSearchQuery() {
	return searchQuery;
}

export function getSelectedBodyPart() {
	return selectedBodyPart;
}

export function getSelectedEquipment() {
	return selectedEquipment;
}

export function isLoading() {
	return loading;
}

export function getExerciseCount() {
	return exercises.length;
}
