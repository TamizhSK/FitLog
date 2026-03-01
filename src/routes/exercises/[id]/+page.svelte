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
		<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
	</div>
{:else}
	<div class="space-y-6 sm:space-y-8">
		<!-- Back link -->
		<a
			href="/exercises"
			class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground active:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Back to exercises
		</a>

		<!-- Hero: Image/Video -->
		<div class="-mx-4 overflow-hidden border-y border-border bg-muted sm:mx-0 sm:rounded-xl sm:border">
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
							<Dumbbell class="h-16 w-16 text-muted-foreground/20" />
						</div>
					{/if}
					{#if exercise.videoUrl}
						<button
							onclick={() => (showVideo = true)}
							class="absolute bottom-3 right-3 flex min-h-[44px] items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform active:scale-95 hover:scale-105"
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
			<h1 class="text-xl font-bold tracking-tight sm:text-3xl">{exercise.name}</h1>

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
		<div class="space-y-3">
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

		<Separator />

		<!-- Instructions -->
		{#if exercise.instructions?.length}
			<div class="space-y-3">
				<h2 class="text-base font-semibold sm:text-lg">Instructions</h2>
				<ol class="space-y-3">
					{#each exercise.instructions as step, i}
						<li class="flex gap-3">
							<span
								class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
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
			<Separator />
			<div class="space-y-3">
				<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
					<Lightbulb class="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
					Tips
				</h2>
				<ul class="space-y-2">
					{#each exercise.exerciseTips as tip}
						<li class="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
							{tip}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Variations -->
		{#if exercise.variations?.length}
			<Separator />
			<div class="space-y-3">
				<h2 class="flex items-center gap-2 text-base font-semibold sm:text-lg">
					<Shuffle class="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
					Variations
				</h2>
				<ul class="space-y-2">
					{#each exercise.variations as variation}
						<li class="rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
							{variation}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<Separator />

		<!-- Add to Workout CTA -->
		<div class="sticky bottom-[76px] z-10 flex justify-center md:bottom-4">
			<Button size="lg" class="min-h-[48px] gap-2 px-8 shadow-lg" href="/workout">
				<Plus class="h-4 w-4" />
				Add to Workout
			</Button>
		</div>

		<!-- Related Exercises -->
		{#if related.length > 0}
			<div class="space-y-3">
				<h2 class="text-base font-semibold sm:text-lg">Related Exercises</h2>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
					{#each related as ex (ex.exerciseId)}
						<ExerciseCard exercise={ex} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
