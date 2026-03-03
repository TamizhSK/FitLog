<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fly, fade, scale, slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		isWorkoutActive,
		isTimerStarted,
		getActiveExercises,
		getCurrentIndex,
		getElapsedSeconds,
		setCurrentIndex,
		addSet,
		updateSet,
		removeSet,
		addExerciseToWorkout,
		removeExerciseFromWorkout,
		beginTimedSession,
		finishWorkout,
		cancelWorkout,
		restoreWorkout,
		formatDuration,
		startRest,
		isRestActive,
		didRestCompleteNaturally,
		clearRestCompletedFlag
	} from '$lib/stores/workout.svelte';
	import {
		loadExercises,
		getFilteredExercises,
		setSearchQuery,
		getSearchQuery
	} from '$lib/stores/exercises.svelte';
	import { getLastWorkoutForExercise } from '$lib/db/workouts';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import { isWeighted } from '$lib/utils/exercise';
	import { tapFeedback, startFeedback, finishFeedback, beep } from '$lib/utils/feedback';
	import ExerciseLogger from '$lib/components/workout/ExerciseLogger.svelte';
	import WorkoutRing from '$lib/components/workout/WorkoutRing.svelte';
	import type { WorkoutLog, SetLog } from '$lib/types/workout';
	import confetti from 'canvas-confetti';
	import {
		ChevronLeft,
		ChevronRight,
		Square,
		Plus,
		Minus,
		X,
		Search,
		Dumbbell,
		ListOrdered,
		Trophy,
		Clock,
		Flame,
		TrendingUp,
		Play,
		Trash2
	} from '@lucide/svelte';

	let showExerciseList = $state(false);
	let showAddExercise = $state(false);
	let finishedWorkout = $state<WorkoutLog | null>(null);
	let previousSetsMap = $state<Map<string, SetLog[]>>(new Map());
	let flyDirection = $state(1);
	let ready = $state(false);

	let active = $derived(isWorkoutActive());
	let timerOn = $derived(isTimerStarted());
	let exercises = $derived(getActiveExercises());
	let currentIdx = $derived(getCurrentIndex());
	let elapsed = $derived(getElapsedSeconds());
	let currentExercise = $derived(exercises[currentIdx]);
	let prefs = $derived(getPreferences());

	// Add exercise search
	let addQuery = $derived(getSearchQuery());
	let addResults = $derived(getFilteredExercises().slice(0, 15));

	onMount(async () => {
		await loadExercises();
		if (!isWorkoutActive()) {
			if (!restoreWorkout()) {
				goto('/workout');
				return;
			}
		}
		ready = true;
		await loadPreviousSets();
	});

	async function loadPreviousSets() {
		const map = new Map<string, SetLog[]>();
		for (const ae of exercises) {
			try {
				const last = await getLastWorkoutForExercise(ae.exercise.exerciseId);
				if (last) {
					const exLog = last.exercises.find(
						(e) => e.exerciseId === ae.exercise.exerciseId
					);
					if (exLog) {
						map.set(ae.exercise.exerciseId, exLog.sets);
					}
				}
			} catch {
				// skip
			}
		}
		previousSetsMap = map;
	}

	// Watch for rest timer natural completion → play alert
	$effect(() => {
		if (didRestCompleteNaturally()) {
			beep(880, 150, 0.3);
			setTimeout(() => beep(880, 150, 0.3), 400);
			if (prefs.vibrationEnabled && navigator.vibrate) {
				navigator.vibrate([200, 100, 200]);
			}
			clearRestCompletedFlag();
		}
	});

	function handleSetCompleted() {
		tapFeedback();
		startRest(prefs.restTimerDefault);
	}

	async function handleFinish() {
		const log = await finishWorkout();
		finishedWorkout = log;
		finishFeedback();
		confetti({
			particleCount: 100,
			spread: 80,
			origin: { y: 0.6 },
			colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
		});
		setTimeout(() => {
			confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
			confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
		}, 300);
	}

	function handleCancel() {
		if (confirm('Cancel this workout? All progress will be lost.')) {
			cancelWorkout();
			goto('/workout');
		}
	}

	function handleStartSession() {
		if (exercises.length === 0) return;
		startFeedback();
		beginTimedSession();
	}

	function goToExercise(index: number) {
		flyDirection = index > currentIdx ? 1 : -1;
		setCurrentIndex(index);
	}

	function totalVolume(): number {
		return exercises.reduce((total, ae) => {
			return (
				total +
				ae.sets
					.filter((s) => s.completed)
					.reduce((sum, s) => sum + (s.weight ?? 0) * s.reps, 0)
			);
		}, 0);
	}

	function totalCompletedSets(): number {
		return exercises.reduce((total, ae) => {
			return total + ae.sets.filter((s) => s.completed).length;
		}, 0);
	}

	function formatVol(vol: number): string {
		if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
		return `${Math.round(vol)}`;
	}

	function handleAddExercise(exercise: import('$lib/types/exercise').Exercise) {
		addExerciseToWorkout(exercise);
		showAddExercise = false;
		setSearchQuery('');
		setTimeout(() => {
			setCurrentIndex(getActiveExercises().length - 1);
			loadPreviousSets();
		}, 0);
	}
