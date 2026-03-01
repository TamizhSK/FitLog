<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import ActivityHeatmap from '$lib/components/logger/ActivityHeatmap.svelte';
	import { getAllWorkouts, getWorkoutDatesMap } from '$lib/db/workouts';
	import { calculateStreak, calculateWeeklyStats, calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { Play, Flame, Calendar, Dumbbell, TrendingUp, Clock } from '@lucide/svelte';

	let workouts = $state<WorkoutLog[]>([]);
	let heatmapData = $state(new Map<string, number>());
	let loading = $state(true);

	let streak = $derived(calculateStreak(workouts));
	let weeklyStats = $derived(calculateWeeklyStats(workouts));
	let recentWorkouts = $derived(workouts.slice(0, 3));
	let prefs = $derived(getPreferences());

	const today = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric'
	});

	const greeting = (() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	})();

	onMount(async () => {
		try {
			workouts = await getAllWorkouts();
			heatmapData = await getWorkoutDatesMap();
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-8">
	<!-- Greeting -->
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight">{greeting}{prefs.userName ? `, ${prefs.userName}` : ''}</h1>
		<p class="text-sm text-muted-foreground">{today}</p>
	</div>

	<!-- Start Workout CTA -->
	<Button href="/workout" size="lg" class="w-full gap-2 py-6 text-base">
		<Play class="h-5 w-5" />
		Start Workout
	</Button>

	<!-- Quick Stats -->
	<div class="grid grid-cols-3 gap-2 sm:gap-3">
		<div class="rounded-xl border border-border p-2.5 text-center sm:p-4">
			<div class="flex items-center justify-center gap-1">
				<Flame class="h-3.5 w-3.5 text-orange-400 sm:h-4 sm:w-4" />
				<span class="text-xl font-bold tabular-nums sm:text-2xl">{streak}</span>
			</div>
			<p class="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">Day Streak</p>
		</div>
		<div class="rounded-xl border border-border p-2.5 text-center sm:p-4">
			<div class="flex items-center justify-center gap-1">
				<Calendar class="h-3.5 w-3.5 text-blue-400 sm:h-4 sm:w-4" />
				<span class="text-xl font-bold tabular-nums sm:text-2xl">{weeklyStats.workoutCount}</span>
			</div>
			<p class="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">This Week</p>
		</div>
		<div class="rounded-xl border border-border p-2.5 text-center sm:p-4">
			<div class="flex items-center justify-center gap-1">
				<TrendingUp class="h-3.5 w-3.5 text-green-400 sm:h-4 sm:w-4" />
				<span class="text-base font-bold tabular-nums sm:text-lg">{formatVolume(weeklyStats.totalVolume, prefs.weightUnit)}</span>
			</div>
			<p class="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">Volume</p>
		</div>
	</div>

	<Separator />

	<!-- Activity Heatmap -->
	<div class="space-y-2">
		<h2 class="flex items-center gap-2 text-sm font-semibold">
			<Calendar class="h-4 w-4 text-emerald-500" />
			Activity
		</h2>
		<ActivityHeatmap data={heatmapData} />
	</div>

	<!-- Recent Workouts — secondary -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<h2 class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Workouts</h2>
			{#if workouts.length > 0}
				<a href="/history" class="text-xs text-primary hover:underline">View all</a>
			{/if}
		</div>

		{#if loading}
			<div class="space-y-2">
				{#each [1, 2, 3] as _}
					<div class="h-16 animate-pulse rounded-lg bg-muted"></div>
				{/each}
			</div>
		{:else if recentWorkouts.length === 0}
			<div class="rounded-lg border border-dashed border-border py-8 text-center">
				<Dumbbell class="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
				<p class="text-sm text-muted-foreground">No workouts yet. Start your first one!</p>
			</div>
		{:else}
			<div class="space-y-1.5">
				{#each recentWorkouts as workout (workout.id)}
					<a
						href="/history/{workout.date}"
						class="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 transition-colors active:bg-muted/50 hover:bg-muted/50"
					>
						<div>
							<p class="text-sm font-medium">
								{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
									weekday: 'short',
									month: 'short',
									day: 'numeric'
								})}
							</p>
							<p class="text-xs text-muted-foreground">
								{workout.exercises.length} exercises
							</p>
						</div>
						<div class="text-right">
							<p class="flex items-center gap-1 text-sm tabular-nums">
								<Clock class="h-3 w-3" />
								{formatDuration(workout.duration)}
							</p>
							<p class="text-xs text-muted-foreground">
								{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
