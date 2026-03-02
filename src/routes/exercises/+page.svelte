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
	import { Loader2 } from '@lucide/svelte';

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
