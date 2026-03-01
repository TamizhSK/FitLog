<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
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
		Trash2
	} from '@lucide/svelte';

	let selected = $state<Exercise[]>([]);
	let showSearch = $state(false);
	let query = $derived(getSearchQuery());
	let results = $derived(getFilteredExercises().slice(0, 20));

	const quickTemplates = [
		{ name: 'Push Day', bodyParts: ['CHEST', 'SHOULDERS', 'TRICEPS'] },
		{ name: 'Pull Day', bodyParts: ['BACK', 'BICEPS', 'FOREARMS'] },
		{ name: 'Leg Day', bodyParts: ['QUADRICEPS', 'THIGHS', 'HAMSTRINGS', 'CALVES', 'HIPS'] },
		{ name: 'Full Body', bodyParts: ['CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS'] }
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

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight">Start Workout</h1>
		<p class="text-sm text-muted-foreground">Pick exercises or jump right in.</p>
	</div>

	<!-- Quick Start -->
	<Button onclick={quickStart} variant="outline" size="lg" class="w-full gap-2">
		<Zap class="h-4 w-4" />
		Quick Start (Empty Session)
	</Button>

	<Separator />

	<!-- Templates -->
	<div class="space-y-3">
		<h2 class="text-sm font-semibold text-muted-foreground">Quick Templates</h2>
		<div class="grid grid-cols-2 gap-2">
			{#each quickTemplates as template}
				<button
					onclick={() => useTemplate(template)}
					class="rounded-lg border border-border p-3.5 text-left transition-colors active:scale-[0.98] hover:border-primary/30 hover:bg-card sm:p-3"
				>
					<span class="text-sm font-medium">{template.name}</span>
					<div class="mt-1 flex flex-wrap gap-1">
						{#each template.bodyParts.slice(0, 3) as bp}
							<MuscleTag muscle={bp} />
						{/each}
					</div>
				</button>
			{/each}
		</div>
	</div>

	<Separator />

	<!-- Exercise Picker -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="text-sm font-semibold text-muted-foreground">Add Exercises</h2>
			<button
				onclick={() => (showSearch = !showSearch)}
				class="text-sm text-primary hover:underline"
			>
				{showSearch ? 'Hide' : 'Search'}
			</button>
		</div>

		{#if showSearch}
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

			<div class="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
				{#each results as exercise (exercise.exerciseId)}
					<button
						onclick={() => toggleExercise(exercise)}
						class="flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted active:bg-muted sm:py-1.5"
					>
						<div
							class="flex h-5 w-5 shrink-0 items-center justify-center rounded border
								{isSelected(exercise)
								? 'border-primary bg-primary text-primary-foreground'
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
		{/if}
	</div>

	<!-- Selected exercises list -->
	{#if selected.length > 0}
		<div class="space-y-2">
			<h2 class="text-sm font-semibold text-muted-foreground">
				Selected ({selected.length})
			</h2>
			{#each selected as exercise, i (exercise.exerciseId)}
				<div class="flex items-center gap-2 rounded-lg border border-border p-2">
					<span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
						{i + 1}
					</span>
					<span class="flex-1 truncate text-sm">{exercise.name}</span>
					<button
						onclick={() => (selected = selected.filter((e) => e.exerciseId !== exercise.exerciseId))}
						class="text-muted-foreground hover:text-destructive"
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
			<Button onclick={startWithSelected} size="lg" class="w-full gap-2 shadow-lg">
				<Play class="h-4 w-4" />
				Start Workout ({selected.length} exercises)
			</Button>
		</div>
	{/if}
</div>
