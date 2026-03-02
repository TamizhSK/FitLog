<script lang="ts">
	import { onMount } from 'svelte';
	import ActivityHeatmap from '$lib/components/logger/ActivityHeatmap.svelte';
	import { getAllWorkouts, getWorkoutDatesMap } from '$lib/db/workouts';
	import { calculateStreak, calculateWeeklyStats, calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { Play, Flame, Calendar, Dumbbell, TrendingUp, Clock, ChevronRight, Zap } from '@lucide/svelte';

	let workouts = $state<WorkoutLog[]>([]);
	let heatmapData = $state(new Map<string, number>());
	let loading = $state(true);
	let mounted = $state(false);

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

	// Motivational taglines — rotated daily
	const taglines = [
		'Every rep writes your story.',
		'Discipline is your superpower.',
		'Stronger than yesterday.',
		'Your body keeps the score.',
		'The iron never lies.',
		'Build the habit. Become the proof.',
		'One more set. One more step.',
	];
	const tagline = taglines[new Date().getDay() % taglines.length];

	// Scroll-reveal action using IntersectionObserver
	function reveal(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('revealed');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	onMount(async () => {
		// Trigger entrance animations after hydration
		requestAnimationFrame(() => {
			mounted = true;
		});
		try {
			workouts = await getAllWorkouts();
			heatmapData = await getWorkoutDatesMap();
		} finally {
			loading = false;
		}
	});
</script>

<!-- Hero Section — breaks out of container for full-width atmosphere -->
<div class="hero-breakout">
	<div class="hero-section">
		<!-- Radial glow -->
		<div class="hero-glow"></div>
		<!-- Grain overlay -->
		<div class="hero-grain"></div>

		<!-- Hero content -->
		<div class="hero-content" class:hero-entered={mounted}>
			<!-- Date pill -->
			<div class="hero-date-pill">
				<Calendar class="h-3 w-3 opacity-60" />
				<span>{today}</span>
			</div>

			<!-- Greeting -->
			<h1 class="hero-greeting">
				{greeting}{prefs.userName ? ',' : ''}
				{#if prefs.userName}
					<span class="hero-name">{prefs.userName}</span>
				{/if}
			</h1>

			<!-- Tagline -->
			<p class="hero-tagline">{tagline}</p>

			<!-- CTA Button -->
			<a href="/workout" class="hero-cta">
				<span class="hero-cta-glow"></span>
				<span class="hero-cta-inner">
					<Play class="h-5 w-5" fill="currentColor" />
					<span>Start Workout</span>
				</span>
			</a>
		</div>
	</div>
</div>

<!-- Stats Cards -->
<div class="stats-grid" class:stats-entered={mounted}>
	<div class="stat-card stat-card-streak">
		<div class="stat-icon-ring stat-icon-orange">
			<Flame class="h-4 w-4" />
		</div>
		<span class="stat-value">{streak}</span>
		<span class="stat-label">Day Streak</span>
	</div>

	<div class="stat-card stat-card-weekly">
		<div class="stat-icon-ring stat-icon-blue">
			<Zap class="h-4 w-4" />
		</div>
		<span class="stat-value">{weeklyStats.workoutCount}</span>
		<span class="stat-label">This Week</span>
	</div>

	<div class="stat-card stat-card-volume">
		<div class="stat-icon-ring stat-icon-green">
			<TrendingUp class="h-4 w-4" />
		</div>
		<span class="stat-value stat-value-sm">{formatVolume(weeklyStats.totalVolume, prefs.weightUnit)}</span>
		<span class="stat-label">Volume</span>
	</div>
</div>

<!-- Activity Heatmap — scroll revealed -->
<div class="section-reveal" use:reveal>
	<div class="section-header">
		<div class="section-header-icon">
			<Calendar class="h-4 w-4 text-emerald-400" />
		</div>
		<h2 class="section-title">Activity</h2>
	</div>
	<div class="heatmap-card">
		<ActivityHeatmap data={heatmapData} />
	</div>
</div>

<!-- Recent Workouts — scroll revealed -->
<div class="section-reveal" use:reveal>
	<div class="section-header">
		<div class="section-header-icon">
			<Dumbbell class="h-4 w-4 text-violet-400" />
		</div>
		<h2 class="section-title">Recent Workouts</h2>
		{#if workouts.length > 0}
			<a href="/history" class="section-link">
				View all
				<ChevronRight class="h-3.5 w-3.5" />
			</a>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each [1, 2, 3] as _}
				<div class="h-[68px] animate-pulse rounded-2xl bg-white/[0.03]"></div>
			{/each}
		</div>
	{:else if recentWorkouts.length === 0}
		<div class="empty-state">
			<div class="empty-state-icon">
				<Dumbbell class="h-7 w-7 text-muted-foreground/20" />
			</div>
			<p class="text-sm text-muted-foreground/60">No workouts yet</p>
			<p class="text-xs text-muted-foreground/40">Start your first one above</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each recentWorkouts as workout, i (workout.id)}
				<a
					href="/history/{workout.date}"
					class="workout-row"
					style="--row-delay: {i * 60}ms"
				>
					<div class="workout-row-left">
						<p class="workout-row-date">
							{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
								weekday: 'short',
								month: 'short',
								day: 'numeric'
							})}
						</p>
						<p class="workout-row-meta">
							{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
						</p>
					</div>
					<div class="workout-row-right">
						<p class="workout-row-duration">
							<Clock class="h-3 w-3 opacity-40" />
							{formatDuration(workout.duration)}
						</p>
						<p class="workout-row-volume">
							{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}
						</p>
					</div>
					<ChevronRight class="h-4 w-4 text-muted-foreground/30" />
				</a>
			{/each}
		</div>
	{/if}
</div>

<!-- Bottom breathing room -->
<div class="h-6"></div>

<style>
	/* ============================================
	   HERO SECTION — Full-width atmospheric hero
	   ============================================ */
	.hero-breakout {
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		margin-top: -1rem;
		overflow: hidden;
	}

	.hero-section {
		position: relative;
		padding: 2.5rem 1.5rem 2rem;
		min-height: 260px;
		display: flex;
		align-items: flex-end;
	}

	.hero-glow {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 70% at 50% 100%, oklch(0.45 0.16 45 / 0.2), transparent 70%),
			radial-gradient(ellipse 60% 50% at 30% 80%, oklch(0.4 0.12 25 / 0.1), transparent 60%),
			radial-gradient(ellipse 50% 40% at 70% 90%, oklch(0.5 0.15 280 / 0.06), transparent 50%);
		pointer-events: none;
	}

	:global(:root:not(.dark)) .hero-glow {
		background:
			radial-gradient(ellipse 80% 70% at 50% 100%, oklch(0.7 0.12 45 / 0.15), transparent 70%),
			radial-gradient(ellipse 60% 50% at 30% 80%, oklch(0.65 0.08 25 / 0.08), transparent 60%);
	}

	.hero-grain {
		position: absolute;
		inset: 0;
		opacity: 0.3;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 128px 128px;
		mix-blend-mode: overlay;
	}

	.hero-content {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	/* ---- Entrance Animations (spring-like) ---- */
	.hero-content > * {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.hero-entered > * {
		opacity: 1;
		transform: translateY(0);
	}
	.hero-entered > :nth-child(1) { transition-delay: 0ms; }
	.hero-entered > :nth-child(2) { transition-delay: 80ms; }
	.hero-entered > :nth-child(3) { transition-delay: 140ms; }
	.hero-entered > :nth-child(4) { transition-delay: 220ms; }

	@media (prefers-reduced-motion: reduce) {
		.hero-content > * {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}

	/* ---- Date Pill ---- */
	.hero-date-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		background: oklch(1 0 0 / 0.06);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--muted-foreground);
		width: fit-content;
		border: 1px solid oklch(1 0 0 / 0.06);
	}

	:global(:root:not(.dark)) .hero-date-pill {
		background: oklch(0 0 0 / 0.04);
		border-color: oklch(0 0 0 / 0.06);
	}

	/* ---- Greeting ---- */
	.hero-greeting {
		font-size: 1.75rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.15;
		color: var(--foreground);
	}

	.hero-name {
		background: linear-gradient(135deg, oklch(0.75 0.14 45), oklch(0.7 0.18 25));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	:global(:root:not(.dark)) .hero-name {
		background: linear-gradient(135deg, oklch(0.55 0.18 45), oklch(0.5 0.2 25));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* ---- Tagline ---- */
	.hero-tagline {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		font-weight: 400;
		letter-spacing: 0.01em;
		opacity: 0.8;
	}

	/* ---- CTA Button ---- */
	.hero-cta {
		position: relative;
		display: inline-flex;
		width: 100%;
		margin-top: 0.5rem;
		border-radius: 1rem;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}

	.hero-cta-glow {
		position: absolute;
		inset: -1px;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.65 0.18 45), oklch(0.55 0.2 25), oklch(0.5 0.15 280));
		opacity: 0.7;
		filter: blur(0px);
		transition: opacity 0.3s ease, filter 0.3s ease;
	}

	.hero-cta:hover .hero-cta-glow,
	.hero-cta:active .hero-cta-glow {
		opacity: 1;
		filter: blur(12px);
	}

	.hero-cta-inner {
		position: relative;
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
		letter-spacing: 0.01em;
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
		            box-shadow 0.2s ease;
		box-shadow: 0 2px 12px oklch(0.5 0.18 35 / 0.25),
		            inset 0 1px 0 oklch(1 0 0 / 0.12);
	}

	.hero-cta:hover .hero-cta-inner {
		transform: scale(1.01);
	}

	.hero-cta:active .hero-cta-inner {
		transform: scale(0.98);
		box-shadow: 0 1px 6px oklch(0.5 0.18 35 / 0.2),
		            inset 0 1px 0 oklch(1 0 0 / 0.08);
	}

	/* ============================================
	   STAT CARDS — Glassmorphic with icon halos
	   ============================================ */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.625rem;
		margin-top: 1.25rem;
	}

	.stats-grid > * {
		opacity: 0;
		transform: translateY(14px) scale(0.97);
		transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.stats-entered > * {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
	.stats-entered > :nth-child(1) { transition-delay: 300ms; }
	.stats-entered > :nth-child(2) { transition-delay: 380ms; }
	.stats-entered > :nth-child(3) { transition-delay: 460ms; }

	@media (prefers-reduced-motion: reduce) {
		.stats-grid > * {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 1rem 0.5rem;
		border-radius: 1rem;
		background: oklch(1 0 0 / 0.04);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid oklch(1 0 0 / 0.07);
		transition: border-color 0.25s ease, background 0.25s ease;
	}

	:global(:root:not(.dark)) .stat-card {
		background: oklch(0 0 0 / 0.02);
		border-color: oklch(0 0 0 / 0.07);
	}

	.stat-card-streak:hover { border-color: oklch(0.7 0.15 45 / 0.3); }
	.stat-card-weekly:hover { border-color: oklch(0.6 0.15 250 / 0.3); }
	.stat-card-volume:hover { border-color: oklch(0.6 0.15 155 / 0.3); }

	/* Icon rings with glow */
	.stat-icon-ring {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.stat-icon-orange {
		background: oklch(0.7 0.15 45 / 0.15);
		color: oklch(0.75 0.16 45);
		box-shadow: 0 0 12px oklch(0.7 0.16 45 / 0.15);
	}
	.stat-icon-blue {
		background: oklch(0.6 0.15 250 / 0.15);
		color: oklch(0.7 0.17 250);
		box-shadow: 0 0 12px oklch(0.6 0.17 250 / 0.15);
	}
	.stat-icon-green {
		background: oklch(0.6 0.15 155 / 0.15);
		color: oklch(0.7 0.17 155);
		box-shadow: 0 0 12px oklch(0.6 0.17 155 / 0.15);
	}

	.stat-value {
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.stat-value-sm {
		font-size: 1rem;
	}

	.stat-label {
		font-size: 0.625rem;
		font-weight: 500;
		color: var(--muted-foreground);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	/* ============================================
	   SECTIONS — Scroll-revealed
	   ============================================ */
	.section-reveal {
		margin-top: 2rem;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.section-reveal:global(.revealed) {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.section-reveal {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.section-header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.375rem;
		background: oklch(1 0 0 / 0.05);
	}

	:global(:root:not(.dark)) .section-header-icon {
		background: oklch(0 0 0 / 0.04);
	}

	.section-title {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.section-link {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.125rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(0.7 0.14 45);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.section-link:hover {
		opacity: 0.8;
	}

	/* Heatmap card */
	.heatmap-card {
		border-radius: 1rem;
		background: oklch(1 0 0 / 0.03);
		border: 1px solid oklch(1 0 0 / 0.06);
		padding: 0.75rem;
		overflow: hidden;
	}

	:global(:root:not(.dark)) .heatmap-card {
		background: oklch(0 0 0 / 0.015);
		border-color: oklch(0 0 0 / 0.06);
	}

	/* ============================================
	   WORKOUT ROWS — Recent workouts list
	   ============================================ */
	.workout-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0.875rem;
		border-radius: 1rem;
		background: oklch(1 0 0 / 0.03);
		border: 1px solid oklch(1 0 0 / 0.06);
		text-decoration: none;
		color: inherit;
		transition: background 0.2s ease, border-color 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	:global(:root:not(.dark)) .workout-row {
		background: oklch(0 0 0 / 0.015);
		border-color: oklch(0 0 0 / 0.06);
	}

	.workout-row:hover,
	.workout-row:active {
		background: oklch(1 0 0 / 0.06);
		border-color: oklch(1 0 0 / 0.1);
	}

	:global(:root:not(.dark)) .workout-row:hover,
	:global(:root:not(.dark)) .workout-row:active {
		background: oklch(0 0 0 / 0.03);
		border-color: oklch(0 0 0 / 0.1);
	}

	.workout-row-left {
		flex: 1;
		min-width: 0;
	}

	.workout-row-date {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.workout-row-meta {
		font-size: 0.7rem;
		color: var(--muted-foreground);
		margin-top: 0.125rem;
	}

	.workout-row-right {
		text-align: right;
	}

	.workout-row-duration {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.25rem;
		font-size: 0.8rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.workout-row-volume {
		font-size: 0.7rem;
		color: var(--muted-foreground);
		margin-top: 0.125rem;
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 2.5rem 1rem;
		border-radius: 1rem;
		border: 1px dashed oklch(1 0 0 / 0.08);
	}

	:global(:root:not(.dark)) .empty-state {
		border-color: oklch(0 0 0 / 0.1);
	}

	.empty-state-icon {
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: oklch(1 0 0 / 0.03);
		margin-bottom: 0.25rem;
	}
</style>
