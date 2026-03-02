<script lang="ts">
	import { onMount } from 'svelte';
	import ActivityHeatmap from '$lib/components/logger/ActivityHeatmap.svelte';
	import { getAllWorkouts, getWorkoutDatesMap, deleteWorkout } from '$lib/db/workouts';
	import { calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { Calendar, Clock, Dumbbell, Trash2, ChevronRight } from '@lucide/svelte';

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

<div class="fl-page-enter space-y-6">
	<div class="fl-page-header">
		<h1 class="fl-page-title">Workout History</h1>
		<p class="fl-page-subtitle">{workouts.length} workouts logged</p>
	</div>

	<!-- Heatmap -->
	<div>
		<div class="fl-section-header">
			<div class="fl-section-icon">
				<Calendar class="h-4 w-4 text-emerald-400" />
			</div>
			<h2 class="fl-section-label">Activity Heatmap</h2>
		</div>
		<div class="fl-surface overflow-hidden p-3">
			<ActivityHeatmap data={heatmapData} size="large" />
		</div>
	</div>

	<!-- Workout List -->
	{#if loading}
		<div class="space-y-2">
			{#each [1, 2, 3, 4, 5] as _}
				<div class="h-20 animate-pulse rounded-2xl bg-white/[0.03]"></div>
			{/each}
		</div>
	{:else if workouts.length === 0}
		<div class="fl-surface flex flex-col items-center gap-3 py-12 text-center">
			<Dumbbell class="h-10 w-10 text-muted-foreground/15" />
			<div>
				<p class="text-sm text-muted-foreground/60">No workouts yet</p>
				<a href="/workout" class="mt-1 inline-block text-sm text-[oklch(0.7_0.14_45)] hover:opacity-80">
					Start your first workout
				</a>
			</div>
		</div>
	{:else}
		<div class="space-y-2">
			{#each workouts as workout (workout.id)}
				<div class="history-card">
					<a
						href="/history/{workout.date}"
						class="block p-3.5"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<p class="text-[0.9375rem] font-semibold tracking-tight">
									{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric'
									})}
								</p>
								<div class="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
									<span class="flex items-center gap-1">
										<Clock class="h-3 w-3 opacity-50" />
										{formatDuration(workout.duration)}
									</span>
									<span>{workout.exercises.length} exercises</span>
									<span>{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}</span>
								</div>
							</div>
							<div class="flex items-center gap-1.5 pt-0.5">
								<button
									onclick={(e) => handleDelete(e, workout)}
									class="delete-btn"
									title="Delete workout"
								>
									<Trash2 class="h-3.5 w-3.5" />
								</button>
								<ChevronRight class="h-4 w-4 text-muted-foreground/30" />
							</div>
						</div>

						<div class="mt-2.5 flex flex-wrap gap-1">
							{#each workout.exercises as ex}
								<span class="exercise-pill">{ex.exerciseName}</span>
							{/each}
						</div>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.history-card {
		border-radius: 1rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.history-card:hover {
		background: oklch(0.22 0.006 286);
		border-color: oklch(1 0 0 / 0.12);
	}
	.history-card:active {
		transform: scale(0.98);
	}
	:global(:root:not(.dark)) .history-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
	}
	:global(:root:not(.dark)) .history-card:hover {
		background: oklch(0.97 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}

	.exercise-pill {
		padding: 0.1875rem 0.5rem;
		border-radius: 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		background: oklch(0.24 0.006 286);
		color: var(--muted-foreground);
	}
	:global(:root:not(.dark)) .exercise-pill {
		background: oklch(0.94 0 0);
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		color: var(--muted-foreground);
		transition: color 0.15s ease, background 0.15s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.delete-btn:hover {
		color: var(--destructive);
		background: oklch(0.6 0.2 25 / 0.1);
	}
	.delete-btn:active {
		transform: scale(0.9);
	}
</style>
