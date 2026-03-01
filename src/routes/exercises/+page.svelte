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

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight">Exercise Library</h1>
		<p class="text-sm text-muted-foreground">
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
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if filtered.length === 0}
		<div class="rounded-lg border border-dashed border-border py-16 text-center">
			<p class="text-muted-foreground">No exercises found. Try a different search or filter.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each paginated as exercise (exercise.exerciseId)}
				<ExerciseCard {exercise} />
			{/each}
		</div>

		{#if hasMore}
			<div class="flex justify-center pt-4">
				<button
					onclick={loadMore}
					class="rounded-lg bg-secondary px-6 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
				>
					Load more ({filtered.length - paginated.length} remaining)
				</button>
			</div>
		{/if}
	{/if}
</div>
