<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Exercise } from '$lib/types/exercise';
	import type { SetLog } from '$lib/types/workout';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Check, Plus, Trash2, Dumbbell } from '@lucide/svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';
	import { isWeighted } from '$lib/utils/exercise';

	interface Props {
		exercise: Exercise;
		sets: SetLog[];
		previousSets?: SetLog[];
		onUpdateSet: (setIndex: number, updates: Partial<SetLog>) => void;
		onAddSet: () => void;
		onRemoveSet: (setIndex: number) => void;
		onSetCompleted: (setIndex: number) => void;
	}

	let {
		exercise,
		sets,
		previousSets = [],
		onUpdateSet,
		onAddSet,
		onRemoveSet,
		onSetCompleted
	}: Props = $props();

	let prefs = $derived(getPreferences());
	let imgError = $state(false);
	let weighted = $derived(isWeighted(exercise));

	function formatPrevious(set: SetLog | undefined): string {
		if (!set) return '—';
		if (set.weight && weighted) return `${set.weight}${prefs.weightUnit} × ${set.reps}`;
		return `${set.reps} reps`;
	}
</script>

<div class="space-y-3">
	<!-- Exercise header -->
	<div class="flex items-center gap-3">
		<div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-12 sm:w-12">
			{#if !imgError}
				<img
					src={exercise.imageUrl}
					alt={exercise.name}
					decoding="async"
					class="h-full w-full object-cover"
					onerror={() => (imgError = true)}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<Dumbbell class="h-5 w-5 text-muted-foreground/30" />
				</div>
			{/if}
		</div>
		<div class="min-w-0 flex-1">
			<h3 class="truncate font-semibold">{exercise.name}</h3>
			<p class="text-xs text-muted-foreground">{exercise.equipments.join(', ')}</p>
		</div>
	</div>

	<!-- Set table -->
	<div class="overflow-hidden rounded-lg border border-border">
		<!-- Header -->
		{#if weighted}
			<div class="grid grid-cols-[36px_1fr_1fr_1fr_44px] items-center gap-1 border-b border-border bg-muted/30 px-2 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
				<span class="text-center">Set</span>
				<span>Prev</span>
				<span>{prefs.weightUnit}</span>
				<span>Reps</span>
				<span class="text-center">Done</span>
			</div>
		{:else}
			<div class="grid grid-cols-[36px_1fr_1fr_44px] items-center gap-1 border-b border-border bg-muted/30 px-2 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
				<span class="text-center">Set</span>
				<span>Prev</span>
				<span>Reps</span>
				<span class="text-center">Done</span>
			</div>
		{/if}

		<!-- Sets -->
		{#each sets as set, i (set.setNumber)}
			{#if weighted}
				<div
					class="grid grid-cols-[36px_1fr_1fr_1fr_44px] items-center gap-1 border-b border-border/50 px-2 py-2 last:border-b-0 transition-colors {set.completed ? 'bg-primary/5' : ''}"
					transition:slide={{ duration: 200 }}
				>
					<span class="text-center text-sm font-bold tabular-nums text-muted-foreground">{set.setNumber}</span>

					<span class="truncate text-xs text-muted-foreground">{formatPrevious(previousSets[i])}</span>

					<Input
						type="number"
						inputmode="decimal"
						value={set.weight ?? ''}
						oninput={(e) =>
							onUpdateSet(i, { weight: parseFloat(e.currentTarget.value) || 0 })}
						class="h-10 text-center text-sm tabular-nums sm:h-8"
						disabled={set.completed}
					/>

					<Input
						type="number"
						inputmode="numeric"
						value={set.reps || ''}
						oninput={(e) =>
							onUpdateSet(i, { reps: parseInt(e.currentTarget.value) || 0 })}
						class="h-10 text-center text-sm tabular-nums sm:h-8"
						disabled={set.completed}
					/>

					<div class="flex items-center justify-center">
						<button
							onclick={() => {
								onUpdateSet(i, { completed: !set.completed });
								if (!set.completed) onSetCompleted(i);
							}}
							class="flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-90 sm:h-8 sm:w-8 sm:rounded-md
								{set.completed
								? 'bg-primary text-primary-foreground'
								: 'border border-border hover:border-primary/50'}"
						>
							<Check class="h-5 w-5 sm:h-4 sm:w-4" />
						</button>
					</div>
				</div>
			{:else}
				<div
					class="grid grid-cols-[36px_1fr_1fr_44px] items-center gap-1 border-b border-border/50 px-2 py-2 last:border-b-0 transition-colors {set.completed ? 'bg-primary/5' : ''}"
					transition:slide={{ duration: 200 }}
				>
					<span class="text-center text-sm font-bold tabular-nums text-muted-foreground">{set.setNumber}</span>

					<span class="truncate text-xs text-muted-foreground">{formatPrevious(previousSets[i])}</span>

					<Input
						type="number"
						inputmode="numeric"
						value={set.reps || ''}
						oninput={(e) =>
							onUpdateSet(i, { reps: parseInt(e.currentTarget.value) || 0 })}
						class="h-10 text-center text-sm tabular-nums sm:h-8"
						disabled={set.completed}
					/>

					<div class="flex items-center justify-center">
						<button
							onclick={() => {
								onUpdateSet(i, { completed: !set.completed });
								if (!set.completed) onSetCompleted(i);
							}}
							class="flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-90 sm:h-8 sm:w-8 sm:rounded-md
								{set.completed
								? 'bg-primary text-primary-foreground'
								: 'border border-border hover:border-primary/50'}"
						>
							<Check class="h-5 w-5 sm:h-4 sm:w-4" />
						</button>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Actions -->
	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={onAddSet} class="min-h-[40px] flex-1 gap-1 sm:min-h-[32px]">
			<Plus class="h-3 w-3" />
			Add Set
		</Button>
		{#if sets.length > 1}
			<Button
				variant="ghost"
				size="sm"
				onclick={() => onRemoveSet(sets.length - 1)}
				class="min-h-[40px] text-muted-foreground hover:text-destructive sm:min-h-[32px]"
			>
				<Trash2 class="h-3 w-3" />
			</Button>
		{/if}
	</div>
</div>
