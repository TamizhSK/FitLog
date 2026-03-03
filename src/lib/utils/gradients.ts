export type GradientPreset = {
	base: string;
	baseLight: string;
	c1: string;
	c2: string;
	c3: string;
	c4: string;
	c1Light: string;
	c2Light: string;
	c3Light: string;
	c4Light: string;
};

const PRESETS: Record<string, GradientPreset> = {
	morning: {
		base: 'oklch(0.25 0.12 40)',
		baseLight: 'oklch(0.96 0.04 85)',
		c1: 'oklch(0.70 0.28 45)',
		c2: 'oklch(0.80 0.22 95)',
		c3: 'oklch(0.65 0.30 20)',
		c4: 'oklch(0.75 0.25 60)',
		c1Light: 'oklch(0.82 0.22 45)',
		c2Light: 'oklch(0.90 0.15 95)',
		c3Light: 'oklch(0.80 0.25 20)',
		c4Light: 'oklch(0.88 0.18 60)',
	},
	afternoon: {
		base: 'oklch(0.22 0.10 230)',
		baseLight: 'oklch(0.95 0.05 220)',
		c1: 'oklch(0.60 0.25 220)',
		c2: 'oklch(0.80 0.28 90)',
		c3: 'oklch(0.55 0.28 170)',
		c4: 'oklch(0.65 0.30 300)',
		c1Light: 'oklch(0.80 0.18 220)',
		c2Light: 'oklch(0.90 0.22 90)',
		c3Light: 'oklch(0.78 0.20 170)',
		c4Light: 'oklch(0.85 0.22 300)',
	},
	evening: {
		base: 'oklch(0.20 0.12 340)',
		baseLight: 'oklch(0.94 0.06 350)',
		c1: 'oklch(0.62 0.32 15)',
		c2: 'oklch(0.55 0.30 330)',
		c3: 'oklch(0.72 0.28 60)',
		c4: 'oklch(0.50 0.32 290)',
		c1Light: 'oklch(0.82 0.25 15)',
		c2Light: 'oklch(0.80 0.22 330)',
		c3Light: 'oklch(0.90 0.20 60)',
		c4Light: 'oklch(0.75 0.25 290)',
	},
	night: {
		base: 'oklch(0.18 0.10 270)',
		baseLight: 'oklch(0.93 0.05 270)',
		c1: 'oklch(0.55 0.30 270)',
		c2: 'oklch(0.45 0.25 200)',
		c3: 'oklch(0.60 0.28 310)',
		c4: 'oklch(0.50 0.28 250)',
		c1Light: 'oklch(0.78 0.22 270)',
		c2Light: 'oklch(0.72 0.18 200)',
		c3Light: 'oklch(0.82 0.20 310)',
		c4Light: 'oklch(0.75 0.18 250)',
	},
	sunrise: {
		base: 'oklch(0.20 0.15 25)',
		baseLight: 'oklch(0.95 0.08 70)',
		c1: 'oklch(0.75 0.30 50)', // Orange
		c2: 'oklch(0.68 0.32 20)', // Red
		c3: 'oklch(0.80 0.25 90)', // Yellow
		c4: 'oklch(0.65 0.30 355)',// Pink
		c1Light: 'oklch(0.88 0.20 50)',
		c2Light: 'oklch(0.85 0.22 20)',
		c3Light: 'oklch(0.92 0.18 90)',
		c4Light: 'oklch(0.85 0.20 355)',
	},
	dusk: {
		base: 'oklch(0.18 0.12 310)',
		baseLight: 'oklch(0.92 0.07 330)',
		c1: 'oklch(0.60 0.30 320)', // Magenta
		c2: 'oklch(0.55 0.32 30)', // Orange
		c3: 'oklch(0.50 0.28 280)', // Purple
		c4: 'oklch(0.65 0.28 350)', // Pink
		c1Light: 'oklch(0.80 0.22 320)',
		c2Light: 'oklch(0.82 0.20 30)',
		c3Light: 'oklch(0.75 0.20 280)',
		c4Light: 'oklch(0.85 0.20 350)',
	},
	ocean: {
		base: 'oklch(0.20 0.10 230)',
		baseLight: 'oklch(0.95 0.05 210)',
		c1: 'oklch(0.65 0.25 200)', // Cyan
		c2: 'oklch(0.55 0.30 250)', // Blue
		c3: 'oklch(0.70 0.28 170)', // Teal
		c4: 'oklch(0.45 0.25 270)', // Indigo
		c1Light: 'oklch(0.85 0.18 200)',
		c2Light: 'oklch(0.78 0.20 250)',
		c3Light: 'oklch(0.88 0.20 170)',
		c4Light: 'oklch(0.72 0.18 270)',
	},
	aurora: {
		base: 'oklch(0.15 0.10 290)',
		baseLight: 'oklch(0.94 0.06 300)',
		c1: 'oklch(0.65 0.30 160)', // Green
		c2: 'oklch(0.60 0.32 310)', // Magenta
		c3: 'oklch(0.70 0.28 250)', // Blue
		c4: 'oklch(0.55 0.28 210)', // Cyan
		c1Light: 'oklch(0.85 0.22 160)',
		c2Light: 'oklch(0.82 0.22 310)',
		c3Light: 'oklch(0.88 0.20 250)',
		c4Light: 'oklch(0.78 0.20 210)',
	},
	vivid: {
		base: 'oklch(0.20 0.15 280)',
		baseLight: 'oklch(0.95 0.10 300)',
		c1: 'oklch(0.75 0.35 320)', // Hot Pink
		c2: 'oklch(0.80 0.30 150)', // Lime Green
		c3: 'oklch(0.70 0.32 270)', // Electric Blue
		c4: 'oklch(0.85 0.28 60)',  // Bright Yellow
		c1Light: 'oklch(0.85 0.25 320)',
		c2Light: 'oklch(0.90 0.20 150)',
		c3Light: 'oklch(0.82 0.22 270)',
		c4Light: 'oklch(0.92 0.20 60)',
	},
	cosmic: {
		base: 'oklch(0.15 0.10 260)',
		baseLight: 'oklch(0.92 0.06 280)',
		c1: 'oklch(0.50 0.30 250)', // Deep Blue
		c2: 'oklch(0.45 0.32 310)', // Dark Violet
		c3: 'oklch(0.65 0.28 10)',  // Fiery Red
		c4: 'oklch(0.60 0.25 280)', // Purple
		c1Light: 'oklch(0.75 0.20 250)',
		c2Light: 'oklch(0.70 0.22 310)',
		c3Light: 'oklch(0.85 0.20 10)',
		c4Light: 'oklch(0.80 0.18 280)',
	},
	meadow: {
		base: 'oklch(0.25 0.10 140)',
		baseLight: 'oklch(0.96 0.05 120)',
		c1: 'oklch(0.75 0.28 130)', // Light Green
		c2: 'oklch(0.85 0.20 90)',  // Soft Yellow
		c3: 'oklch(0.65 0.25 180)', // Sky Blue
		c4: 'oklch(0.80 0.15 100)', // Pale Gold
		c1Light: 'oklch(0.88 0.20 130)',
		c2Light: 'oklch(0.94 0.15 90)',
		c3Light: 'oklch(0.82 0.18 180)',
		c4Light: 'oklch(0.92 0.10 100)',
	},
	coral: {
		base: 'oklch(0.25 0.15 10)',
		baseLight: 'oklch(0.96 0.07 20)',
		c1: 'oklch(0.70 0.32 15)', // Coral Red
		c2: 'oklch(0.75 0.28 45)', // Warm Orange
		c3: 'oklch(0.65 0.30 350)',// Soft Pink
		c4: 'oklch(0.80 0.20 30)', // Peach
		c1Light: 'oklch(0.85 0.22 15)',
		c2Light: 'oklch(0.88 0.20 45)',
		c3Light: 'oklch(0.82 0.22 350)',
		c4Light: 'oklch(0.90 0.15 30)',
	}
};

export function getGradientPreset(): GradientPreset {
	const hour = new Date().getHours();

	if (hour >= 5 && hour < 7) return PRESETS.sunrise;
	if (hour >= 7 && hour < 12) return PRESETS.morning;
	if (hour >= 12 && hour < 17) return PRESETS.afternoon;
	if (hour >= 17 && hour < 19) return PRESETS.dusk;
	if (hour >= 19 && hour < 21) return PRESETS.evening;
	return PRESETS.night;
}
