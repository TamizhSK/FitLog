<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		getHiitPhase,
		getHiitPhaseRemaining,
		getHiitPhaseTotal,
		getHiitCurrentRound,
		getHiitTotalRounds,
		getHiitWorkSeconds,
		getHiitRestSeconds,
		getHiitTotalElapsed,
		isHiitPaused,
		startHiit,
		pauseHiit,
		resumeHiit,
		skipPhase,
		stopHiit
	} from '$lib/stores/hiit.svelte';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { Play, Pause, SkipForward, X, ChevronLeft } from '@lucide/svelte';

	let phase = $derived(getHiitPhase());
	let remaining = $derived(getHiitPhaseRemaining());
	let total = $derived(getHiitPhaseTotal());
	let round = $derived(getHiitCurrentRound());
	let totalRounds = $derived(getHiitTotalRounds());
	let elapsed = $derived(getHiitTotalElapsed());
	let paused = $derived(isHiitPaused());

	let displayTime = $derived.by(() => {
		const s = Math.ceil(remaining);
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${String(sec).padStart(2, '0')}`;
	});

	let progress = $derived(total > 0 ? 1 - remaining / total : 0);

	// Ring geometry
	const RADIUS = 110;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
	let dashOffset = $derived(CIRCUMFERENCE * (1 - progress));

	let phaseColor = $derived.by(() => {
		if (phase === 'work') return 'oklch(0.65 0.22 25)';
		if (phase === 'rest') return 'oklch(0.6 0.18 155)';
		if (phase === 'countdown') return 'oklch(0.7 0.15 60)';
		return 'oklch(0.5 0.02 286)';
	});

	let phaseLabel = $derived.by(() => {
		if (phase === 'countdown') return 'Get Ready';
		if (phase === 'work') return 'Work';
		if (phase === 'rest') return 'Rest';
		if (phase === 'done') return 'Done';
		return '';
	});

	onMount(() => {
		if (phase === 'idle') {
			startHiit();
		}
	});

	function handlePauseResume() {
		if (paused) resumeHiit();
		else pauseHiit();
	}

	function handleStop() {
		stopHiit();
		goto('/workout');
	}
</script>

<div class="hiit-page fl-page-enter">
	<!-- Back button -->
	<button onclick={handleStop} class="back-btn">
		<ChevronLeft class="h-5 w-5" />
		<span>End</span>
	</button>

	<!-- Phase label -->
	<p class="phase-label" style="color: {phaseColor}">{phaseLabel}</p>

	<!-- Timer ring -->
	<div class="timer-ring-wrap">
		<svg viewBox="0 0 260 260" class="timer-ring">
			<circle cx="130" cy="130" r={RADIUS} fill="none" stroke="oklch(1 0 0 / 0.08)" stroke-width="6" />
			<circle
				cx="130" cy="130" r={RADIUS}
				fill="none"
				stroke={phaseColor}
				stroke-width="6"
				stroke-linecap="round"
				stroke-dasharray={CIRCUMFERENCE}
				stroke-dashoffset={dashOffset}
				transform="rotate(-90 130 130)"
				class="ring-progress"
			/>
		</svg>
		<div class="timer-display">
			<span class="timer-time">{displayTime}</span>
			<span class="timer-round">Round {round}/{totalRounds}</span>
		</div>
	</div>

	<!-- Total elapsed -->
	<p class="total-elapsed">{formatDuration(elapsed)} total</p>

	<!-- Controls -->
	{#if phase === 'done'}
		<button onclick={handleStop} class="done-btn">
			Finish
		</button>
	{:else}
		<div class="controls">
			<button onclick={() => skipPhase()} class="control-btn control-secondary">
				<SkipForward class="h-5 w-5" />
			</button>
			<button onclick={handlePauseResume} class="control-btn control-primary" style="--btn-color: {phaseColor}">
				{#if paused}
					<Play class="h-6 w-6" fill="currentColor" />
				{:else}
					<Pause class="h-6 w-6" fill="currentColor" />
				{/if}
			</button>
			<button onclick={handleStop} class="control-btn control-secondary">
				<X class="h-5 w-5" />
			</button>
		</div>
	{/if}
</div>

<style>
	.hiit-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		min-height: 80vh;
		padding-top: 1rem;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		align-self: flex-start;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted-foreground);
		-webkit-tap-highlight-color: transparent;
	}

	.phase-label {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin-top: 1rem;
	}

	.timer-ring-wrap {
		position: relative;
		width: 260px;
		height: 260px;
	}
	.timer-ring {
		width: 100%;
		height: 100%;
	}
	.ring-progress {
		transition: stroke-dashoffset 0.3s ease;
	}
	.timer-display {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}
	.timer-time {
		font-size: 3.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.timer-round {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--muted-foreground);
	}

	.total-elapsed {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-top: 1rem;
	}

	.control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.control-btn:active {
		transform: scale(0.92);
	}
	.control-secondary {
		width: 3rem;
		height: 3rem;
		background: oklch(0.22 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--muted-foreground);
	}
	:global(:root:not(.dark)) .control-secondary {
		background: oklch(0.96 0 0);
		border-color: oklch(0 0 0 / 0.08);
	}
	.control-primary {
		width: 4rem;
		height: 4rem;
		background: var(--btn-color, oklch(0.6 0.18 25));
		color: white;
		box-shadow: 0 4px 16px oklch(0.5 0.2 25 / 0.3);
	}

	.done-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: 280px;
		padding: 0.9rem 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.45 0.2 140));
		color: white;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow: 0 2px 12px oklch(0.5 0.18 150 / 0.25);
		transition: transform 0.15s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
		margin-top: 1rem;
	}
	.done-btn:active {
		transform: scale(0.97);
	}
</style>
