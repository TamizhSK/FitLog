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
	class="group block overflow-hidden rounded-xl border border-border bg-card transition-all active:scale-[0.98] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
>
	<!-- Image -->
	<div class="relative aspect-[4/3] overflow-hidden bg-muted">
		{#if !imgError}
			<img
				src={exercise.imageUrl}
				alt={exercise.name}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105
					{imgLoaded ? 'opacity-100' : 'opacity-0'}"
				onload={() => (imgLoaded = true)}
				onerror={() => (imgError = true)}
			/>
		{/if}
		{#if !imgLoaded}
			<div class="absolute inset-0 flex items-center justify-center bg-muted">
				<Dumbbell class="h-8 w-8 text-muted-foreground/20" />
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="space-y-1.5 p-2.5 sm:p-3">
		<h3 class="line-clamp-2 text-xs font-semibold leading-tight sm:text-sm sm:line-clamp-1 group-hover:text-primary">
			{exercise.name}
		</h3>

		<div class="flex flex-wrap gap-1">
			{#each exercise.bodyParts.slice(0, 2) as bp}
				<MuscleTag muscle={bp} />
			{/each}
		</div>

		<div class="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
			<Dumbbell class="h-2.5 w-2.5 sm:h-3 sm:w-3" />
			<span class="truncate">{exercise.equipments.map(formatEquipment).join(', ')}</span>
		</div>
	</div>
</a>
