import { getPreferences } from '$lib/stores/preferences.svelte';

/**
 * Trigger haptic feedback if enabled and supported.
 * Pattern: array of [vibrate, pause, vibrate, ...] in ms.
 */
export function haptic(pattern: number | number[] = 50) {
	const prefs = getPreferences();
	if (!prefs.vibrationEnabled) return;
	try {
		navigator.vibrate?.(pattern);
	} catch {
		// Not supported (iOS Safari, desktop)
	}
}

/**
 * Play a short beep sound if enabled.
 */
export function beep(frequency = 880, durationMs = 150, volume = 0.2) {
	const prefs = getPreferences();
	if (!prefs.soundEnabled) return;
	try {
		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = frequency;
		gain.gain.value = volume;
		osc.start();
		osc.stop(ctx.currentTime + durationMs / 1000);
	} catch {
		// AudioContext not available
	}
}

/** Light tap — for set completion, button presses */
export function tapFeedback() {
	haptic(30);
}

/** Medium pulse — for session start */
export function startFeedback() {
	haptic([40, 30, 40]);
	beep(660, 100, 0.15);
}

/** Celebration — for session finish */
export function finishFeedback() {
	haptic([100, 50, 100, 50, 150]);
	beep(880, 150, 0.2);
	setTimeout(() => beep(1100, 200, 0.25), 200);
}
