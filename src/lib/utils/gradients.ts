export type GradientPreset = {
	base: string;
	baseLight: string;
	orb1: string;
	orb2: string;
	orb3: string;
	orb1Light: string;
	orb2Light: string;
	orb3Light: string;
};

const PRESETS: Record<string, GradientPreset> = {
	morning: {
		base: 'oklch(0.13 0.015 55)',
		baseLight: 'oklch(0.97 0.008 55)',
		orb1: 'oklch(0.55 0.22 60 / 0.7)',
		orb2: 'oklch(0.45 0.20 35 / 0.6)',
		orb3: 'oklch(0.35 0.12 80 / 0.3)',
		orb1Light: 'oklch(0.80 0.18 60 / 0.5)',
		orb2Light: 'oklch(0.82 0.15 35 / 0.45)',
		orb3Light: 'oklch(0.78 0.10 80 / 0.2)',
	},
	afternoon: {
		base: 'oklch(0.13 0.015 240)',
		baseLight: 'oklch(0.97 0.006 240)',
		orb1: 'oklch(0.45 0.22 240 / 0.7)',
		orb2: 'oklch(0.50 0.18 200 / 0.6)',
		orb3: 'oklch(0.35 0.12 280 / 0.3)',
		orb1Light: 'oklch(0.72 0.18 240 / 0.45)',
		orb2Light: 'oklch(0.76 0.15 200 / 0.40)',
		orb3Light: 'oklch(0.70 0.10 280 / 0.20)',
	},
	evening: {
		base: 'oklch(0.13 0.01 30)',
		baseLight: 'oklch(0.97 0.005 30)',
		orb1: 'oklch(0.45 0.25 15 / 0.7)',
		orb2: 'oklch(0.40 0.22 40 / 0.6)',
		orb3: 'oklch(0.30 0.15 280 / 0.3)',
		orb1Light: 'oklch(0.78 0.18 15 / 0.5)',
		orb2Light: 'oklch(0.82 0.15 40 / 0.45)',
		orb3Light: 'oklch(0.75 0.10 280 / 0.2)',
	},
	night: {
		base: 'oklch(0.10 0.020 285)',
		baseLight: 'oklch(0.96 0.008 285)',
		orb1: 'oklch(0.38 0.24 285 / 0.7)',
		orb2: 'oklch(0.32 0.20 310 / 0.6)',
		orb3: 'oklch(0.25 0.10 250 / 0.35)',
		orb1Light: 'oklch(0.65 0.18 285 / 0.45)',
		orb2Light: 'oklch(0.60 0.16 310 / 0.40)',
		orb3Light: 'oklch(0.58 0.10 250 / 0.20)',
	},
};

export function getGradientPreset(): GradientPreset {
	const hour = new Date().getHours();
	if (hour >= 5 && hour < 12) return PRESETS.morning;
	if (hour >= 12 && hour < 17) return PRESETS.afternoon;
	if (hour >= 17 && hour < 21) return PRESETS.evening;
	return PRESETS.night;
}
