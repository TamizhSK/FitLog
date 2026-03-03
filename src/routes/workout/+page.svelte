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
	import { configureHiit } from '$lib/stores/hiit.svelte';
	import type { Exercise } from '$lib/types/exercise';
	import { WORKOUT_TEMPLATES, TEMPLATE_CATEGORIES, type WorkoutTemplate } from '$lib/data/templates';
	import MuscleTag from '$lib/components/exercises/MuscleTag.svelte';
	import type { Component } from 'svelte';
	import {
		Play,
		Zap,
		Search,
		X,
		Plus,
		Check,
		Dumbbell,
		Trash2,
		ChevronRight,
		Timer,
		Flame,
		ArrowUpFromLine,
		Footprints,
		MoveDown,
		Target,
		BicepsFlexed,
		Mountain,
		Link,
		Shield,
		PersonStanding,
		Sprout,
		Clock,
		SlidersHorizontal,
		Minus
	} from '@lucide/svelte';

	const ICONS: Record<string, Component> = {
		dumbbell: Dumbbell,
		flame: Flame,
		zap: Zap,
		'arrow-up-from-line': ArrowUpFromLine,
		footprints: Footprints,
		'move-down': MoveDown,
		target: Target,
		'biceps-flexed': BicepsFlexed,
		mountain: Mountain,
		link: Link,
		shield: Shield,
		'person-standing': PersonStanding,
		timer: Timer,
		sprout: Sprout,
		clock: Clock,
		'sliders-horizontal': SlidersHorizontal,
	};

	let selected = $state<Exercise[]>([]);
	let showSearch = $state(false);
	let query = $derived(getSearchQuery());
	let results = $derived(getFilteredExercises().slice(0, 20));

	// HIIT inline config
	let expandedHiit = $state<WorkoutTemplate | null>(null);
	let hiitWork = $state(30);
	let hiitRest = $state(15);
	let hiitRounds = $state(8);

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

	function startHiitWithSelected() {
		if (selected.length === 0) return;
		configureHiit(
			selected.map(e => ({ id: e.exerciseId, name: e.name })),
			hiitWork,
			hiitRest,
			hiitRounds
		);
		goto('/workout/hiit');
	}

	function useTemplate(template: WorkoutTemplate) {
		const exercises = getFilteredExercises();
		const count = template.exerciseCount ?? 6;
		let matching: Exercise[];

		if (template.equipments) {
			matching = exercises.filter((e) =>
				e.equipments.some((eq) => template.equipments!.includes(eq))
			);
		} else if (template.bodyParts) {
			matching = exercises.filter((e) =>
				e.bodyParts.some((bp) => template.bodyParts!.includes(bp))
			);
		} else {
			matching = exercises;
		}

		const picked: Exercise[] = [];
		if (template.bodyParts) {
			for (const bp of template.bodyParts) {
				const forBp = matching.filter(
					(e) => e.bodyParts.includes(bp) && !picked.some((p) => p.exerciseId === e.exerciseId)
				);
				if (forBp.length > 0) picked.push(forBp[0]);
				if (forBp.length > 1 && picked.length < count) picked.push(forBp[1]);
			}
		} else {
			// Equipment-based: just grab varied exercises
			for (const e of matching) {
				if (picked.length >= count) break;
				if (!picked.some((p) => p.bodyParts[0] === e.bodyParts[0])) {
					picked.push(e);
				}
			}
			// Fill remaining
			for (const e of matching) {
				if (picked.length >= count) break;
				if (!picked.some((p) => p.exerciseId === e.exerciseId)) {
					picked.push(e);
				}
			}
		}
		selected = picked.slice(0, count);
	}

	function handleTemplateClick(template: WorkoutTemplate) {
		if (template.category === 'hiit') {
			if (expandedHiit === template) {
				expandedHiit = null;
			} else {
				expandedHiit = template;
				if (template.hiitConfig) {
					hiitWork = template.hiitConfig.workSeconds;
					hiitRest = template.hiitConfig.restSeconds;
					hiitRounds = template.hiitConfig.rounds;
				}
			}
		} else {
			useTemplate(template);
		}
	}

	function startHiitTimer() {
		if (!expandedHiit) return;

		// Use selected exercises if any, otherwise use the template name as a placeholder
		const hiitEx = selected.length > 0
			? selected.map(e => ({ id: e.exerciseId, name: e.name }))
			: [{ id: expandedHiit.id ?? 'custom', name: expandedHiit.name }];

		configureHiit(
			hiitEx,
			hiitWork,
			hiitRest,
			hiitRounds
		);
		goto('/workout/hiit');
	}

	function adjustHiit(field: 'work' | 'rest' | 'rounds', delta: number) {
		if (field === 'work') hiitWork = Math.max(5, hiitWork + delta);
		if (field === 'rest') hiitRest = Math.max(0, hiitRest + delta);
		if (field === 'rounds') hiitRounds = Math.max(1, hiitRounds + delta);
	}

	let hiitTotalTime = $derived.by(() => {
		if (!expandedHiit) return '';
		const t = hiitWork * hiitRounds + hiitRest * Math.max(0, hiitRounds - 1);
		const m = Math.floor(t / 60);
		const s = t % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	});
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
		{#each TEMPLATE_CATEGORIES as cat}
			<p class="mb-1.5 mt-3 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60 first:mt-0">{cat.label}</p>
			<div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
				{#each WORKOUT_TEMPLATES.filter(t => t.category === cat.key) as template}
					<button
						onclick={() => handleTemplateClick(template)}
						class="template-card shrink-0"
						class:template-active={expandedHiit === template}
					>
						{#if ICONS[template.icon]}
							{@const Icon = ICONS[template.icon]}
							<Icon class="h-4 w-4 text-muted-foreground" />
						{/if}
						<span class="text-sm font-medium">{template.name}</span>
						<span class="text-[0.65rem] text-muted-foreground">{template.description}</span>
					</button>
				{/each}
			</div>

			<!-- Inline HIIT config panel -->
			{#if cat.key === 'hiit' && expandedHiit}
				<div class="hiit-config mt-2">
					{#if expandedHiit.name === 'Custom'}
						<div class="space-y-2.5">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">Work</span>
								<div class="flex items-center gap-2">
									<button onclick={() => adjustHiit('work', -5)} class="adj-btn"><Minus class="h-3 w-3" /></button>
									<span class="w-12 text-center text-sm font-bold tabular-nums">{hiitWork}s</span>
									<button onclick={() => adjustHiit('work', 5)} class="adj-btn"><Plus class="h-3 w-3" /></button>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">Rest</span>
								<div class="flex items-center gap-2">
									<button onclick={() => adjustHiit('rest', -5)} class="adj-btn"><Minus class="h-3 w-3" /></button>
									<span class="w-12 text-center text-sm font-bold tabular-nums">{hiitRest}s</span>
									<button onclick={() => adjustHiit('rest', 5)} class="adj-btn"><Plus class="h-3 w-3" /></button>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">Rounds</span>
								<div class="flex items-center gap-2">
									<button onclick={() => adjustHiit('rounds', -1)} class="adj-btn"><Minus class="h-3 w-3" /></button>
									<span class="w-12 text-center text-sm font-bold tabular-nums">{hiitRounds}</span>
									<button onclick={() => adjustHiit('rounds', 1)} class="adj-btn"><Plus class="h-3 w-3" /></button>
								</div>
							</div>
						</div>
					{/if}
					<div class="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-2.5">
						<span class="text-sm text-muted-foreground">{hiitWork}s work / {hiitRest}s rest / {hiitRounds} rounds</span>
						<span class="text-sm font-bold tabular-nums">{hiitTotalTime}</span>
					</div>
					<button onclick={startHiitTimer} class="hiit-start-btn">
						<Play class="h-4 w-4" fill="currentColor" />
						Start Timer
					</button>
				</div>
			{/if}
		{/each}
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
		<div class="h-24"></div>
		<div class="sticky bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-10 flex flex-col gap-2 md:bottom-4">
			<div class="flex gap-2">
				<button onclick={startWithSelected} class="cta-btn flex-1">
					<Play class="h-5 w-5" fill="currentColor" />
					Start Workout ({selected.length})
				</button>
				<button onclick={startHiitWithSelected} class="cta-btn-secondary flex-1">
					<Timer class="h-5 w-5" />
					HIIT ({selected.length})
				</button>
			</div>
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
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 140px;
		padding: 0.75rem;
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
	.template-active {
		border-color: oklch(0.6 0.18 155 / 0.5);
		background: oklch(0.6 0.18 155 / 0.1);
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
	:global(:root:not(.dark)) .template-active {
		border-color: oklch(0.45 0.18 155 / 0.5);
		background: oklch(0.45 0.18 155 / 0.08);
	}

	/* HIIT inline config panel */
	.hiit-config {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		animation: hiit-expand 0.25s var(--ease-spring);
	}
	:global(:root:not(.dark)) .hiit-config {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
	}
	@keyframes hiit-expand {
		from { opacity: 0; transform: translateY(-8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.adj-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: oklch(0.22 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		color: var(--foreground);
		transition: transform 0.1s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.adj-btn:active {
		transform: scale(0.92);
	}
	:global(:root:not(.dark)) .adj-btn {
		background: oklch(0.96 0 0);
		border-color: oklch(0 0 0 / 0.08);
	}

	.hiit-start-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1.25rem;
		border-radius: 0.875rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.45 0.2 140));
		color: white;
		font-weight: 600;
		font-size: 0.9rem;
		box-shadow: 0 2px 12px oklch(0.5 0.18 150 / 0.25),
		            inset 0 1px 0 oklch(1 0 0 / 0.12);
		transition: transform 0.15s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.hiit-start-btn:active {
		transform: scale(0.97);
	}

	.cta-btn-secondary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.9rem 1.5rem;
		border-radius: 1rem;
		background: oklch(0.24 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.1);
		color: var(--foreground);
		font-weight: 600;
		font-size: 0.95rem;
		transition: transform 0.15s var(--ease-spring), background 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	:global(:root:not(.dark)) .cta-btn-secondary {
		background: white;
		border-color: oklch(0 0 0 / 0.1);
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.05);
	}
	.cta-btn-secondary:active {
		transform: scale(0.98);
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
