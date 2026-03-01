import type { Exercise } from '$lib/types/exercise';

export type LoadType = 'weighted' | 'bodyweight' | 'timed';

const WEIGHTED_EQUIPMENT = ['BARBELL', 'DUMBBELL', 'CABLE', 'LEVERAGE MACHINE', 'ROPE'];
const TIMED_TYPES = ['CARDIO'];

export function getLoadType(exercise: Exercise): LoadType {
	if (TIMED_TYPES.includes(exercise.exerciseType)) return 'timed';
	if (exercise.equipments.some((e) => WEIGHTED_EQUIPMENT.includes(e))) return 'weighted';
	return 'bodyweight';
}

export function isWeighted(exercise: Exercise): boolean {
	return getLoadType(exercise) === 'weighted';
}
