import { browser } from '$app/environment';
import type { Exercise } from '$lib/types/exercise';
import type { WorkoutLog, WorkoutExerciseLog, SetLog } from '$lib/types/workout';
import { saveWorkout } from '$lib/db/workouts';

interface ActiveExercise {
	exercise: Exercise;
	sets: SetLog[];
}

let active = $state(false);
let timerStarted = $state(false);
let startTime = $state<string | null>(null);
let exercises = $state<ActiveExercise[]>([]);
let currentIndex = $state(0);
let elapsedSeconds = $state(0);
let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);

// Rest timer state
let restActive = $state(false);
let restRemaining = $state(0);
let restTotal = $state(0);
let restStartedAt = $state<number | null>(null);
let restInterval = $state<ReturnType<typeof setInterval> | null>(null);
let restCompletedNaturally = $state(false);

const AUTOSAVE_KEY = 'fitlog-active-workout';

export function isWorkoutActive(): boolean {
	return active;
}

export function isTimerStarted(): boolean {
	return timerStarted;
}

export function getActiveExercises(): ActiveExercise[] {
	return exercises;
}

export function getCurrentIndex(): number {
	return currentIndex;
}

export function getCurrentExercise(): ActiveExercise | undefined {
	return exercises[currentIndex];
}

export function getElapsedSeconds(): number {
	return elapsedSeconds;
}

// Phase 1: Set up exercises (no timer yet)
export function startWorkout(selectedExercises: Exercise[]) {
	active = true;
	timerStarted = false;
	startTime = null;
	exercises = selectedExercises.map((exercise) => ({
		exercise,
		sets: [{ setNumber: 1, reps: 0, weight: 0, completed: false }]
	}));
	currentIndex = 0;
	elapsedSeconds = 0;
	autosave();
}

// Phase 2: Begin the timed session
export function beginTimedSession() {
	if (!active) return;
	timerStarted = true;
	startTime = new Date().toISOString();
	elapsedSeconds = 0;
	startTimer();
	autosave();
}

export function addExerciseToWorkout(exercise: Exercise) {
	if (!active) {
		startWorkout([exercise]);
		return;
	}
	// Don't add duplicates
	if (exercises.some((e) => e.exercise.exerciseId === exercise.exerciseId)) return;
	exercises = [
		...exercises,
		{
			exercise,
			sets: [{ setNumber: 1, reps: 0, weight: 0, completed: false }]
		}
	];
	autosave();
}

export function removeExerciseFromWorkout(index: number) {
	exercises = exercises.filter((_, i) => i !== index);
	if (currentIndex >= exercises.length) {
		currentIndex = Math.max(0, exercises.length - 1);
	}
	autosave();
}

export function setCurrentIndex(index: number) {
	if (index >= 0 && index < exercises.length) {
		currentIndex = index;
	}
}

export function addSet(exerciseIndex: number) {
	const ex = exercises[exerciseIndex];
	if (!ex) return;
	const lastSet = ex.sets[ex.sets.length - 1];
	ex.sets = [
		...ex.sets,
		{
			setNumber: ex.sets.length + 1,
			reps: lastSet?.reps ?? 0,
			weight: lastSet?.weight ?? 0,
			completed: false
		}
	];
	exercises = [...exercises];
	autosave();
}

export function updateSet(
	exerciseIndex: number,
	setIndex: number,
	updates: Partial<SetLog>
) {
	const ex = exercises[exerciseIndex];
	if (!ex || !ex.sets[setIndex]) return;
	ex.sets[setIndex] = { ...ex.sets[setIndex], ...updates };
	exercises = [...exercises];
	autosave();
}

export function removeSet(exerciseIndex: number, setIndex: number) {
	const ex = exercises[exerciseIndex];
	if (!ex || ex.sets.length <= 1) return;
	ex.sets = ex.sets.filter((_, i) => i !== setIndex).map((s, i) => ({ ...s, setNumber: i + 1 }));
	exercises = [...exercises];
	autosave();
}

