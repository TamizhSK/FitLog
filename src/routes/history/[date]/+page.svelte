<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { getWorkoutsByDate, deleteWorkout } from '$lib/db/workouts';
	import { calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration, startWorkout } from '$lib/stores/workout.svelte';
	import { loadExercises, getExerciseById } from '$lib/stores/exercises.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { ArrowLeft, Clock, Dumbbell, Repeat, Loader2, Trash2, TrendingUp } from '@lucide/svelte';

	let workouts = $state<WorkoutLog[]>([]);
	let loading = $state(true);
	let prefs = $derived(getPreferences());

	let dateStr = $derived(page.params.date);
	let formattedDate = $derived(
		new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		})
	);

	onMount(async () => {
		await loadExercises();
		await refreshData();
	});

	async function refreshData() {
		loading = true;
		try {
			workouts = await getWorkoutsByDate(dateStr);
		} finally {
			loading = false;
		}
	}

	async function repeatWorkout(workout: WorkoutLog) {
		const exercises = workout.exercises
			.map((e) => getExerciseById(e.exerciseId))
			.filter((e): e is NonNullable<typeof e> => !!e);
		if (exercises.length > 0) {
			startWorkout(exercises);
			goto('/workout/active');
		}
	}

	async function handleDelete(workout: WorkoutLog) {
		if (!confirm('Delete this workout? This cannot be undone.')) return;
		await deleteWorkout(workout.id);
		await refreshData();
		if (workouts.length === 0) {
			goto('/history');
		}
	}
</script>

<div class="fl-page-enter space-y-6">
	<a
		href="/history"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Back to history
	</a>

	<h1 class="fl-page-title">{formattedDate}</h1>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground/40" />
		</div>
	{:else if workouts.length === 0}
		<div class="fl-surface flex flex-col items-center gap-3 py-12 text-center">
			<Dumbbell class="h-10 w-10 text-muted-foreground/15" />
			<p class="text-sm text-muted-foreground/60">No workouts on this day</p>
		</div>
	{:else}
		{#each workouts as workout (workout.id)}
			<div class="fl-surface space-y-4 p-4">
				<!-- Summary stats -->
				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span class="flex items-center gap-1.5">
						<Clock class="h-3.5 w-3.5 opacity-50" />
						{formatDuration(workout.duration)}
					</span>
					<span>{workout.exercises.length} exercises</span>
					<span class="flex items-center gap-1">
						<TrendingUp class="h-3 w-3 opacity-50" />
						{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}
					</span>
				</div>

				<div class="h-px bg-border/50"></div>

				<!-- Exercise details -->
				{#each workout.exercises as ex, i}
					<div class="space-y-2">
						<a
							href="/exercises/{ex.exerciseId}"
							class="text-sm font-semibold transition-colors hover:text-[oklch(0.7_0.14_45)]"
						>
							{ex.exerciseName}
						</a>

						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-[0.6875rem] text-muted-foreground/70">
										<th class="w-12 py-1.5 text-left font-medium">Set</th>
										<th class="py-1.5 text-right font-medium">{prefs.weightUnit}</th>
										<th class="py-1.5 text-right font-medium">Reps</th>
										<th class="py-1.5 text-right font-medium">Volume</th>
									</tr>
								</thead>
								<tbody>
									{#each ex.sets.filter((s) => s.completed) as set}
										<tr>
											<td class="py-1 tabular-nums text-muted-foreground">{set.setNumber}</td>
											<td class="py-1 text-right tabular-nums">{set.weight ?? '—'}</td>
											<td class="py-1 text-right tabular-nums">{set.reps}</td>
											<td class="py-1 text-right tabular-nums text-muted-foreground">
												{set.weight ? Math.round(set.weight * set.reps) : '—'}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					{#if i < workout.exercises.length - 1}
						<div class="h-px bg-border/30"></div>
					{/if}
				{/each}

				<!-- Actions -->
				<div class="flex gap-2 pt-1">
					<button onclick={() => repeatWorkout(workout)} class="action-btn action-btn-primary">
						<Repeat class="h-4 w-4" />
						Repeat Workout
					</button>
					<button onclick={() => handleDelete(workout)} class="action-btn action-btn-danger">
						<Trash2 class="h-4 w-4" />
						Delete
					</button>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.action-btn {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.action-btn:active {
		transform: scale(0.97);
	}

	.action-btn-primary {
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--foreground);
	}
	.action-btn-primary:hover {
		background: oklch(0.22 0.006 286);
		border-color: oklch(1 0 0 / 0.12);
	}
	:global(:root:not(.dark)) .action-btn-primary {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .action-btn-primary:hover {
		background: oklch(0.97 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}

	.action-btn-danger {
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--muted-foreground);
	}
	.action-btn-danger:hover {
		color: var(--destructive);
		border-color: oklch(0.6 0.2 25 / 0.25);
		background: oklch(0.2 0.02 25);
	}
	:global(:root:not(.dark)) .action-btn-danger {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .action-btn-danger:hover {
		border-color: oklch(0.5 0.2 25 / 0.25);
		background: oklch(0.97 0.01 25);
	}
</style>
