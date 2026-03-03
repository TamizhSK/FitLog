import { browser } from '$app/environment';

export type HiitPhase = 'idle' | 'countdown' | 'work' | 'rest' | 'done';

let phase = $state<HiitPhase>('idle');
let workSeconds = $state(20);
let restSeconds = $state(10);
let totalRounds = $state(8);
let currentRound = $state(1);
let phaseRemaining = $state(0);
let phaseTotal = $state(0);
let phaseStartedAt = $state<number | null>(null);
let pausedAt = $state<number | null>(null);
let pausedRemaining = $state(0);
let tickInterval = $state<ReturnType<typeof setInterval> | null>(null);
let totalElapsed = $state(0);
let totalStartedAt = $state<number | null>(null);

// --- Getters ---

export function getHiitPhase(): HiitPhase {
	return phase;
}

export function getHiitPhaseRemaining(): number {
	return phaseRemaining;
}

export function getHiitPhaseTotal(): number {
	return phaseTotal;
}

export function getHiitCurrentRound(): number {
	return currentRound;
}

export function getHiitTotalRounds(): number {
	return totalRounds;
}

export function getHiitWorkSeconds(): number {
	return workSeconds;
}

export function getHiitRestSeconds(): number {
	return restSeconds;
}

export function getHiitTotalElapsed(): number {
	return totalElapsed;
}

export function isHiitPaused(): boolean {
	return pausedAt !== null;
}

// --- Actions ---

export function configureHiit(work: number, rest: number, rounds: number) {
	workSeconds = work;
	restSeconds = rest;
	totalRounds = rounds;
}

export function startHiit() {
	phase = 'countdown';
	currentRound = 1;
	phaseTotal = 3; // 3-second countdown
	phaseRemaining = 3;
	totalElapsed = 0;
	totalStartedAt = Date.now();
	pausedAt = null;
	startPhaseTimer();
}

export function pauseHiit() {
	if (pausedAt !== null || phase === 'idle' || phase === 'done') return;
	pausedAt = Date.now();
	pausedRemaining = phaseRemaining;
	stopTick();
}

export function resumeHiit() {
	if (pausedAt === null) return;
	// Shift phaseStartedAt so wall-clock calc works
	const pauseDuration = Date.now() - pausedAt;
	if (phaseStartedAt) phaseStartedAt += pauseDuration;
	if (totalStartedAt) totalStartedAt += pauseDuration;
	pausedAt = null;
	startTick();
}

export function skipPhase() {
	if (phase === 'idle' || phase === 'done') return;
	if (pausedAt !== null) {
		pausedAt = null;
	}
	advancePhase();
}

export function stopHiit() {
	stopTick();
	phase = 'idle';
	phaseRemaining = 0;
	pausedAt = null;
	totalElapsed = 0;
	totalStartedAt = null;
}

// --- Internal ---

function startPhaseTimer() {
	phaseStartedAt = Date.now();
	startTick();
}

function startTick() {
	stopTick();
	tickInterval = setInterval(tick, 250);
	if (browser) {
		document.addEventListener('visibilitychange', handleVisibility);
	}
}

function stopTick() {
	if (tickInterval) {
		clearInterval(tickInterval);
		tickInterval = null;
	}
	if (browser) {
		document.removeEventListener('visibilitychange', handleVisibility);
	}
}

function handleVisibility() {
	if (!document.hidden && pausedAt === null) {
		tick();
	}
}

function tick() {
	if (pausedAt !== null) return;

	// Update total elapsed
	if (totalStartedAt) {
		totalElapsed = Math.floor((Date.now() - totalStartedAt) / 1000);
	}

	if (phaseStartedAt) {
		const elapsed = (Date.now() - phaseStartedAt) / 1000;
		phaseRemaining = Math.max(0, phaseTotal - elapsed);

		if (phaseRemaining <= 0) {
			advancePhase();
		}
	}
}

function advancePhase() {
	stopTick();

	if (phase === 'countdown') {
		// Start first work phase
		phase = 'work';
		phaseTotal = workSeconds;
		phaseRemaining = workSeconds;
		startPhaseTimer();
		return;
	}

	if (phase === 'work') {
		if (restSeconds > 0 && currentRound < totalRounds) {
			// Go to rest
			phase = 'rest';
			phaseTotal = restSeconds;
			phaseRemaining = restSeconds;
			startPhaseTimer();
		} else if (currentRound < totalRounds) {
			// No rest, next round
			currentRound++;
			phase = 'work';
			phaseTotal = workSeconds;
			phaseRemaining = workSeconds;
			startPhaseTimer();
		} else {
			// Done
			phase = 'done';
			phaseRemaining = 0;
		}
		return;
	}

	if (phase === 'rest') {
		currentRound++;
		if (currentRound <= totalRounds) {
			phase = 'work';
			phaseTotal = workSeconds;
			phaseRemaining = workSeconds;
			startPhaseTimer();
		} else {
			phase = 'done';
			phaseRemaining = 0;
		}
		return;
	}
}
