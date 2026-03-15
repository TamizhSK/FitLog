<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Minus, Plus, SkipForward, Pause, Play } from '@lucide/svelte';
	import {
		getElapsedSeconds,
		isRestActive,
		getRestRemaining,
		getRestTotal,
		adjustRest,
		skipRest,
		formatDuration,
		getActiveExercises,
		getCurrentIndex,
		isTimerPaused,
		pauseTimer,
		resumeTimer
	} from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';

	let resting = $derived(isRestActive());
	let elapsed = $derived(getElapsedSeconds());
	let restRemaining = $derived(getRestRemaining());
	let restTotal = $derived(getRestTotal());
	let exercises = $derived(getActiveExercises());
	let currentIdx = $derived(getCurrentIndex());
	let currentExercise = $derived(exercises[currentIdx]);
	let prefs = $derived(getPreferences());
	let paused = $derived(isTimerPaused());

	// SVG ring constants
	const SIZE = 200;
	const R = 88;
	const STROKE = 8;
	const C = 2 * Math.PI * R; // circumference
	const CX = SIZE / 2;
	const CY = SIZE / 2;

	// Arc progress
	let progress = $derived.by(() => {
		if (resting) {
			// Rest: depletes from full to zero
			return restTotal > 0 ? restRemaining / restTotal : 0;
		}
		// Workout: cycles every 60s
		return (elapsed % 60) / 60;
	});

	let dashOffset = $derived(C * (1 - progress));

	// Colors
	const ORANGE = 'oklch(0.72 0.19 45)';
	const BLUE = 'oklch(0.65 0.18 250)';
	let activeColor = $derived(resting ? BLUE : ORANGE);

	// Center display
	let displayTime = $derived(resting ? formatRestTime(restRemaining) : formatDuration(elapsed));
	let displayLabel = $derived(resting ? 'REST' : paused ? 'PAUSED' : 'WORKOUT');

	function formatRestTime(s: number): string {
		const totalSec = Math.ceil(s);
		const m = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${m}:${String(sec).padStart(2, '0')}`;
	}

	// Completed sets for current exercise (last 4)
	let completedSets = $derived.by(() => {
		if (!currentExercise) return [];
		return currentExercise.sets
			.filter(s => s.completed)
			.slice(-4);
	});

	function togglePause() {
		if (paused) {
			resumeTimer();
		} else {
			pauseTimer();
		}
	}
</script>

<div class="flex flex-col items-center gap-4">
	<!-- Ring -->
	<div class="relative flex items-center justify-center">
		<svg width={SIZE} height={SIZE} viewBox="0 0 {SIZE} {SIZE}" class="-rotate-90">
			<!-- Background track -->
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke="currentColor"
				stroke-width={STROKE}
				class="text-muted/30"
			/>
			<!-- Glow layer -->
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke={activeColor}
				stroke-width={STROKE + 4}
				stroke-linecap="round"
				stroke-dasharray={C}
				stroke-dashoffset={dashOffset}
				opacity="0.35"
				filter="url(#glow)"
				style="transition: stroke 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
			/>
			<!-- Active arc -->
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke={activeColor}
				stroke-width={STROKE}
				stroke-linecap="round"
				stroke-dasharray={C}
				stroke-dashoffset={dashOffset}
				style="transition: stroke 0.4s cubic-bezier(0.22, 1, 0.36, 1)"
			/>
			<defs>
				<filter id="glow">
					<feGaussianBlur stdDeviation="4" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>
		</svg>
		<!-- Center text -->
		<div class="absolute flex flex-col items-center justify-center">
			<span class="text-4xl font-bold tabular-nums tracking-tight" style="color: {activeColor}">
				{displayTime}
			</span>
			<span class="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				{displayLabel}
			</span>
		</div>
	</div>

	<!-- Completed sets pills -->
	{#if completedSets.length > 0}
		<div class="flex flex-wrap items-center justify-center gap-1.5">
			{#each completedSets as set, i (set.setNumber)}
				<span
					class="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground"
					in:fly={{ y: 8, duration: 200, delay: i * 50 }}
				>
					Set {set.setNumber}: {#if set.weight && set.weight > 0}{set.weight}{prefs.weightUnit} x {/if}{set.reps}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Pause/Resume button (when not resting) -->
	{#if !resting}
		<button
			onclick={togglePause}
			class="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/50 transition-all active:scale-95"
			aria-label={paused ? 'Resume' : 'Pause'}
		>
			{#if paused}
				<Play class="h-5 w-5 text-green-400" />
			{:else}
				<Pause class="h-5 w-5 text-muted-foreground" />
			{/if}
		</button>
	{/if}

	<!-- Rest controls -->
	{#if resting}
		<div
			class="flex items-center gap-2"
			in:fly={{ y: 12, duration: 250 }}
			out:fade={{ duration: 150 }}
		>
			<Button
				variant="outline"
				size="sm"
				onclick={() => adjustRest(-15)}
				class="min-h-[44px] min-w-[72px] active:scale-95 sm:min-h-[32px]"
			>
				<Minus class="mr-1 h-3 w-3" />
				15s
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => adjustRest(15)}
				class="min-h-[44px] min-w-[72px] active:scale-95 sm:min-h-[32px]"
			>
				<Plus class="mr-1 h-3 w-3" />
				15s
			</Button>
			<Button
				variant="secondary"
				size="sm"
				onclick={skipRest}
				class="min-h-[44px] gap-1.5 px-4 active:scale-95 sm:min-h-[32px]"
			>
				<SkipForward class="h-3.5 w-3.5" />
				Skip
			</Button>
		</div>
	{/if}
</div>
