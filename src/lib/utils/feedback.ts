import { getPreferences } from '$lib/stores/preferences.svelte';

// --- Audio ---

let _audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
	try {
		if (!_audioCtx || _audioCtx.state === 'closed') {
			_audioCtx = new AudioContext();
		}
		return _audioCtx;
	} catch {
		return null;
	}
}

/**
 * Play a short tone if sound is enabled.
 */
export function beep(frequency = 880, durationMs = 150, volume = 0.2) {
	const prefs = getPreferences();
	if (!prefs.soundEnabled) return;

	const ctx = getAudioContext();
	if (!ctx) return;

	try {
		if (ctx.state === 'suspended') ctx.resume();

		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.frequency.value = frequency;
		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
		gain.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + durationMs / 1000 + 0.01);
	} catch {
		// AudioContext not available
	}
}

// --- Public feedback functions ---

/** Light tap sound — set completion, button confirmations */
export function tapFeedback() {
	beep(660, 40, 0.08);
}

/** Countdown tick — short percussive tone for 3, 2, 1 */
export function countdownTick() {
	beep(880, 80, 0.15);
}

/** Countdown complete — higher ascending tone to signal GO */
export function countdownGo() {
	beep(1100, 200, 0.25);
}

/** Session start — ascending two-tone */
export function startFeedback() {
	beep(660, 100, 0.15);
	setTimeout(() => beep(880, 100, 0.15), 120);
}

/** Rest timer complete — double beep alert */
export function restEndFeedback() {
	beep(880, 150, 0.25);
	setTimeout(() => beep(880, 150, 0.25), 300);
}

/** Celebration — session finish, two ascending tones */
export function finishFeedback() {
	beep(880, 150, 0.2);
	setTimeout(() => beep(1100, 200, 0.25), 200);
}
