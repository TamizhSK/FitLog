export interface WorkoutTemplate {
	name: string;
	icon: string;
	description: string;
	category: 'split' | 'equipment' | 'quick' | 'conditioning' | 'hiit';
	bodyParts?: string[];
	equipments?: string[];
	exerciseCount?: number;
	hiitConfig?: { workSeconds: number; restSeconds: number; rounds: number };
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
	// Splits
	{
		name: 'Push Day',
		icon: 'dumbbell',
		description: 'Chest, shoulders & triceps',
		category: 'split',
		bodyParts: ['CHEST', 'SHOULDERS', 'TRICEPS'],
	},
	{
		name: 'Pull Day',
		icon: 'arrow-up-from-line',
		description: 'Back, biceps & forearms',
		category: 'split',
		bodyParts: ['BACK', 'BICEPS', 'FOREARMS'],
	},
	{
		name: 'Leg Day',
		icon: 'footprints',
		description: 'Quads, hamstrings & calves',
		category: 'split',
		bodyParts: ['QUADRICEPS', 'THIGHS', 'HAMSTRINGS', 'CALVES', 'HIPS'],
	},
	{
		name: 'Full Body',
		icon: 'zap',
		description: 'Hit every major group',
		category: 'split',
		bodyParts: ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS'],
	},
	{
		name: 'Upper Body',
		icon: 'flame',
		description: 'Chest, back, shoulders & arms',
		category: 'split',
		bodyParts: ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'],
	},
	{
		name: 'Lower Body',
		icon: 'move-down',
		description: 'Quads, glutes, hamstrings & calves',
		category: 'split',
		bodyParts: ['QUADRICEPS', 'THIGHS', 'HAMSTRINGS', 'CALVES', 'HIPS', 'GLUTES'],
	},
	{
		name: 'Core Blast',
		icon: 'target',
		description: 'Abs & obliques focus',
		category: 'split',
		bodyParts: ['ABS', 'CORE'],
	},
	{
		name: 'Arm Day',
		icon: 'biceps-flexed',
		description: 'Biceps, triceps & forearms',
		category: 'split',
		bodyParts: ['BICEPS', 'TRICEPS', 'FOREARMS'],
	},
	{
		name: 'Shoulder Focus',
		icon: 'mountain',
		description: 'Delts & upper traps',
		category: 'split',
		bodyParts: ['SHOULDERS'],
	},
	{
		name: 'Back & Bis',
		icon: 'link',
		description: 'Pull muscles together',
		category: 'split',
		bodyParts: ['BACK', 'BICEPS'],
	},
	{
		name: 'Chest & Tris',
		icon: 'shield',
		description: 'Push muscles together',
		category: 'split',
		bodyParts: ['CHEST', 'TRICEPS'],
	},
	// Equipment-based
	{
		name: 'Bodyweight Only',
		icon: 'person-standing',
		description: 'No equipment needed',
		category: 'equipment',
		equipments: ['BODY WEIGHT'],
	},
	// Quick sessions
	{
		name: '15-min Quick Sweat',
		icon: 'timer',
		description: '3 exercises, fast & effective',
		category: 'quick',
		bodyParts: ['CHEST', 'BACK', 'QUADRICEPS'],
		exerciseCount: 3,
	},
	{
		name: 'Beginner Full Body',
		icon: 'sprout',
		description: '4 simple compound moves',
		category: 'quick',
		bodyParts: ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS'],
		exerciseCount: 4,
	},
	// HIIT Intervals
	{
		name: 'Tabata',
		icon: 'flame',
		description: '20s work / 10s rest x 8',
		category: 'hiit',
		hiitConfig: { workSeconds: 20, restSeconds: 10, rounds: 8 },
	},
	{
		name: 'EMOM',
		icon: 'clock',
		description: '40s work / 20s rest x 10',
		category: 'hiit',
		hiitConfig: { workSeconds: 40, restSeconds: 20, rounds: 10 },
	},
	{
		name: 'AMRAP',
		icon: 'biceps-flexed',
		description: '5 min single round',
		category: 'hiit',
		hiitConfig: { workSeconds: 300, restSeconds: 0, rounds: 1 },
	},
	{
		name: '30/30',
		icon: 'zap',
		description: '30s work / 30s rest x 10',
		category: 'hiit',
		hiitConfig: { workSeconds: 30, restSeconds: 30, rounds: 10 },
	},
	{
		name: '45/15',
		icon: 'dumbbell',
		description: '45s work / 15s rest x 8',
		category: 'hiit',
		hiitConfig: { workSeconds: 45, restSeconds: 15, rounds: 8 },
	},
	{
		name: 'Custom',
		icon: 'sliders-horizontal',
		description: 'Set your own intervals',
		category: 'hiit',
		hiitConfig: { workSeconds: 30, restSeconds: 15, rounds: 8 },
	},
];

export const TEMPLATE_CATEGORIES = [
	{ key: 'split', label: 'Splits' },
	{ key: 'equipment', label: 'Equipment' },
	{ key: 'quick', label: 'Quick' },
	{ key: 'hiit', label: 'HIIT Intervals' },
] as const;