export async function finishWorkout(): Promise<WorkoutLog> {
	stopTimer();
	stopRest();
	const endTime = new Date().toISOString();

	const now = new Date();
	const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

	const log: WorkoutLog = {
		id: crypto.randomUUID(),
		date: localDate,
		startTime: startTime || endTime,
		endTime,
		duration: elapsedSeconds,
		exercises: exercises.map(
			(ae): WorkoutExerciseLog => ({
				exerciseId: ae.exercise.exerciseId,
				exerciseName: ae.exercise.name,
				sets: ae.sets.map((s) => ({ ...s }))
			})
		)
	};

	await saveWorkout(log);
	clearAutosave();
	resetState();
	return log;
}

export function cancelWorkout() {
	stopTimer();
	stopRest();
	clearAutosave();
	resetState();
}

export function restoreWorkout() {
	if (!browser) return false;
	try {
		const saved = localStorage.getItem(AUTOSAVE_KEY);
		if (!saved) return false;
		const data = JSON.parse(saved);
		active = true;
		timerStarted = data.timerStarted ?? true;
		startTime = data.startTime;
		exercises = data.exercises;
		currentIndex = data.currentIndex;
		if (timerStarted && startTime) {
			// Compute elapsed from wall clock for accuracy
			elapsedSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
			startTimer();
		} else {
			elapsedSeconds = 0;
		}
		return true;
	} catch {
		clearAutosave();
		return false;
	}
}

function startTimer() {
	stopTimer();
	recalcElapsed();
	// Run at ~60fps for smooth UI updates
	timerInterval = setInterval(recalcElapsed, 16);

	if (browser) {
		document.addEventListener('visibilitychange', handleVisibilityChange);
	}
}

function recalcElapsed() {
	if (startTime) {
		elapsedSeconds = (Date.now() - new Date(startTime).getTime()) / 1000;
	}
}

function handleVisibilityChange() {
	if (!document.hidden && active && startTime) {
		recalcElapsed();
	}
}

function stopTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
	if (browser) {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
	}
}

function resetState() {
	active = false;
	timerStarted = false;
	startTime = null;
	exercises = [];
	currentIndex = 0;
	elapsedSeconds = 0;
}

function autosave() {
	if (!browser) return;
	localStorage.setItem(
		AUTOSAVE_KEY,
		JSON.stringify({
			startTime,
			timerStarted,
			exercises,
			currentIndex,
			elapsedSeconds
		})
	);
}

function clearAutosave() {
	if (!browser) return;
	localStorage.removeItem(AUTOSAVE_KEY);
}

// --- Rest Timer ---

export function startRest(seconds: number) {
	stopRest();
	restTotal = seconds;
	restRemaining = seconds;
	restStartedAt = Date.now();
	restActive = true;
	restCompletedNaturally = false;
	restInterval = setInterval(() => {
		if (restStartedAt) {
			const elapsed = (Date.now() - restStartedAt) / 1000;
			restRemaining = Math.max(0, restTotal - elapsed);
			if (restRemaining <= 0) {
				restCompletedNaturally = true;
				stopRest();
			}
		}
	}, 16);
}

export function adjustRest(delta: number) {
	if (!restActive) return;
	restTotal = Math.max(15, restTotal + delta);
	// Shift the start time back/forward to account for adjustment
	if (restStartedAt) {
		restStartedAt += delta * 1000;
	}
	const elapsed = restStartedAt ? (Date.now() - restStartedAt) / 1000 : 0;
	restRemaining = Math.max(0, restTotal - elapsed);
}

export function skipRest() {
	restCompletedNaturally = false;
	stopRest();
}

function stopRest() {
	restActive = false;
	restRemaining = 0;
	restStartedAt = null;
	if (restInterval) {
		clearInterval(restInterval);
		restInterval = null;
	}
}

export function isRestActive(): boolean {
	return restActive;
}

export function getRestRemaining(): number {
	return restRemaining;
}

export function getRestTotal(): number {
	return restTotal;
}

export function didRestCompleteNaturally(): boolean {
	return restCompletedNaturally;
}

export function clearRestCompletedFlag() {
	restCompletedNaturally = false;
}

export function formatDuration(seconds: number): string {
	const totalSeconds = Math.floor(seconds);
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	return `${m}:${String(s).padStart(2, '0')}`;
}
