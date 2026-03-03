export interface HiitPreset {
	id: string;
	name: string;
	emoji: string;
	description: string;
	workSeconds: number;
	restSeconds: number;
	rounds: number;
}

export const HIIT_PRESETS: HiitPreset[] = [
	{
		id: 'tabata',
		name: 'Tabata',
		emoji: '🔥',
		description: '20s work / 10s rest x 8',
		workSeconds: 20,
		restSeconds: 10,
		rounds: 8,
	},
	{
		id: 'emom',
		name: 'EMOM',
		emoji: '⏱️',
		description: '40s work / 20s rest x 10',
		workSeconds: 40,
		restSeconds: 20,
		rounds: 10,
	},
	{
		id: 'amrap',
		name: 'AMRAP',
		emoji: '💪',
		description: '5 min single round',
		workSeconds: 300,
		restSeconds: 0,
		rounds: 1,
	},
	{
		id: '30-30',
		name: '30/30',
		emoji: '⚡',
		description: '30s work / 30s rest x 10',
		workSeconds: 30,
		restSeconds: 30,
		rounds: 10,
	},
	{
		id: '45-15',
		name: '45/15',
		emoji: '🏋️',
		description: '45s work / 15s rest x 8',
		workSeconds: 45,
		restSeconds: 15,
		rounds: 8,
	},
	{
		id: 'custom',
		name: 'Custom',
		emoji: '🎛️',
		description: 'Set your own intervals',
		workSeconds: 30,
		restSeconds: 15,
		rounds: 8,
	},
];
