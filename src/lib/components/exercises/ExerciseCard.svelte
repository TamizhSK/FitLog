<script lang="ts">
	import type { Exercise } from '$lib/types/exercise';
	import MuscleTag from './MuscleTag.svelte';
	import { Dumbbell } from '@lucide/svelte';

	interface Props {
		exercise: Exercise;
	}

	let { exercise }: Props = $props();

	let imgError = $state(false);
	let imgLoaded = $state(false);

	function formatEquipment(eq: string): string {
		return eq
			.split(' ')
			.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
			.join(' ');
	}
</script>

<a
	href="/exercises/{exercise.exerciseId}"
	class="exercise-card"
>
	<!-- Image -->
	<div class="exercise-card-image">
		{#if !imgError}
			<img
				src={exercise.imageUrl}
				alt={exercise.name}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover transition-transform duration-300"
				class:opacity-100={imgLoaded}
				class:opacity-0={!imgLoaded}
				class:scale-105={false}
				onload={() => (imgLoaded = true)}
				onerror={() => (imgError = true)}
			/>
		{/if}
		{#if !imgLoaded}
			<div class="absolute inset-0 flex items-center justify-center">
				<Dumbbell class="h-8 w-8 text-muted-foreground/15" />
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="exercise-card-body">
		<h3 class="exercise-card-name">
			{exercise.name}
		</h3>

		<div class="flex flex-wrap gap-1">
			{#each exercise.bodyParts.slice(0, 2) as bp}
				<MuscleTag muscle={bp} />
			{/each}
		</div>

		<div class="exercise-card-meta">
			<Dumbbell class="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
			<span class="truncate">{exercise.equipments.map(formatEquipment).join(', ')}</span>
		</div>
	</div>
</a>

<style>
	.exercise-card {
		display: block;
		overflow: hidden;
		border-radius: 0.875rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		text-decoration: none;
		color: inherit;
		transition: border-color 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.exercise-card:hover {
		border-color: oklch(1 0 0 / 0.15);
	}
	.exercise-card:active {
		transform: scale(0.97);
	}
	:global(:root:not(.dark)) .exercise-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 4px oklch(0 0 0 / 0.05);
	}
	:global(:root:not(.dark)) .exercise-card:hover {
		border-color: oklch(0 0 0 / 0.12);
	}

	.exercise-card-image {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: oklch(0.9 0 0);
	}
	/* Darken the white image background in dark mode */
	:global(.dark) .exercise-card-image {
		background: oklch(0.85 0.005 286);
	}
	:global(.dark) .exercise-card-image img {
		mix-blend-mode: multiply;
	}
	.exercise-card:hover .exercise-card-image img {
		transform: scale(1.05);
	}

	.exercise-card-body {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.625rem;
	}

	@media (min-width: 640px) {
		.exercise-card-body {
			padding: 0.75rem;
		}
	}

	.exercise-card-name {
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.exercise-card-name {
			font-size: 0.8125rem;
			-webkit-line-clamp: 1;
		}
	}

	.exercise-card-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.625rem;
		color: var(--muted-foreground);
	}

	@media (min-width: 640px) {
		.exercise-card-meta {
			font-size: 0.6875rem;
		}
	}
</style>
