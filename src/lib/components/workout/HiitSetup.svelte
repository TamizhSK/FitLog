<script lang="ts">
	import { HIIT_PRESETS, type HiitPreset } from '$lib/data/hiit-presets';
	import { Input } from '$lib/components/ui/input';
	import { Minus, Plus } from '@lucide/svelte';

	let {
		onStart
	}: {
		onStart: (work: number, rest: number, rounds: number) => void;
	} = $props();

	let selectedId = $state('tabata');
	let customWork = $state(30);
	let customRest = $state(15);
	let customRounds = $state(8);

	let selected = $derived(HIIT_PRESETS.find((p) => p.id === selectedId)!);
	let isCustom = $derived(selectedId === 'custom');

	let work = $derived(isCustom ? customWork : selected.workSeconds);
	let rest = $derived(isCustom ? customRest : selected.restSeconds);
	let rounds = $derived(isCustom ? customRounds : selected.rounds);

	let totalTime = $derived.by(() => {
		const t = work * rounds + rest * Math.max(0, rounds - 1);
		const m = Math.floor(t / 60);
		const s = t % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	});

	function adjust(field: 'work' | 'rest' | 'rounds', delta: number) {
		if (field === 'work') customWork = Math.max(5, customWork + delta);
		if (field === 'rest') customRest = Math.max(0, customRest + delta);
		if (field === 'rounds') customRounds = Math.max(1, customRounds + delta);
	}
</script>

<div class="space-y-5">
	<!-- Preset cards -->
	<div class="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
		{#each HIIT_PRESETS as preset (preset.id)}
			<button
				onclick={() => (selectedId = preset.id)}
				class="preset-card shrink-0"
				class:preset-active={selectedId === preset.id}
			>
				<span class="text-lg leading-none">{preset.emoji}</span>
				<span class="text-sm font-medium">{preset.name}</span>
				<span class="text-[0.6rem] text-muted-foreground">{preset.description}</span>
			</button>
		{/each}
	</div>

	<!-- Custom config -->
	{#if isCustom}
		<div class="fl-surface space-y-3 p-4">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Work</span>
				<div class="flex items-center gap-2">
					<button onclick={() => adjust('work', -5)} class="adj-btn"><Minus class="h-3 w-3" /></button>
					<span class="w-12 text-center text-sm font-bold tabular-nums">{customWork}s</span>
					<button onclick={() => adjust('work', 5)} class="adj-btn"><Plus class="h-3 w-3" /></button>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Rest</span>
				<div class="flex items-center gap-2">
					<button onclick={() => adjust('rest', -5)} class="adj-btn"><Minus class="h-3 w-3" /></button>
					<span class="w-12 text-center text-sm font-bold tabular-nums">{customRest}s</span>
					<button onclick={() => adjust('rest', 5)} class="adj-btn"><Plus class="h-3 w-3" /></button>
				</div>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Rounds</span>
				<div class="flex items-center gap-2">
					<button onclick={() => adjust('rounds', -1)} class="adj-btn"><Minus class="h-3 w-3" /></button>
					<span class="w-12 text-center text-sm font-bold tabular-nums">{customRounds}</span>
					<button onclick={() => adjust('rounds', 1)} class="adj-btn"><Plus class="h-3 w-3" /></button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Summary -->
	<div class="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
		<div class="text-sm text-muted-foreground">
			{work}s work / {rest}s rest / {rounds} rounds
		</div>
		<span class="text-sm font-bold tabular-nums">{totalTime}</span>
	</div>

	<!-- Start button -->
	<button onclick={() => onStart(work, rest, rounds)} class="start-btn">
		Start Timer
	</button>
</div>

<style>
	.preset-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 120px;
		padding: 0.75rem;
		border-radius: 1rem;
		text-align: left;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		transition: border-color 0.2s ease, background 0.2s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.preset-active {
		border-color: oklch(0.6 0.18 155 / 0.5);
		background: oklch(0.6 0.18 155 / 0.1);
	}
	.preset-card:active {
		transform: scale(0.97);
	}
	:global(:root:not(.dark)) .preset-card {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .preset-active {
		border-color: oklch(0.45 0.18 155 / 0.5);
		background: oklch(0.45 0.18 155 / 0.08);
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

	.start-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 0.9rem 1.5rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, oklch(0.55 0.18 155), oklch(0.45 0.2 140));
		color: white;
		font-weight: 600;
		font-size: 0.95rem;
		box-shadow: 0 2px 12px oklch(0.5 0.18 150 / 0.25),
		            inset 0 1px 0 oklch(1 0 0 / 0.12);
		transition: transform 0.15s var(--ease-spring), box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}
	.start-btn:active {
		transform: scale(0.98);
	}
</style>
