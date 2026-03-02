<script lang="ts">
	import { onMount } from 'svelte';
	import ActivityHeatmap from '$lib/components/logger/ActivityHeatmap.svelte';
	import { getAllWorkouts, getWorkoutDatesMap } from '$lib/db/workouts';
	import { calculateStreak, calculateWeeklyStats, calculateTotalVolume, formatVolume } from '$lib/utils/stats';
	import { formatDuration } from '$lib/stores/workout.svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import type { WorkoutLog } from '$lib/types/workout';
	import { Play, Flame, Calendar, Dumbbell, TrendingUp, Clock, ChevronRight, Zap } from '@lucide/svelte';
	import { getGradientPreset } from '$lib/utils/gradients';

	const gradient = getGradientPreset();

	function splitVolume(volume: number, unit: 'kg' | 'lbs'): { num: string; unit: string } {
		if (volume >= 1000) return { num: `${(volume / 1000).toFixed(1)}k`, unit };
		return { num: `${Math.round(volume)}`, unit };
	}

	let workouts = $state<WorkoutLog[]>([]);
	let heatmapData = $state(new Map<string, number>());
	let loading = $state(true);
	let mounted = $state(false);

	let streak = $derived(calculateStreak(workouts));
	let weeklyStats = $derived(calculateWeeklyStats(workouts));
	let recentWorkouts = $derived(workouts.slice(0, 3));
	let prefs = $derived(getPreferences());
	let vol = $derived(splitVolume(weeklyStats.totalVolume, prefs.weightUnit));

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

	const quotesByTime: Record<string, { text: string; author: string }[]> = {
		morning: [
			{ text: 'The last three or four reps is what makes the muscle grow.', author: 'Arnold Schwarzenegger' },
			{ text: 'The only bad workout is the one that didn\'t happen.', author: 'Dwayne Johnson' },
			{ text: 'Wake up determined. Go to bed satisfied.', author: 'Dwayne Johnson' },
			{ text: 'If something stands between you and your success, move it.', author: 'Dwayne Johnson' },
			{ text: 'Success isn\'t always about greatness. It\'s about consistency.', author: 'Dwayne Johnson' },
			{ text: 'The resistance that you fight physically in the gym strengthens you.', author: 'Arnold Schwarzenegger' },
		],
		afternoon: [
			{ text: 'Strength does not come from the body. It comes from the will.', author: 'Mahatma Gandhi' },
			{ text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Arnold Schwarzenegger' },
			{ text: 'No man has the right to be an amateur in the matter of physical training.', author: 'Socrates' },
			{ text: 'The clock is ticking. Are you becoming the person you want to be?', author: 'Greg Plitt' },
			{ text: 'What hurts today makes you stronger tomorrow.', author: 'Jay Cutler' },
			{ text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'David Goggins' },
		],
		evening: [
			{ text: 'I hated every minute of training, but I said don\'t quit.', author: 'Muhammad Ali' },
			{ text: 'We are what we repeatedly do. Excellence is not an act but a habit.', author: 'Aristotle' },
			{ text: 'The hard days are the best because that\'s when champions are made.', author: 'Gabby Douglas' },
			{ text: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
			{ text: 'Once you learn to quit, it becomes a habit.', author: 'Vince Lombardi' },
			{ text: 'Don\'t count the days. Make the days count.', author: 'Muhammad Ali' },
		],
		night: [
			{ text: 'The fight is won or lost far away from witnesses.', author: 'Muhammad Ali' },
			{ text: 'Rest when you\'re weary. Refresh and renew yourself, then get back to work.', author: 'Ralph Marston' },
			{ text: 'Sleep is the best meditation.', author: 'Dalai Lama' },
			{ text: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn' },
			{ text: 'Recovery is just as important as the workout itself.', author: 'Ronnie Coleman' },
			{ text: 'The successful warrior is the average man with laser-like focus.', author: 'Bruce Lee' },
		],
	};

	const quote = (() => {
		const hour = new Date().getHours();
		let period: string;
		if (hour >= 5 && hour < 12) period = 'morning';
		else if (hour >= 12 && hour < 17) period = 'afternoon';
		else if (hour >= 17 && hour < 21) period = 'evening';
		else period = 'night';
		const pool = quotesByTime[period];
		return pool[new Date().getDay() % pool.length];
	})();

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
		return { destroy() { observer.disconnect(); } };
	}

	onMount(async () => {
		requestAnimationFrame(() => { mounted = true; });
		try {
			workouts = await getAllWorkouts();
			heatmapData = await getWorkoutDatesMap();
		} finally {
			loading = false;
		}
	});
</script>

<!-- ======== HERO BANNER ======== -->
<div class="hero-wrap">
	<div
		class="hero-banner"
		style="--hero-base:{gradient.base};--hero-base-light:{gradient.baseLight};--orb1:{gradient.orb1};--orb2:{gradient.orb2};--orb3:{gradient.orb3};--orb1-light:{gradient.orb1Light};--orb2-light:{gradient.orb2Light};--orb3-light:{gradient.orb3Light}"
	>
		<!-- Animated gradient orbs -->
		<div class="hero-orb hero-orb-1"></div>
		<div class="hero-orb hero-orb-2"></div>
		<div class="hero-orb hero-orb-3"></div>

		<!-- Noise texture -->
		<div class="hero-grain"></div>

		<!-- Content -->
		<div class="hero-content" class:hero-entered={mounted}>
			<span class="hero-date">{today}</span>
			<h1 class="hero-title">
				{greeting}{#if prefs.userName},<br/><span class="hero-name">{prefs.userName}</span>{/if}
			</h1>
			<p class="hero-tagline">"{quote.text}" <span class="hero-quote-author">— {quote.author}</span></p>
			<a href="/workout" class="hero-cta">
				<Play class="h-5 w-5" fill="currentColor" />
				<span>Start Workout</span>
			</a>
		</div>
	</div>
</div>

<!-- ======== STAT CARDS ======== -->
<div class="stats-grid" class:stats-entered={mounted}>
	<div class="stat-card">
		<div class="stat-icon-ring stat-ring-orange">
			<Flame class="h-[18px] w-[18px]" />
		</div>
		<span class="stat-value">{streak}</span>
		<span class="stat-label">Day Streak</span>
	</div>
	<div class="stat-card">
		<div class="stat-icon-ring stat-ring-blue">
			<Zap class="h-[18px] w-[18px]" />
		</div>
		<span class="stat-value">{weeklyStats.workoutCount}</span>
		<span class="stat-label">This Week</span>
	</div>
	<div class="stat-card">
		<div class="stat-icon-ring stat-ring-green">
			<TrendingUp class="h-[18px] w-[18px]" />
		</div>
		<span class="stat-value">{vol.num}<span class="stat-unit-inline">{vol.unit}</span></span>
		<span class="stat-label">Volume</span>
	</div>
</div>

<!-- ======== ACTIVITY ======== -->
<div class="section-reveal" use:reveal>
	<div class="section-head">
		<Calendar class="h-4 w-4 text-emerald-400" />
		<h2 class="section-title">Activity</h2>
	</div>
	<div class="fl-card">
		<ActivityHeatmap data={heatmapData} />
	</div>
</div>

<!-- ======== RECENT WORKOUTS ======== -->
<div class="section-reveal" use:reveal>
	<div class="section-head">
		<Dumbbell class="h-4 w-4 text-violet-400" />
		<h2 class="section-title">Recent Workouts</h2>
		{#if workouts.length > 0}
			<a href="/history" class="section-link">
				View all <ChevronRight class="h-3.5 w-3.5" />
			</a>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-2">
			{#each [1, 2, 3] as _}
				<div class="skeleton-row"></div>
			{/each}
		</div>
	{:else if recentWorkouts.length === 0}
		<div class="empty-state">
			<Dumbbell class="h-8 w-8 text-muted-foreground/20" />
			<p class="text-sm text-muted-foreground/60">No workouts yet</p>
			<p class="text-xs text-muted-foreground/40">Start your first one above</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each recentWorkouts as workout (workout.id)}
				<a href="/history/{workout.date}" class="workout-row">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-semibold">
							{new Date(workout.date + 'T00:00:00').toLocaleDateString('en-US', {
								weekday: 'short', month: 'short', day: 'numeric'
							})}
						</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
						</p>
					</div>
					<div class="text-right">
						<p class="flex items-center justify-end gap-1 text-sm tabular-nums">
							<Clock class="h-3 w-3 opacity-40" />
							{formatDuration(workout.duration)}
						</p>
						<p class="text-xs text-muted-foreground mt-0.5">
							{formatVolume(calculateTotalVolume(workout), prefs.weightUnit)}
						</p>
					</div>
					<ChevronRight class="h-4 w-4 text-muted-foreground/30 shrink-0" />
				</a>
			{/each}
		</div>
	{/if}
</div>

<div class="h-6"></div>

<style>
	/* =============================================
	   HERO — Vibrant gradient with animated orbs
	   ============================================= */
	.hero-wrap {
		margin: calc(-1rem - 3rem) -1rem 0 -1rem;
	}

	.hero-banner {
		position: relative;
		min-height: 380px;
		display: flex;
		align-items: flex-end;
		overflow: hidden;
		border-radius: 0 0 1.5rem 1.5rem;
		background: var(--hero-base, oklch(0.13 0.01 30));
	}
	:global(:root:not(.dark)) .hero-banner {
		background: var(--hero-base-light, oklch(0.97 0.005 30));
	}

	/* Animated gradient orbs — Apple Fitness+ style */
	.hero-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		will-change: transform;
		animation: orb-drift 8s ease-in-out infinite alternate;
	}
	.hero-orb-1 {
		width: 280px;
		height: 280px;
		top: -60px;
		left: -40px;
		background: var(--orb1);
		animation-duration: 7s;
	}
	.hero-orb-2 {
		width: 220px;
		height: 220px;
		top: -20px;
		right: -30px;
		background: var(--orb2);
		animation-duration: 9s;
		animation-delay: -3s;
	}
	.hero-orb-3 {
		width: 180px;
		height: 180px;
		bottom: 20px;
		left: 30%;
		background: var(--orb3);
		animation-duration: 11s;
		animation-delay: -5s;
	}
	:global(:root:not(.dark)) .hero-orb-1 { background: var(--orb1-light); }
	:global(:root:not(.dark)) .hero-orb-2 { background: var(--orb2-light); }
	:global(:root:not(.dark)) .hero-orb-3 { background: var(--orb3-light); }

	@keyframes orb-drift {
		0% { transform: translate(0, 0) scale(1); }
		100% { transform: translate(20px, 15px) scale(1.08); }
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-orb { animation: none; }
	}

	/* Grain overlay */
	.hero-grain {
		position: absolute;
		inset: 0;
		opacity: 0.35;
		pointer-events: none;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
		background-size: 150px 150px;
	}

	/* Content positioned at bottom */
	.hero-content {
		position: relative;
		z-index: 2;
		width: 100%;
		padding: calc(3rem + env(safe-area-inset-top, 0px)) 1.25rem 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Staggered entrance */
	.hero-content > * {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.hero-entered > * { opacity: 1; transform: translateY(0); }
	.hero-entered > :nth-child(1) { transition-delay: 50ms; }
	.hero-entered > :nth-child(2) { transition-delay: 130ms; }
	.hero-entered > :nth-child(3) { transition-delay: 200ms; }
	.hero-entered > :nth-child(4) { transition-delay: 300ms; }

	@media (prefers-reduced-motion: reduce) {
		.hero-content > * { opacity: 1; transform: none; transition: none; }
	}

	.hero-date {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: oklch(1 0 0 / 0.55);
	}
	:global(:root:not(.dark)) .hero-date {
		color: oklch(0 0 0 / 0.5);
	}

	.hero-title {
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: oklch(1 0 0 / 0.95);
	}
	:global(:root:not(.dark)) .hero-title {
		color: oklch(0.12 0.005 286);
	}

	.hero-name {
		background: linear-gradient(135deg, oklch(0.82 0.17 42), oklch(0.7 0.22 18));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	:global(:root:not(.dark)) .hero-name {
		background: linear-gradient(135deg, oklch(0.52 0.2 42), oklch(0.42 0.22 18));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-tagline {
		font-size: 0.8rem;
		color: oklch(1 0 0 / 0.45);
		font-weight: 400;
		font-style: italic;
		line-height: 1.4;
	}
	:global(:root:not(.dark)) .hero-tagline {
		color: oklch(0 0 0 / 0.42);
	}
	.hero-quote-author {
		font-style: normal;
		font-weight: 500;
		font-size: 0.7rem;
		opacity: 0.7;
	}

	/* CTA — juicy gradient button */
	.hero-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		margin-top: 0.25rem;
		padding: 0.875rem 1.5rem;
		border-radius: 0.875rem;
		background: linear-gradient(135deg, oklch(0.6 0.22 35), oklch(0.48 0.24 15));
		color: white;
		font-weight: 650;
		font-size: 0.95rem;
		letter-spacing: 0.005em;
		text-decoration: none;
		box-shadow:
			0 4px 20px oklch(0.55 0.22 25 / 0.4),
			inset 0 1px 0 oklch(1 0 0 / 0.18);
		transition: transform 0.15s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.hero-cta:active {
		transform: scale(0.97);
		box-shadow: 0 2px 10px oklch(0.55 0.22 25 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.12);
	}

	/* =============================================
	   STAT CARDS — 3-column grid, equal sizing
	   ============================================= */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.625rem;
		padding: 0 0.25rem;
		margin-top: 1rem;
		position: relative;
		z-index: 3;
	}

	/* Staggered entrance */
	.stats-grid > * {
		opacity: 0;
		transform: translateY(14px) scale(0.96);
		transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.stats-entered > * { opacity: 1; transform: translateY(0) scale(1); }
	.stats-entered > :nth-child(1) { transition-delay: 380ms; }
	.stats-entered > :nth-child(2) { transition-delay: 460ms; }
	.stats-entered > :nth-child(3) { transition-delay: 540ms; }

	@media (prefers-reduced-motion: reduce) {
		.stats-grid > * { opacity: 1; transform: none; transition: none; }
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.375rem;
		padding: 0.875rem 0.375rem;
		border-radius: 1rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		min-width: 0; /* prevent grid blowout */
		overflow: hidden;
	}
	:global(:root:not(.dark)) .stat-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.06);
	}

	/* Icon ring with glow */
	.stat-icon-ring {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.stat-ring-orange {
		background: oklch(0.65 0.18 40 / 0.2);
		color: oklch(0.78 0.17 40);
		box-shadow: 0 0 20px oklch(0.65 0.18 40 / 0.25);
	}
	.stat-ring-blue {
		background: oklch(0.58 0.16 250 / 0.2);
		color: oklch(0.72 0.17 250);
		box-shadow: 0 0 20px oklch(0.58 0.16 250 / 0.25);
	}
	.stat-ring-green {
		background: oklch(0.58 0.16 155 / 0.2);
		color: oklch(0.72 0.17 155);
		box-shadow: 0 0 20px oklch(0.58 0.16 155 / 0.25);
	}

	.stat-value {
		font-size: 1.375rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		line-height: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		text-align: center;
	}
	.stat-unit-inline {
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		margin-left: 0.15rem;
		vertical-align: baseline;
	}
	.stat-label {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--muted-foreground);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* =============================================
	   SECTIONS — scroll-reveal
	   ============================================= */
	.section-reveal {
		margin-top: 1.75rem;
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
		            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.section-reveal:global(.revealed) { opacity: 1; transform: translateY(0); }
	@media (prefers-reduced-motion: reduce) {
		.section-reveal { opacity: 1; transform: none; transition: none; }
	}

	.section-head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.625rem;
	}
	.section-title {
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.03em;
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
		color: oklch(0.72 0.15 42);
		text-decoration: none;
	}

	/* Elevated card surface */
	.fl-card {
		border-radius: 0.875rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		padding: 0.75rem;
		overflow: hidden;
	}
	:global(:root:not(.dark)) .fl-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
	}

	/* Workout rows */
	.workout-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0.875rem;
		border-radius: 0.875rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		text-decoration: none;
		color: inherit;
		transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.workout-row:active {
		background: oklch(0.22 0.006 286);
		transform: scale(0.98);
	}
	:global(:root:not(.dark)) .workout-row {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .workout-row:active {
		background: oklch(0.97 0 0);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 2.5rem 1rem;
		border-radius: 0.875rem;
		background: oklch(0.19 0.006 286);
		border: 1px dashed oklch(1 0 0 / 0.1);
	}
	:global(:root:not(.dark)) .empty-state {
		background: oklch(0.98 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}

	/* Skeleton loader */
	.skeleton-row {
		height: 68px;
		border-radius: 0.875rem;
		background: oklch(0.19 0.006 286);
		animation: sk-pulse 1.5s ease-in-out infinite;
	}
	@keyframes sk-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
</style>
