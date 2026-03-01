<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { getWorkoutsByDate, deleteWorkout } from '$lib/db/workouts';
	import { calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration, startWorkout } from '$lib/stores/workout.svelte';
	import { loadExercises, getExerciseById } from '$lib/stores/exercises.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { ArrowLeft, Clock, Dumbbell, Repeat, Loader2, Trash2 } from '@lucide/svelte';

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

<div class="space-y-6">
	<a
		href="/history"
		class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		Back to history
	</a>

	<h1 class="text-2xl font-bold tracking-tight">{formattedDate}</h1>

	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if workouts.length === 0}
		<div class="rounded-lg border border-dashed border-border py-12 text-center">
			<Dumbbell class="mx-auto mb-3 h-10 w-10 text-muted-foreground/20" />
			<p class="text-muted-foreground">No workouts on this day</p>
		</div>
	{:else}
		{#each workouts as workout (workout.id)}
			<div class="space-y-4 rounded-xl border border-border p-4">
				<!-- Summary stats -->
				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span class="flex items-center gap-1">
						<Clock class="h-4 w-4" />
						{formatDuration(workout.duration)}
					</span>
					<span>{workout.exercises.length} exercises</span>
					<span>{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}</span>
				</div>

				<Separator />

				<!-- Exercise details -->
				{#each workout.exercises as ex, i}
					<div class="space-y-2">
						<a
							href="/exercises/{ex.exerciseId}"
							class="font-semibold hover:text-primary"
						>
							{ex.exerciseName}
						</a>

						<div class="overflow-x-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="text-xs text-muted-foreground">
										<th class="w-12 py-1 text-left">Set</th>
										<th class="py-1 text-right">{prefs.weightUnit}</th>
										<th class="py-1 text-right">Reps</th>
										<th class="py-1 text-right">Volume</th>
									</tr>
								</thead>
								<tbody>
									{#each ex.sets.filter((s) => s.completed) as set}
										<tr>
											<td class="py-1 tabular-nums">{set.setNumber}</td>
											<td class="py-1 text-right tabular-nums">{set.weight ?? '—'}</td>
											<td class="py-1 text-right tabular-nums">{set.reps}</td>
											<td class="py-1 text-right tabular-nums">
												{set.weight ? Math.round(set.weight * set.reps) : '—'}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					{#if i < workout.exercises.length - 1}
						<Separator />
					{/if}
				{/each}

				<!-- Actions -->
				<div class="flex gap-2">
					<Button variant="outline" class="flex-1 gap-2" onclick={() => repeatWorkout(workout)}>
						<Repeat class="h-4 w-4" />
						Repeat Workout
					</Button>
					<Button variant="outline" class="gap-2 text-destructive hover:bg-destructive/10" onclick={() => handleDelete(workout)}>
						<Trash2 class="h-4 w-4" />
						Delete
					</Button>
				</div>
			</div>
		{/each}
	{/if}
</div>
