<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search, X } from '@lucide/svelte';
	import {
		getSearchQuery,
		setSearchQuery,
		getSelectedBodyPart,
		setSelectedBodyPart,
		getSelectedEquipment,
		setSelectedEquipment,
		getAllBodyParts,
		getAllEquipments
	} from '$lib/stores/exercises.svelte';

	let bodyParts = $derived(['ALL', ...getAllBodyParts()]);
	let equipments = $derived(['ALL', ...getAllEquipments()]);
	let query = $derived(getSearchQuery());
	let selectedBP = $derived(getSelectedBodyPart());
	let selectedEQ = $derived(getSelectedEquipment());

	function formatName(name: string): string {
		if (name === 'ALL') return 'All';
		return name
			.split(' ')
			.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
			.join(' ');
	}
</script>

<div class="space-y-3">
	<!-- Search -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			placeholder="Search exercises, muscles, equipment..."
			value={query}
			oninput={(e) => setSearchQuery(e.currentTarget.value)}
			class="h-11 pl-10 pr-10 text-base sm:h-9 sm:text-sm"
		/>
		{#if query}
			<button
				class="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
				onclick={() => setSearchQuery('')}
			>
				<X class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Body Part Chips — horizontal scroll on mobile -->
	<div class="-mx-4 px-4">
		<div class="scrollbar-hide flex gap-1.5 overflow-x-auto pb-1">
			{#each bodyParts as bp}
				<button
					onclick={() => setSelectedBodyPart(bp)}
					class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95
						{selectedBP === bp
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
				>
					{formatName(bp)}
				</button>
			{/each}
		</div>
	</div>

	<!-- Equipment Filter -->
	<div class="flex items-center gap-2">
		<span class="shrink-0 text-xs text-muted-foreground">Equipment:</span>
		<select
			value={selectedEQ}
			onchange={(e) => setSelectedEquipment(e.currentTarget.value)}
			class="min-h-[36px] flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
		>
			{#each equipments as eq}
				<option value={eq}>{formatName(eq)}</option>
			{/each}
		</select>
	</div>
</div>
