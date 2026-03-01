<script lang="ts">
	import { onMount } from 'svelte';
	import ActivityHeatmap from '$lib/components/logger/ActivityHeatmap.svelte';
	import { getAllWorkouts, getWorkoutDatesMap, deleteWorkout } from '$lib/db/workouts';
	import { calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { Calendar, Clock, Dumbbell, Trash2 } from '@lucide/svelte';

	let workouts = $state<WorkoutLog[]>([]);
	let heatmapData = $state(new Map<string, number>());
	let loading = $state(true);
	let prefs = $derived(getPreferences());

	onMount(async () => {
		await refreshData();
	});

	async function refreshData() {
		loading = true;
		try {
			workouts = await getAllWorkouts();
			heatmapData = await getWorkoutDatesMap();
		} finally {
			loading = false;
		}
	}

	async function handleDelete(e: Event, workout: WorkoutLog) {
		e.preventDefault();
		e.stopPropagation();
		if (!confirm(`Delete workout from ${new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}? This cannot be undone.`)) return;
		await deleteWorkout(workout.id);
		await refreshData();
	}
</script>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight">Workout History</h1>
		<p class="text-sm text-muted-foreground">{workouts.length} workouts logged</p>
	</div>

	<!-- Heatmap -->
	<div class="space-y-3">
		<h2 class="flex items-center gap-2 text-sm font-semibold">
			<Calendar class="h-4 w-4 text-muted-foreground" />
			Activity Heatmap
		</h2>
		<ActivityHeatmap data={heatmapData} size="large" />
	</div>

	<!-- Workout List -->
	{#if loading}
		<div class="space-y-2">
			{#each [1, 2, 3, 4, 5] as _}
				<div class="h-20 animate-pulse rounded-lg bg-muted"></div>
			{/each}
		</div>
	{:else if workouts.length === 0}
		<div class="rounded-lg border border-dashed border-border py-12 text-center">
			<Dumbbell class="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
			<p class="text-muted-foreground">No workouts yet</p>
			<a href="/workout" class="mt-2 inline-block text-sm text-primary hover:underline">
				Start your first workout
			</a>
		</div>
	{:else}
		<div class="space-y-2">
			{#each workouts as workout (workout.id)}
				<div class="relative rounded-lg border border-border transition-colors active:bg-muted/50 hover:bg-muted/50">
					<a
						href="/history/{workout.date}"
						class="block p-4"
					>
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">
									{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
										year: 'numeric'
									})}
								</p>
								<p class="mt-0.5 text-sm text-muted-foreground">
									{workout.exercises.length} exercises &middot;
									{workout.exercises.reduce(
										(sum, e) => sum + e.sets.filter((s) => s.completed).length,
										0
									)} sets
								</p>
							</div>
							<div class="text-right pr-8">
								<p class="flex items-center justify-end gap-1 text-sm tabular-nums">
									<Clock class="h-3 w-3" />
									{formatDuration(workout.duration)}
								</p>
								<p class="text-xs text-muted-foreground">
									{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}
								</p>
							</div>
						</div>

						<div class="mt-2 flex flex-wrap gap-1">
							{#each workout.exercises as ex}
								<span class="rounded-md bg-muted px-2 py-0.5 text-xs">{ex.exerciseName}</span>
							{/each}
						</div>
					</a>
					<!-- Delete button -->
					<button
						onclick={(e) => handleDelete(e, workout)}
						class="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
						title="Delete workout"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
