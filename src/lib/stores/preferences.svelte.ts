import { browser } from '$app/environment';
import { DEFAULT_PREFERENCES, type UserPreferences } from '$lib/types/workout';

const STORAGE_KEY = 'fitlog-preferences';

let preferences = $state<UserPreferences>({ ...DEFAULT_PREFERENCES });

export function initPreferences() {
	if (!browser) return;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// If prefs already existed but didn't have onboardingComplete,
			// this is an existing user — skip onboarding for them
			if (parsed && parsed.onboardingComplete === undefined) {
				parsed.onboardingComplete = true;
			}
			preferences = { ...DEFAULT_PREFERENCES, ...parsed };
		}
	} catch {
		// ignore
	}
}

function save() {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function getPreferences(): UserPreferences {
	return preferences;
}

export function setWeightUnit(unit: 'kg' | 'lbs') {
	preferences.weightUnit = unit;
	save();
}

export function setRestTimerDefault(seconds: number) {
	preferences.restTimerDefault = seconds;
	save();
}

export function setSoundEnabled(enabled: boolean) {
	preferences.soundEnabled = enabled;
	save();
}

export function setVibrationEnabled(enabled: boolean) {
	preferences.vibrationEnabled = enabled;
	save();
}

export function setUserName(name: string) {
	preferences.userName = name;
	save();
}

export function setOnboardingComplete(complete: boolean) {
	preferences.onboardingComplete = complete;
	save();
}