</script>

<!-- Workout Summary (after finishing) -->
{#if finishedWorkout}
	<div
		class="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center"
		in:scale={{ duration: 300, start: 0.9 }}
	>
		<!-- Trophy with ambient glow — moment of recognition -->
		<div class="animate-in zoom-in duration-500 relative flex items-center justify-center">
			<div class="absolute h-24 w-24 rounded-full bg-amber-400/15 blur-xl"></div>
			<Trophy class="relative h-16 w-16 text-amber-400 drop-shadow-lg" />
		</div>
		<div class="space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
			<h1 class="text-2xl font-bold">Workout Complete!</h1>
			<p class="text-sm text-muted-foreground">
				{#if finishedWorkout.duration >= 3600}
					Over an hour. That's serious commitment.
				{:else if finishedWorkout.duration >= 1800}
					Solid session. Consistency builds strength.
				{:else}
					Showed up and got it done. That's what counts.
				{/if}
			</p>
		</div>

		<div class="grid w-full max-w-sm grid-cols-3 gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
			<div class="fl-surface p-2.5 text-center sm:p-4">
				<Clock class="mx-auto h-3.5 w-3.5 text-blue-400" />
				<p class="mt-1 text-lg font-bold tabular-nums sm:text-2xl">
					{formatDuration(finishedWorkout.duration)}
				</p>
				<p class="text-[10px] text-muted-foreground sm:text-xs">Duration</p>
			</div>
			<div class="fl-surface p-2.5 text-center sm:p-4">
				<Dumbbell class="mx-auto h-3.5 w-3.5 text-green-400" />
				<p class="mt-1 text-lg font-bold tabular-nums sm:text-2xl">
					{finishedWorkout.exercises.length}
				</p>
				<p class="text-[10px] text-muted-foreground sm:text-xs">Exercises</p>
			</div>
			<div class="fl-surface p-2.5 text-center sm:p-4">
				<Flame class="mx-auto h-3.5 w-3.5 text-orange-400" />
				<p class="mt-1 text-lg font-bold tabular-nums sm:text-2xl">
					{finishedWorkout.exercises.reduce(
						(sum, e) => sum + e.sets.filter((s) => s.completed).length,
						0
					)}
				</p>
				<p class="text-[10px] text-muted-foreground sm:text-xs">Sets</p>
			</div>
		</div>

		<div class="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-500 delay-300">
			<TrendingUp class="h-4 w-4" />
			<span>
				Total volume: {formatVol(
					finishedWorkout.exercises.reduce(
						(t, e) =>
							t +
							e.sets
								.filter((s) => s.completed)
								.reduce((s, set) => s + (set.weight ?? 0) * set.reps, 0),
						0
					)
				)} {prefs.weightUnit}
			</span>
		</div>

		<div class="w-full max-w-sm space-y-2 text-left animate-in fade-in slide-in-from-bottom-5 duration-500 delay-400">
			{#each finishedWorkout.exercises as ex}
				<div class="fl-surface p-3">
					<p class="text-sm font-medium">{ex.exerciseName}</p>
					<p class="text-xs text-muted-foreground">
						{ex.sets.filter((s) => s.completed).length} sets completed
					</p>
				</div>
			{/each}
		</div>

		<Button href="/" size="lg" class="min-h-[48px] gap-2 px-8 animate-in fade-in zoom-in duration-500 delay-500">Done</Button>
	</div>

<!-- SETUP PHASE: Configure exercises before starting timer -->
{:else if ready && active && !timerOn}
	<div class="space-y-5">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-xl font-bold">Set Up Workout</h1>
				<p class="text-xs text-muted-foreground">Configure your exercises, then start the session</p>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onclick={handleCancel}
				class="min-h-[40px] text-muted-foreground sm:min-h-[32px]"
			>
				<X class="mr-1 h-3 w-3" />
				Cancel
			</Button>
		</div>

		<!-- Exercise list for setup -->
		{#if exercises.length === 0}
			<div class="fl-surface flex flex-col items-center py-12 text-center" style="border-style: dashed">
				<Dumbbell class="mb-3 h-10 w-10 text-muted-foreground/15" />
				<p class="text-sm text-muted-foreground/60">No exercises yet</p>
				<p class="mt-1 text-xs text-muted-foreground/40">Search and add exercises below</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each exercises as ae, exIdx (ae.exercise.exerciseId)}
					<div
						class="fl-surface p-3 space-y-3"
						transition:slide={{ duration: 200 }}
					>
						<!-- Exercise header with remove -->
						<div class="flex items-center gap-3">
							<div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
								<img
									src={ae.exercise.imageUrl}
									alt={ae.exercise.name}
									decoding="async"
									class="h-full w-full object-cover"
									onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
								/>
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="truncate text-sm font-semibold">{ae.exercise.name}</h3>
								<p class="text-xs text-muted-foreground">{ae.exercise.bodyParts.join(', ')}</p>
							</div>
							<button
								onclick={() => removeExerciseFromWorkout(exIdx)}
								class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						</div>

						<!-- Sets config -->
						<div class="overflow-hidden rounded-md border border-border">
							{#if isWeighted(ae.exercise)}
								<div class="grid grid-cols-[36px_1fr_1fr_36px] items-center gap-1 border-b border-border bg-muted/30 px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
									<span class="text-center">Set</span>
									<span>{prefs.weightUnit}</span>
									<span>Reps</span>
									<span></span>
								</div>
							{:else}
								<div class="grid grid-cols-[36px_1fr_36px] items-center gap-1 border-b border-border bg-muted/30 px-2 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
									<span class="text-center">Set</span>
									<span>Reps</span>
									<span></span>
								</div>
							{/if}
							{#each ae.sets as set, setIdx (set.setNumber)}
								{#if isWeighted(ae.exercise)}
									<div
										class="grid grid-cols-[36px_1fr_1fr_36px] items-center gap-1 border-b border-border/50 last:border-b-0 px-2 py-1.5"
										transition:slide={{ duration: 150 }}
									>
										<span class="text-center text-sm font-bold tabular-nums text-muted-foreground">{set.setNumber}</span>
										<Input
											type="number"
											inputmode="decimal"
											value={set.weight ?? ''}
											placeholder="0"
											oninput={(e) => updateSet(exIdx, setIdx, { weight: parseFloat(e.currentTarget.value) || 0 })}
											class="h-9 text-center text-sm tabular-nums"
										/>
										<Input
											type="number"
											inputmode="numeric"
											value={set.reps || ''}
											placeholder="0"
											oninput={(e) => updateSet(exIdx, setIdx, { reps: parseInt(e.currentTarget.value) || 0 })}
											class="h-9 text-center text-sm tabular-nums"
										/>
										<button
											onclick={() => removeSet(exIdx, setIdx)}
											disabled={ae.sets.length <= 1}
											class="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-destructive disabled:opacity-20"
										>
											<Minus class="h-3 w-3" />
										</button>
									</div>
								{:else}
									<div
										class="grid grid-cols-[36px_1fr_36px] items-center gap-1 border-b border-border/50 last:border-b-0 px-2 py-1.5"
										transition:slide={{ duration: 150 }}
									>
										<span class="text-center text-sm font-bold tabular-nums text-muted-foreground">{set.setNumber}</span>
										<Input
											type="number"
											inputmode="numeric"
											value={set.reps || ''}
											placeholder="0"
											oninput={(e) => updateSet(exIdx, setIdx, { reps: parseInt(e.currentTarget.value) || 0 })}
											class="h-9 text-center text-sm tabular-nums"
										/>
										<button
											onclick={() => removeSet(exIdx, setIdx)}
											disabled={ae.sets.length <= 1}
											class="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-destructive disabled:opacity-20"
										>
											<Minus class="h-3 w-3" />
										</button>
									</div>
								{/if}
							{/each}
						</div>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => addSet(exIdx)}
							class="h-8 w-full gap-1 text-xs"
						>
							<Plus class="h-3 w-3" />
							Add Set
						</Button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Add exercise -->
		<Button
			variant="outline"
			size="sm"
			onclick={() => {
				showAddExercise = !showAddExercise;
				if (!showAddExercise) setSearchQuery('');
			}}
			class="min-h-[44px] w-full gap-1.5 sm:min-h-[36px]"
		>
			<Plus class="h-4 w-4" />
			Add Exercise
		</Button>

		{#if showAddExercise}
			<div
				class="fl-surface space-y-2 p-3"
				transition:fly={{ y: 10, duration: 200 }}
			>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search exercises..."
						value={addQuery}
						oninput={(e) => setSearchQuery(e.currentTarget.value)}
						class="h-11 pl-10 text-base sm:h-9 sm:text-sm"
					/>
				</div>
				<div class="max-h-60 space-y-0.5 overflow-y-auto">
					{#each addResults as exercise (exercise.exerciseId)}
						<button
							onclick={() => handleAddExercise(exercise)}
							class="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm hover:bg-muted active:bg-muted sm:py-1.5"
						>
							<Plus class="h-3 w-3 shrink-0 text-muted-foreground" />
							<span class="flex-1 truncate">{exercise.name}</span>
							<span class="shrink-0 text-xs text-muted-foreground">{exercise.bodyParts[0]}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Start Session button -->
		{#if exercises.length > 0}
			<div class="h-20"></div>
			<div class="sticky bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-10 md:bottom-4">
				<Button
					onclick={handleStartSession}
					size="lg"
					class="w-full gap-2 py-6 text-base shadow-lg"
				>
					<Play class="h-5 w-5" />
					Start Session ({exercises.length} exercise{exercises.length > 1 ? 's' : ''})
				</Button>
			</div>
		{/if}
	</div>

<!-- SESSION PHASE: Timer running, check off sets -->
{:else if ready && active && timerOn}
	<div class="space-y-4">
		<!-- Header bar -->
		<div class="flex items-center justify-between">
			<Button
				variant="ghost"
				size="sm"
				onclick={handleCancel}
				class="min-h-[40px] text-muted-foreground sm:min-h-[32px]"
			>
				<X class="mr-1 h-3 w-3" />
				Cancel
			</Button>
			{#if exercises.length > 0}
				<Button
					size="sm"
					onclick={handleFinish}
					class="min-h-[40px] gap-1 sm:min-h-[32px]"
				>
					<Square class="h-3 w-3" />
					Finish
				</Button>
			{/if}
		</div>

		<!-- Workout Ring -->
		<WorkoutRing />

		<!-- Quick stats -->
		{#if exercises.length > 0}
			<div class="flex justify-center gap-4 text-xs text-muted-foreground">
				<span class="flex items-center gap-1">
					<Flame class="h-3 w-3 text-orange-400" />
					{totalCompletedSets()} sets
				</span>
				<span class="flex items-center gap-1">
					<TrendingUp class="h-3 w-3 text-green-400" />
					{formatVol(totalVolume())} {prefs.weightUnit}
				</span>
			</div>
		{/if}

		<!-- Exercise navigation -->
		{#if exercises.length > 1}
			<div class="fl-surface flex items-center justify-between p-1.5 sm:p-2">
				<button
					onclick={() => goToExercise(currentIdx - 1)}
					disabled={currentIdx === 0}
					class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted active:scale-95 disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded"
				>
					<ChevronLeft class="h-5 w-5" />
				</button>

				<button
					onclick={() => (showExerciseList = !showExerciseList)}
					class="flex min-h-[40px] items-center gap-1.5 px-3 text-sm font-medium sm:min-h-0"
				>
					<ListOrdered class="h-4 w-4" />
					{currentIdx + 1} / {exercises.length}
				</button>

				<button
					onclick={() => goToExercise(currentIdx + 1)}
					disabled={currentIdx === exercises.length - 1}
					class="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-muted active:scale-95 disabled:opacity-30 sm:h-8 sm:w-8 sm:rounded"
				>
					<ChevronRight class="h-5 w-5" />
				</button>
			</div>
		{/if}

		<!-- Exercise list drawer -->
		{#if showExerciseList}
			<div
				class="fl-surface space-y-1 p-2"
				transition:fly={{ y: -10, duration: 200 }}
			>
				{#each exercises as ae, i}
					<button
						onclick={() => {
							goToExercise(i);
							showExerciseList = false;
						}}
						class="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted active:bg-muted sm:py-1.5
							{i === currentIdx ? 'bg-primary/10 text-primary' : ''}"
					>
						<span class="w-5 text-center text-xs font-bold">{i + 1}</span>
						<span class="flex-1 truncate text-sm">{ae.exercise.name}</span>
						<span class="text-xs text-muted-foreground">
							{ae.sets.filter((s) => s.completed).length}/{ae.sets.length}
						</span>
					</button>
				{/each}
			</div>
		{/if}

		<!-- Current Exercise Logger -->
		{#if currentExercise}
			{#key currentIdx}
				<div in:fly={{ x: flyDirection * 60, duration: 250 }}>
					<ExerciseLogger
						exercise={currentExercise.exercise}
						sets={currentExercise.sets}
						previousSets={previousSetsMap.get(currentExercise.exercise.exerciseId)}
						onUpdateSet={(setIdx, updates) => updateSet(currentIdx, setIdx, updates)}
						onAddSet={() => addSet(currentIdx)}
						onRemoveSet={(setIdx) => removeSet(currentIdx, setIdx)}
						onSetCompleted={handleSetCompleted}
					/>
				</div>
			{/key}
		{/if}
	</div>

<!-- Loading -->
{:else if !ready}
	<div class="flex min-h-[40vh] items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
	</div>

<!-- Not active -->
{:else}
	<div class="flex min-h-[40vh] items-center justify-center">
		<div class="text-center">
			<Dumbbell class="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
			<p class="text-muted-foreground">No active workout</p>
			<Button href="/workout" variant="outline" class="mt-4 min-h-[44px]">Start Workout</Button>
		</div>
	</div>
{/if}
