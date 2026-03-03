<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getHiitExerciseById, type HiitExercise } from '$lib/data/hiit-exercises';
	import { configureHiit } from '$lib/stores/hiit.svelte';
	import type { Component } from 'svelte';
	import {
		ArrowLeft,
		Play,
		Lightbulb,
		Shuffle,
		Target,
		Timer,
		Flame,
		Clock,
		BicepsFlexed,
		Zap,
		Dumbbell,
		SlidersHorizontal,
		CheckCircle,
		TrendingUp
	} from '@lucide/svelte';

	const ICONS: Record<string, Component> = {
		flame: Flame,
		clock: Clock,
		'biceps-flexed': BicepsFlexed,
		zap: Zap,
		dumbbell: Dumbbell,
		'sliders-horizontal': SlidersHorizontal,
	};

	let exercise = $derived(getHiitExerciseById(page.params.id ?? ''));

	function startTimer() {
		if (!exercise) return;
		configureHiit(
			[{ id: exercise.id, name: exercise.name }],
			exercise.defaultConfig.workSeconds,
			exercise.defaultConfig.restSeconds,
			exercise.defaultConfig.rounds
		);
		goto('/workout/hiit');
	}

	function formatTime(config: HiitExercise['defaultConfig']): string {
		const total = config.workSeconds * config.rounds + config.restSeconds * Math.max(0, config.rounds - 1);
		const m = Math.floor(total / 60);
		const s = total % 60;
		return s > 0 ? `${m}m ${s}s` : `${m}m`;
	}
</script>

