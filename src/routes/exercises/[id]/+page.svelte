<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		loadExercises,
		getExerciseById,
		getRelatedExercises
	} from '$lib/stores/exercises.svelte';
	import MuscleTag from '$lib/components/exercises/MuscleTag.svelte';
	import ExerciseCard from '$lib/components/exercises/ExerciseCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import {
		ArrowLeft,
		Dumbbell,
		Play,
		Plus,
		Lightbulb,
		Shuffle,
		Target,
		Loader2
	} from '@lucide/svelte';
	import type { Exercise } from '$lib/types/exercise';

	let exercise = $derived(getExerciseById(page.params.id));
	let related = $derived(exercise ? getRelatedExercises(exercise) : []);
	let showVideo = $state(false);
	let imgError = $state(false);

	onMount(() => {
		loadExercises();
	});

	// Reset state when exercise changes
	$effect(() => {
		page.params.id;
		showVideo = false;
		imgError = false;
		// Scroll to top on exercise change
		window.scrollTo({ top: 0 });
	});
</script>

{#if !exercise}
	<div class="flex items-center justify-center py-20">
		<Loader2 class="h-8 w-8 animate-spin text-muted-foreground/40" />
	</div>
{:else}
	<div class="fl-page-enter space-y-6 sm:space-y-8">
		<!-- Back link -->
		<a
			href="/exercises"
			class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to exercises
		</a>

		<!-- Hero: Image/Video with gradient overlay -->
		<div class="exercise-hero">
			{#if showVideo && exercise.videoUrl}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={exercise.videoUrl}
					autoplay
					loop
					muted
					playsinline
					class="mx-auto max-h-[300px] w-full object-contain sm:max-h-[400px]"
				></video>
			{:else}
				<div class="relative">
					{#if !imgError}
						<img
							src={exercise.imageUrl}
							alt={exercise.name}
							decoding="async"
							class="mx-auto max-h-[300px] w-full object-contain sm:max-h-[400px]"
							onerror={() => (imgError = true)}
						/>
					{:else}
						<div class="flex h-48 items-center justify-center sm:h-64">
							<Dumbbell class="h-16 w-16 text-muted-foreground/15" />
						</div>
					{/if}
					{#if exercise.videoUrl}
						<button
							onclick={() => (showVideo = true)}
							class="video-toggle-btn"
						>
							<Play class="h-4 w-4" />
							Watch Video
						</button>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Title + Tags -->
		<div class="space-y-3">
			<h1 class="fl-page-title text-xl sm:text-3xl">{exercise.name}</h1>

			<div class="flex flex-wrap gap-1.5">
				{#each exercise.bodyParts as bp}
					<MuscleTag muscle={bp} size="default" />
				{/each}
			</div>

			<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
				<span class="flex items-center gap-1.5">
					<Dumbbell class="h-4 w-4" />
					{exercise.equipments.join(', ')}
				</span>
				<span class="flex items-center gap-1.5">
					<Target class="h-4 w-4" />
					{exercise.exerciseType}
				</span>
			</div>
		</div>

		<!-- Overview -->
		{#if exercise.overview}
			<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">{exercise.overview}</p>
		{/if}

		<!-- Target Muscles -->
		<div class="fl-surface space-y-3 p-4">
			<h2 class="text-base font-semibold sm:text-lg">Target Muscles</h2>
			<div class="flex flex-wrap gap-1.5">
				{#each exercise.targetMuscles as m}
					<MuscleTag muscle={m} size="default" />
				{/each}
			</div>
			{#if exercise.secondaryMuscles.length > 0}
				<div class="space-y-1.5">
					<p class="text-xs text-muted-foreground">Secondary muscles</p>
					<div class="flex flex-wrap gap-1">
						{#each exercise.secondaryMuscles as m}
							<MuscleTag muscle={m} variant="outline" />
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Instructions -->
		{#if exercise.instructions?.length}
			<div class="space-y-3">
				<h2 class="text-base font-semibold sm:text-lg">Instructions</h2>
				<ol class="space-y-3">
					{#each exercise.instructions as step, i}
						<li class="flex gap-3">
							<span
								class="instruction-number"
							>
								{i + 1}
							</span>
							<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">{step}</p>
						</li>
					{/each}
				</ol>
			</div>
		{/if}

		<!-- Tips -->
		{#if exercise.exerciseTips?.length}
			<div class="space-y-3">
				<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
					<Lightbulb class="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
					Tips
				</h2>
				<ul class="space-y-2">
					{#each exercise.exerciseTips as tip}
						<li class="fl-surface p-3 text-sm leading-relaxed text-muted-foreground">
							{tip}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Variations -->
		{#if exercise.variations?.length}
			<div class="space-y-3">
				<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
					<Shuffle class="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
					Variations
				</h2>
				<ul class="space-y-2">
					{#each exercise.variations as variation}
						<li class="fl-surface p-3 text-sm leading-relaxed text-muted-foreground">
							{variation}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Add to Workout CTA -->
		<div class="sticky bottom-[76px] z-10 flex justify-center md:bottom-4">
			<a href="/workout" class="cta-btn">
				<Plus class="h-4 w-4" />
				Add to Workout
			</a>
		</div>

		<!-- Related Exercises -->
		{#if related.length > 0}
			<div class="space-y-3">
				<h2 class="text-base font-semibold sm:text-lg">Related Exercises</h2>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
					{#each related as ex (ex.exerciseId)}
						<ExerciseCard exercise={ex} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.exercise-hero {
		margin-left: -1rem;
		margin-right: -1rem;
		overflow: hidden;
		border-radius: 0;
		background: oklch(0.9 0 0);
		border-top: 1px solid oklch(1 0 0 / 0.08);
		border-bottom: 1px solid oklch(1 0 0 / 0.08);
	}
	:global(.dark) .exercise-hero {
		background: oklch(0.85 0.005 286);
	}
	:global(.dark) .exercise-hero :global(img) {
		mix-blend-mode: multiply;
	}
	:global(:root:not(.dark)) .exercise-hero {
		background: oklch(0.96 0 0);
		border-color: oklch(0 0 0 / 0.06);
	}
	@media (min-width: 640px) {
		.exercise-hero {
			margin-left: 0;
			margin-right: 0;
			border-radius: 1rem;
			border: 1px solid oklch(1 0 0 / 0.08);
		}
		:global(:root:not(.dark)) .exercise-hero {
			border-color: oklch(0 0 0 / 0.06);
			box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
		}
	}

	.video-toggle-btn {
		position: absolute;
		bottom: 0.75rem;
		right: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-height: 44px;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		background: oklch(0.15 0.005 286 / 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: white;
		font-size: 0.8125rem;
		font-weight: 600;
		border: 1px solid oklch(1 0 0 / 0.1);
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.2);
		transition: transform 0.15s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.video-toggle-btn:active {
		transform: scale(0.95);
	}

	.instruction-number {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		border-radius: 50%;
		font-size: 0.7rem;
		font-weight: 700;
		background: oklch(0.6 0.18 45 / 0.15);
		color: oklch(0.75 0.16 45);
	}
	:global(:root:not(.dark)) .instruction-number {
		background: oklch(0.5 0.18 45 / 0.12);
		color: oklch(0.45 0.18 45);
	}

	.cta-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
		padding: 0.75rem 2rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 45), oklch(0.45 0.2 25));
		color: white;
		font-weight: 600;
		font-size: 0.875rem;
		text-decoration: none;
		box-shadow: 0 2px 12px oklch(0.5 0.18 35 / 0.2);
		transition: transform 0.15s var(--ease-spring), box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.cta-btn:hover {
		box-shadow: 0 4px 20px oklch(0.5 0.18 35 / 0.3);
	}
	.cta-btn:active {
		transform: scale(0.97);
	}
</style>
