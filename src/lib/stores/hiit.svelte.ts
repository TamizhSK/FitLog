import { browser } from '$app/environment';
import { saveWorkout } from '$lib/db/workouts';

export type HiitPhase = 'idle' | 'countdown' | 'work' | 'rest' | 'done';

export interface HiitExerciseInfo {
	id: string;
	name: string;
}

let phase = $state<HiitPhase>('idle');
let exercises = $state<HiitExerciseInfo[]>([]);
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
let startTime = $state<string | null>(null);

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

export function getHiitExercises(): HiitExerciseInfo[] {
	return exercises;
}

export function getHiitCurrentExercise(): HiitExerciseInfo | null {
	if (exercises.length === 0) return null;
	const index = (currentRound - 1) % exercises.length;
	return exercises[index];
}

// --- Actions ---

export function configureHiit(
	hiitExercises: HiitExerciseInfo[],
	work: number,
	rest: number,
	rounds: number
) {
	exercises = hiitExercises;
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
	startTime = new Date().toISOString();
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

async function finalizeWorkout() {
	if (!startTime) return;

	const endTime = new Date().toISOString();
	const duration = totalElapsed;

	// Map exercises to their sets
	// If multiple exercises, they alternate in the log
	const workoutExercises = exercises.map(ex => {
		const exerciseSets = [];
		for (let r = 1; r <= totalRounds; r++) {
			const exIndex = (r - 1) % exercises.length;
			if (exercises[exIndex].id === ex.id) {
				exerciseSets.push({
					setNumber: Math.floor((r - 1) / exercises.length) + 1,
					reps: 0,
					duration: workSeconds,
					completed: r < currentRound || (r === currentRound && phase === 'done'),
					restTime: restSeconds
				});
			}
		}

		return {
			exerciseId: ex.id.startsWith('hiit-') ? ex.id : `hiit-${ex.id}`,
			exerciseName: ex.name.includes('(HIIT)') ? ex.name : `${ex.name} (HIIT)`,
			sets: exerciseSets
		};
	});

	// If no exercises were selected but a template name was used
	if (workoutExercises.length === 0) {
		workoutExercises.push({
			exerciseId: 'hiit-custom',
			exerciseName: 'Custom Intervals (HIIT)',
			sets: Array.from({ length: totalRounds }, (_, i) => ({
				setNumber: i + 1,
				reps: 0,
				duration: workSeconds,
				completed: i + 1 < currentRound || (i + 1 === currentRound && phase === 'done'),
				restTime: restSeconds
			}))
		});
	}

	const workout = {
		id: crypto.randomUUID(),
		date: new Date().toISOString().split('T')[0],
		startTime,
		endTime,
		duration,
		exercises: workoutExercises
	};

	await saveWorkout(workout);
}

// --- Internal ---

function startPhaseTimer() {
	phaseStartedAt = Date.now();
	startTick();
}

function startTick() {
	stopTick();
	// Run at ~60fps for smooth UI updates
	tickInterval = setInterval(tick, 16);
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
			finalizeWorkout();
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
			finalizeWorkout();
		}
		return;
	}
}