{#if !exercise}
	<div class="fl-page-enter space-y-4">
		<a href="/exercises" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
			<ArrowLeft class="h-4 w-4" /> Back to exercises
		</a>
		<p class="text-muted-foreground">HIIT exercise not found.</p>
	</div>
{:else}
	<div class="fl-page-enter space-y-6">
		<!-- Back -->
		<a
			href="/exercises"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to exercises
		</a>

		<!-- Hero card — colored gradient with icon -->
		<div class="hiit-hero">
			<div class="hiit-hero-icon">
				{#if ICONS[exercise.icon]}
					{@const Icon = ICONS[exercise.icon]}
						<Icon class="h-10 w-10" />
				{/if}
			</div>
			<div class="hiit-hero-badge">{exercise.category}</div>
		</div>

		<!-- Title + meta -->
		<div class="space-y-3">
			<h1 class="fl-page-title text-xl sm:text-3xl">{exercise.name}</h1>
			<div class="flex flex-wrap gap-2">
				<span class="meta-chip">
					<Target class="h-3.5 w-3.5" />
					{exercise.difficulty}
				</span>
				<span class="meta-chip">
					<Timer class="h-3.5 w-3.5" />
					{exercise.duration}
				</span>
				<span class="meta-chip">
					<Flame class="h-3.5 w-3.5" />
					{exercise.calorieRange} cal
				</span>
			</div>
		</div>

		<!-- Overview -->
		<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">{exercise.overview}</p>

		<!-- Default config summary -->
		<div class="fl-surface space-y-3 p-4">
			<h2 class="text-base font-semibold">Default Protocol</h2>
			<div class="grid grid-cols-3 gap-3 text-center">
				<div>
					<p class="text-lg font-bold tabular-nums">{exercise.defaultConfig.workSeconds}s</p>
					<p class="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Work</p>
				</div>
				<div>
					<p class="text-lg font-bold tabular-nums">{exercise.defaultConfig.restSeconds}s</p>
					<p class="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Rest</p>
				</div>
				<div>
					<p class="text-lg font-bold tabular-nums">{exercise.defaultConfig.rounds}</p>
					<p class="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Rounds</p>
				</div>
			</div>
			<p class="text-center text-xs text-muted-foreground">
				Total time: {formatTime(exercise.defaultConfig)}
			</p>
		</div>

		<!-- Muscles worked -->
		<div class="fl-surface space-y-3 p-4">
			<h2 class="text-base font-semibold">Muscles & Systems Targeted</h2>
			<div class="flex flex-wrap gap-1.5">
				{#each exercise.musclesWorked as muscle}
					<span class="muscle-chip">{muscle}</span>
				{/each}
			</div>
		</div>

		<!-- Best for -->
		<div class="fl-surface space-y-3 p-4">
			<h2 class="flex items-center gap-2 text-base font-semibold">
				<CheckCircle class="h-4 w-4 text-emerald-400" />
				Best For
			</h2>
			<div class="flex flex-wrap gap-1.5">
				{#each exercise.bestFor as item}
					<span class="best-for-chip">{item}</span>
				{/each}
			</div>
		</div>

		<!-- Instructions -->
		<div class="space-y-3">
			<h2 class="text-base font-semibold sm:text-lg">How to Do It</h2>
			<ol class="space-y-3">
				{#each exercise.instructions as step, i}
					<li class="flex gap-3">
						<span class="instruction-number">{i + 1}</span>
						<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">{step}</p>
					</li>
				{/each}
			</ol>
		</div>

		<!-- Tips -->
		<div class="space-y-3">
			<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
				<Lightbulb class="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
				Pro Tips
			</h2>
			<ul class="space-y-2">
				{#each exercise.tips as tip}
					<li class="fl-surface p-3 text-sm leading-relaxed text-muted-foreground">{tip}</li>
				{/each}
			</ul>
		</div>

		<!-- Variations -->
		<div class="space-y-3">
			<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
				<Shuffle class="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
				Variations
			</h2>
			<ul class="space-y-2">
				{#each exercise.variations as variation}
					<li class="fl-surface p-3 text-sm leading-relaxed text-muted-foreground">{variation}</li>
				{/each}
			</ul>
		</div>

		<!-- CTA -->
		<div class="h-20"></div>
		<div class="sticky bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-10 flex justify-center md:bottom-4">
			<button onclick={startTimer} class="cta-btn">
				<Play class="h-4 w-4" fill="currentColor" />
				Start {exercise.name} Timer
			</button>
		</div>
	</div>
{/if}

<style>
	.hiit-hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 180px;
		margin-left: -1rem;
		margin-right: -1rem;
		background:
			radial-gradient(ellipse at 30% 70%, oklch(0.45 0.22 155 / 0.6), transparent 55%),
			radial-gradient(ellipse at 80% 20%, oklch(0.40 0.20 200 / 0.5), transparent 50%),
			oklch(0.14 0.02 180);
		overflow: hidden;
	}
	:global(:root:not(.dark)) .hiit-hero {
		background:
			radial-gradient(ellipse at 30% 70%, oklch(0.75 0.16 155 / 0.5), transparent 55%),
			radial-gradient(ellipse at 80% 20%, oklch(0.72 0.14 200 / 0.4), transparent 50%),
			oklch(0.96 0.008 180);
	}
	@media (min-width: 640px) {
		.hiit-hero {
			margin-left: 0;
			margin-right: 0;
			border-radius: 1rem;
		}
	}

	.hiit-hero-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 5rem;
		height: 5rem;
		border-radius: 1.25rem;
		background: oklch(1 0 0 / 0.1);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: oklch(1 0 0 / 0.85);
		border: 1px solid oklch(1 0 0 / 0.12);
	}
	:global(:root:not(.dark)) .hiit-hero-icon {
		background: oklch(0 0 0 / 0.06);
		color: oklch(0.2 0.02 180);
		border-color: oklch(0 0 0 / 0.08);
	}

	.hiit-hero-badge {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		background: oklch(1 0 0 / 0.1);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		color: oklch(1 0 0 / 0.7);
		border: 1px solid oklch(1 0 0 / 0.08);
	}
	:global(:root:not(.dark)) .hiit-hero-badge {
		background: oklch(0 0 0 / 0.05);
		color: oklch(0.3 0.02 180);
		border-color: oklch(0 0 0 / 0.06);
	}

	.meta-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		background: oklch(0.22 0.006 286);
		color: var(--muted-foreground);
		border: 1px solid oklch(1 0 0 / 0.06);
	}
	:global(:root:not(.dark)) .meta-chip {
		background: oklch(0.96 0 0);
		border-color: oklch(0 0 0 / 0.06);
	}

	.muscle-chip {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		background: oklch(0.55 0.14 155 / 0.15);
		color: oklch(0.72 0.14 155);
	}
	:global(:root:not(.dark)) .muscle-chip {
		background: oklch(0.45 0.14 155 / 0.1);
		color: oklch(0.40 0.14 155);
	}

	.best-for-chip {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		background: oklch(0.55 0.14 155 / 0.12);
		color: oklch(0.72 0.14 155);
	}
	:global(:root:not(.dark)) .best-for-chip {
		background: oklch(0.45 0.14 155 / 0.08);
		color: oklch(0.40 0.14 155);
	}

	.instruction-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		border-radius: 50%;
		font-size: 0.7rem;
		font-weight: 700;
		background: oklch(0.55 0.18 155 / 0.15);
		color: oklch(0.72 0.16 155);
	}
	:global(:root:not(.dark)) .instruction-number {
		background: oklch(0.45 0.18 155 / 0.12);
		color: oklch(0.40 0.18 155);
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
		padding: 0.75rem 2rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.45 0.2 140));
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		box-shadow: 0 2px 12px oklch(0.5 0.18 150 / 0.25);
		transition: transform 0.15s var(--ease-spring), box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.cta-btn:hover {
		box-shadow: 0 4px 20px oklch(0.5 0.18 150 / 0.35);
	}
	.cta-btn:active {
		transform: scale(0.97);
	}
</style>
