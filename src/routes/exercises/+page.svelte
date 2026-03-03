<script lang="ts">
	import { onMount } from 'svelte';
	import {
		loadExercises,
		getFilteredExercises,
		isLoading,
		getExerciseCount
	} from '$lib/stores/exercises.svelte';
	import ExerciseCard from '$lib/components/exercises/ExerciseCard.svelte';
	import ExerciseFilter from '$lib/components/exercises/ExerciseFilter.svelte';
	import { HIIT_EXERCISES } from '$lib/data/hiit-exercises';
	import type { Component } from 'svelte';
	import {
		Loader2,
		Timer,
		ChevronRight,
		Flame,
		Clock,
		BicepsFlexed,
		Zap,
		Dumbbell,
		SlidersHorizontal
	} from '@lucide/svelte';

	const HIIT_ICONS: Record<string, Component> = {
		flame: Flame,
		clock: Clock,
		'biceps-flexed': BicepsFlexed,
		zap: Zap,
		dumbbell: Dumbbell,
		'sliders-horizontal': SlidersHorizontal,
	};

	const PAGE_SIZE = 24;
	let page = $state(1);

	let filtered = $derived(getFilteredExercises());
	let paginated = $derived(filtered.slice(0, page * PAGE_SIZE));
	let hasMore = $derived(paginated.length < filtered.length);
	let loading = $derived(isLoading());

	onMount(() => {
		loadExercises();
	});

	function loadMore() {
		page++;
	}

	// Reset page when filters change
	$effect(() => {
		// Access filtered to track dependency
		filtered;
		page = 1;
	});
</script>

<div class="fl-page-enter space-y-6">
	<div class="fl-page-header">
		<h1 class="fl-page-title">Exercise Library</h1>
		<p class="fl-page-subtitle">
			{#if loading}
				Loading exercises...
			{:else}
				{filtered.length} of {getExerciseCount()} exercises
			{/if}
		</p>
	</div>

	<!-- HIIT Workouts Section -->
	<div>
		<div class="fl-section-header">
			<div class="fl-section-icon">
				<Timer class="h-4 w-4 text-emerald-400" />
			</div>
			<h2 class="fl-section-label">HIIT Workouts</h2>
		</div>
		<div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
			{#each HIIT_EXERCISES as hiit (hiit.id)}
				<a href="/exercises/hiit/{hiit.id}" class="hiit-card shrink-0">
					<div class="hiit-card-icon">
						{#if HIIT_ICONS[hiit.icon]}
							{@const Icon = HIIT_ICONS[hiit.icon]}
							<Icon class="h-5 w-5" />
						{/if}
					</div>
					<span class="text-sm font-semibold">{hiit.name}</span>
					<span class="text-[0.65rem] text-muted-foreground">{hiit.difficulty}</span>
					<ChevronRight class="absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground/30" />
				</a>
			{/each}
		</div>
	</div>

	<ExerciseFilter />

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground/40" />
		</div>
	{:else if filtered.length === 0}
		<div class="fl-surface flex flex-col items-center gap-2 py-16 text-center">
			<p class="text-sm text-muted-foreground/60">No exercises found</p>
			<p class="text-xs text-muted-foreground/40">Try a different search or filter</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
			{#each paginated as exercise (exercise.exerciseId)}
				<ExerciseCard {exercise} />
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center pt-2 pb-2">
				<button
					onclick={loadMore}
					class="load-more-btn"
				>
					Load more ({filtered.length - paginated.length} remaining)
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.hiit-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 130px;
		padding: 0.875rem 0.75rem;
		border-radius: 1rem;
		text-align: left;
		text-decoration: none;
		color: inherit;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		transition: border-color 0.2s ease, background 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.hiit-card:hover {
		border-color: oklch(0.55 0.14 155 / 0.3);
		background: oklch(0.22 0.006 286);
	}
	.hiit-card:active {
		transform: scale(0.97);
	}
	:global(:root:not(.dark)) .hiit-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .hiit-card:hover {
		border-color: oklch(0.45 0.14 155 / 0.25);
		background: oklch(0.97 0 0);
	}

	.hiit-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: oklch(0.55 0.14 155 / 0.15);
		color: oklch(0.72 0.14 155);
		margin-bottom: 0.25rem;
	}
	:global(:root:not(.dark)) .hiit-card-icon {
		background: oklch(0.45 0.14 155 / 0.1);
		color: oklch(0.40 0.14 155);
	}

	.load-more-btn {
		padding: 0.625rem 1.5rem;
		border-radius: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--muted-foreground);
		transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.load-more-btn:hover {
		background: oklch(0.22 0.006 286);
		border-color: oklch(1 0 0 / 0.12);
		color: var(--foreground);
	}
	.load-more-btn:active {
		transform: scale(0.97);
	}
	:global(:root:not(.dark)) .load-more-btn {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .load-more-btn:hover {
		background: oklch(0.97 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}
</style>
