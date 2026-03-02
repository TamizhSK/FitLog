<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Input } from '$lib/components/ui/input';
	import {
		loadExercises,
		getFilteredExercises,
		setSearchQuery,
		getSearchQuery,
		isLoading
	} from '$lib/stores/exercises.svelte';
	import {
		isWorkoutActive,
		startWorkout,
		restoreWorkout
	} from '$lib/stores/workout.svelte';
	import type { Exercise } from '$lib/types/exercise';
	import MuscleTag from '$lib/components/exercises/MuscleTag.svelte';
	import {
		Play,
		Zap,
		Search,
		X,
		Plus,
		Check,
		Dumbbell,
		Trash2,
		ChevronRight
	} from '@lucide/svelte';

	let selected = $state<Exercise[]>([]);
	let showSearch = $state(false);
	let query = $derived(getSearchQuery());
	let results = $derived(getFilteredExercises().slice(0, 20));

	const quickTemplates = [
		{ name: 'Push Day', emoji: '💪', bodyParts: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
		{ name: 'Pull Day', emoji: '🏋️', bodyParts: ['BACK', 'BICEPS', 'FOREARMS'] },
		{ name: 'Leg Day', emoji: '🦵', bodyParts: ['QUADRICEPS', 'THIGHS', 'HAMSTRINGS', 'CALVES', 'HIPS'] },
		{ name: 'Full Body', emoji: '⚡', bodyParts: ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS'] }
	];

	onMount(() => {
		loadExercises();
		// Resume active workout if one exists
		if (isWorkoutActive() || restoreWorkout()) {
			goto('/workout/active');
		}
	});

	function isSelected(exercise: Exercise): boolean {
		return selected.some((e) => e.exerciseId === exercise.exerciseId);
	}

	function toggleExercise(exercise: Exercise) {
		if (isSelected(exercise)) {
			selected = selected.filter((e) => e.exerciseId !== exercise.exerciseId);
		} else {
			selected = [...selected, exercise];
		}
	}

	function quickStart() {
		startWorkout([]);
		goto('/workout/active');
	}

	function startWithSelected() {
		if (selected.length === 0) return;
		startWorkout(selected);
		goto('/workout/active');
	}

	function useTemplate(template: { name: string; bodyParts: string[] }) {
		const exercises = getFilteredExercises();
		const matching = exercises.filter((e) =>
			e.bodyParts.some((bp) => template.bodyParts.includes(bp))
		);
		// Pick up to 6 varied exercises
		const picked: Exercise[] = [];
		for (const bp of template.bodyParts) {
			const forBp = matching.filter(
				(e) => e.bodyParts.includes(bp) && !picked.some((p) => p.exerciseId === e.exerciseId)
			);
			if (forBp.length > 0) picked.push(forBp[0]);
			if (forBp.length > 1) picked.push(forBp[1]);
		}
		selected = picked.slice(0, 6);
	}
</script>

<div class="fl-page-enter space-y-6">
	<div class="fl-page-header">
		<h1 class="fl-page-title">Start Workout</h1>
		<p class="fl-page-subtitle">Pick exercises or jump right in</p>
	</div>

	<!-- Quick Start -->
	<button onclick={quickStart} class="quick-start-btn">
		<Zap class="h-5 w-5" />
		<div class="text-left">
			<span class="block text-sm font-semibold">Quick Start</span>
			<span class="block text-[0.6875rem] opacity-60">Empty session — add exercises as you go</span>
		</div>
		<ChevronRight class="ml-auto h-4 w-4 opacity-30" />
	</button>

	<!-- Templates -->
	<div>
		<div class="fl-section-header">
			<div class="fl-section-icon">
				<Dumbbell class="h-4 w-4 text-violet-400" />
			</div>
			<h2 class="fl-section-label">Quick Templates</h2>
		</div>
		<div class="grid grid-cols-2 gap-2">
			{#each quickTemplates as template}
				<button
					onclick={() => useTemplate(template)}
					class="template-card"
				>
					<span class="text-sm font-medium">{template.name}</span>
					<div class="mt-1.5 flex flex-wrap gap-1">
						{#each template.bodyParts.slice(0, 3) as bp}
							<MuscleTag muscle={bp} />
						{/each}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Exercise Picker -->
	<div>
		<div class="fl-section-header">
			<div class="fl-section-icon">
				<Plus class="h-4 w-4 text-blue-400" />
			</div>
			<h2 class="fl-section-label">Add Exercises</h2>
			<button
				onclick={() => (showSearch = !showSearch)}
				class="fl-section-link"
			>
				{showSearch ? 'Hide' : 'Search'}
			</button>
		</div>

		{#if showSearch}
			<div class="space-y-2">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search exercises..."
						value={query}
						oninput={(e) => setSearchQuery(e.currentTarget.value)}
						class="pl-10"
					/>
					{#if query}
						<button
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
							onclick={() => setSearchQuery('')}
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
				</div>

				<div class="fl-surface max-h-64 space-y-0.5 overflow-y-auto p-1.5">
					{#each results as exercise (exercise.exerciseId)}
						<button
							onclick={() => toggleExercise(exercise)}
							class="search-result-row"
						>
							<div
								class="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors
									{isSelected(exercise)
									? 'border-[oklch(0.6_0.18_45)] bg-[oklch(0.6_0.18_45)] text-white'
									: 'border-border'}"
							>
								{#if isSelected(exercise)}
									<Check class="h-3 w-3" />
								{/if}
							</div>
							<span class="flex-1 truncate text-sm">{exercise.name}</span>
							<span class="text-xs text-muted-foreground">{exercise.bodyParts[0]}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Selected exercises list -->
	{#if selected.length > 0}
		<div class="space-y-2">
			<p class="fl-section-label pl-0.5">Selected ({selected.length})</p>
			{#each selected as exercise, i (exercise.exerciseId)}
				<div class="fl-row">
					<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
						style="background: oklch(0.6 0.18 45 / 0.15); color: oklch(0.75 0.16 45)"
					>
						{i + 1}
					</span>
					<span class="flex-1 truncate text-sm font-medium">{exercise.name}</span>
					<button
						onclick={() => (selected = selected.filter((e) => e.exerciseId !== exercise.exerciseId))}
						class="text-muted-foreground transition-colors hover:text-destructive"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Start button -->
	{#if selected.length > 0}
		<div class="sticky bottom-20 z-10 md:bottom-4">
			<button onclick={startWithSelected} class="cta-btn">
				<Play class="h-5 w-5" fill="currentColor" />
				Start Workout ({selected.length} exercise{selected.length > 1 ? 's' : ''})
			</button>
		</div>
	{/if}
</div>

<style>
	.quick-start-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 1rem;
		border-radius: 1rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--foreground);
		text-align: left;
		transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.quick-start-btn:hover {
		background: oklch(0.22 0.006 286);
		border-color: oklch(1 0 0 / 0.12);
	}
	.quick-start-btn:active {
		transform: scale(0.98);
	}
	:global(:root:not(.dark)) .quick-start-btn {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
	}
	:global(:root:not(.dark)) .quick-start-btn:hover {
		background: oklch(0.97 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}

	.template-card {
		padding: 0.875rem;
		border-radius: 1rem;
		text-align: left;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		transition: border-color 0.2s ease, background 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.template-card:hover {
		border-color: oklch(0.6 0.12 280 / 0.25);
		background: oklch(0.22 0.006 286);
	}
	.template-card:active {
		transform: scale(0.97);
	}
	:global(:root:not(.dark)) .template-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .template-card:hover {
		border-color: oklch(0.5 0.12 280 / 0.2);
		background: oklch(0.97 0 0);
	}

	.search-result-row {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.5rem;
		border-radius: 0.5rem;
		text-align: left;
		transition: background 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.search-result-row:hover,
	.search-result-row:active {
		background: oklch(0.22 0.006 286);
	}
	:global(:root:not(.dark)) .search-result-row:hover,
	:global(:root:not(.dark)) .search-result-row:active {
		background: oklch(0.96 0 0);
	}

	.cta-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.9rem 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 45), oklch(0.45 0.2 25));
		color: white;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow: 0 2px 12px oklch(0.5 0.18 35 / 0.25),
		            inset 0 1px 0 oklch(1 0 0 / 0.12);
		transition: transform 0.15s var(--ease-spring), box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.cta-btn:hover {
		box-shadow: 0 4px 20px oklch(0.5 0.18 35 / 0.35),
		            inset 0 1px 0 oklch(1 0 0 / 0.12);
	}
	.cta-btn:active {
		transform: scale(0.98);
	}
</style>
