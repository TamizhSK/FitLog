import { getPreferences } from '$lib/stores/preferences.svelte';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// --- Platform detection ---

const isNative = Capacitor.isNativePlatform();

const isIOS = (() => {
	if (typeof navigator === 'undefined') return false;
	return /iP(hone|ad|od)/.test(navigator.userAgent) ||
		(navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
})();

// --- Audio (unchanged) ---

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
 * On web iOS this also substitutes for haptic feedback.
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
		// AudioContext not available or suspended
	}
}

// --- Haptics ---

/**
 * Trigger haptic feedback respecting user preferences.
 *
 * Native (Capacitor): uses Taptic Engine (iOS) / Vibration motor (Android)
 * Web Android: navigator.vibrate()
 * Web iOS: no-op (audio fallback handled by callers)
 */
function haptic(
	style: ImpactStyle = ImpactStyle.Medium,
	webPattern: number | number[] = 50
) {
	const prefs = getPreferences();
	if (!prefs.vibrationEnabled) return;

	if (isNative) {
		Haptics.impact({ style }).catch(() => {});
		return;
	}

	// Web fallback
	if (isIOS) return;
	try {
		if (navigator.vibrate) {
			navigator.vibrate(webPattern);
		}
	} catch {
		// Vibration API not available
	}
}

/** Notification-style haptic (native only, falls back to impact on web) */
function hapticNotification(type: NotificationType, webPattern: number | number[] = 50) {
	const prefs = getPreferences();
	if (!prefs.vibrationEnabled) return;

	if (isNative) {
		Haptics.notification({ type }).catch(() => {});
		return;
	}

	if (isIOS) return;
	try {
		if (navigator.vibrate) {
			navigator.vibrate(webPattern);
		}
	} catch {
		// Vibration API not available
	}
}

// --- Public feedback functions ---

/** Light tap — set completion, button confirmations */
export function tapFeedback() {
	haptic(ImpactStyle.Light, 30);
	// Web iOS substitute: very short quiet tick
	if (!isNative && isIOS) beep(660, 40, 0.08);
}

/** Medium pulse — session start */
export function startFeedback() {
	hapticNotification(NotificationType.Success, [40, 30, 40]);
	beep(660, 100, 0.15);
}

/** Celebration — session finish */
export function finishFeedback() {
	hapticNotification(NotificationType.Success, [100, 50, 100, 50, 150]);
	beep(880, 150, 0.2);
	setTimeout(() => beep(1100, 200, 0.25), 200);
}
