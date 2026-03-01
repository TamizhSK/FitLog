<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		data: Map<string, number>;
		size?: 'default' | 'large';
	}

	let { data, size = 'default' }: Props = $props();

	let CELL = $derived(size === 'large' ? 14 : 11);
	let GAP = $derived(size === 'large' ? 3 : 3);
	const ROWS = 7;
	const LEFT_PAD = 22;
	const TOP_PAD = 16;
	const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	let hoveredDay = $state<{ date: string; count: number; x: number; y: number } | null>(null);

	function toDateStr(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	function getMaxCount(): number {
		let max = 0;
		for (const v of data.values()) {
			if (v > max) max = v;
		}
		return Math.max(max, 1);
	}

	function getColor(count: number): string {
		if (count === 0) return 'var(--muted)';
		const max = getMaxCount();
		const ratio = count / max;
		if (ratio <= 0.25) return 'oklch(0.527 0.154 150.069)';
		if (ratio <= 0.5) return 'oklch(0.596 0.145 163.225)';
		if (ratio <= 0.75) return 'oklch(0.696 0.17 162.48)';
		return 'oklch(0.765 0.177 163.223)';
	}

	interface DayCell {
		date: string;
		count: number;
		col: number;
		row: number;
	}

	function generateGrid(): { cells: DayCell[]; monthMarkers: { label: string; col: number }[]; totalCols: number } {
		const cells: DayCell[] = [];
		const monthMarkers: { label: string; col: number }[] = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const start = new Date(today);
		start.setDate(start.getDate() - 364);
		start.setDate(start.getDate() - start.getDay());

		const diffMs = today.getTime() - start.getTime();
		const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
		const totalCols = Math.ceil(totalDays / 7);

		let lastMonth = -1;

		for (let col = 0; col < totalCols; col++) {
			for (let row = 0; row < ROWS; row++) {
				const d = new Date(start);
				d.setDate(d.getDate() + col * 7 + row);

				if (d > today) continue;

				const dateStr = toDateStr(d);
				const count = data.get(dateStr) ?? 0;

				cells.push({ date: dateStr, count, col, row });

				if (row === 0 && d.getMonth() !== lastMonth) {
					monthMarkers.push({ label: MONTH_LABELS[d.getMonth()], col });
					lastMonth = d.getMonth();
				}
			}
		}

		return { cells, monthMarkers, totalCols };
	}

	let grid = $derived(generateGrid());

	let svgWidth = $derived(grid.totalCols * (CELL + GAP) + LEFT_PAD);
	let svgHeight = $derived(ROWS * (CELL + GAP) + TOP_PAD);

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function showTooltip(cell: DayCell, e: Event) {
		const rect = (e.target as SVGElement).getBoundingClientRect();
		const x = Math.max(60, Math.min(rect.left + rect.width / 2, window.innerWidth - 60));
		hoveredDay = { date: cell.date, count: cell.count, x, y: rect.top };
	}

	let touchedCell = $state<string | null>(null);

	function handleCellTap(cell: DayCell, e: TouchEvent) {
		touchedCell = cell.date;
		if (hoveredDay?.date === cell.date) {
			goto(`/history/${cell.date}`);
			hoveredDay = null;
		} else {
			showTooltip(cell, e);
		}
	}

	function handleCellClick(cell: DayCell) {
		if (touchedCell === cell.date) {
			touchedCell = null;
			return;
		}
		goto(`/history/${cell.date}`);
	}
</script>

<div>
	<!-- Scrollable heatmap -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="overflow-x-auto"
		role="img"
		aria-label="Activity heatmap showing workout frequency over the past year"
		ontouchstart={(e) => {
			if (!(e.target as Element).closest('rect')) {
				hoveredDay = null;
			}
		}}
	>
		<svg width={svgWidth} height={svgHeight} class="block">
			<!-- Month labels -->
			{#each grid.monthMarkers as marker}
				<text
					x={marker.col * (CELL + GAP) + LEFT_PAD}
					y={10}
					class="fill-muted-foreground"
					font-size={size === 'large' ? '11' : '10'}
				>
					{marker.label}
				</text>
			{/each}

			<!-- Day labels -->
			{#each DAY_LABELS as label, i}
				<text
					x={2}
					y={i * (CELL + GAP) + TOP_PAD + CELL - 2}
					class="fill-muted-foreground"
					font-size={size === 'large' ? '10' : '9'}
					text-anchor="start"
				>
					{label}
				</text>
			{/each}

			<!-- Day cells -->
			{#each grid.cells as cell}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<rect
					x={cell.col * (CELL + GAP) + LEFT_PAD}
					y={cell.row * (CELL + GAP) + TOP_PAD}
					width={CELL}
					height={CELL}
					rx={2}
					fill={getColor(cell.count)}
					class="cursor-pointer opacity-90 transition-opacity hover:opacity-100"
					onmouseenter={(e) => showTooltip(cell, e)}
					onmouseleave={() => (hoveredDay = null)}
					ontouchstart={(e) => handleCellTap(cell, e)}
					onclick={() => handleCellClick(cell)}
				/>
			{/each}
		</svg>

		<!-- Tooltip -->
		{#if hoveredDay}
			<div
				class="pointer-events-none fixed z-50 -translate-x-1/2 rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
				style="left: {hoveredDay.x}px; top: {hoveredDay.y - 34}px"
			>
				{hoveredDay.count} {hoveredDay.count === 1 ? 'set' : 'sets'} on {formatDate(hoveredDay.date)}
			</div>
		{/if}
	</div>

	<!-- Legend — outside scroll container -->
	<div class="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
		<span>Less</span>
		<div class="h-[9px] w-[9px] rounded-sm" style="background-color: var(--muted)"></div>
		<div class="h-[9px] w-[9px] rounded-sm" style="background-color: oklch(0.527 0.154 150.069)"></div>
		<div class="h-[9px] w-[9px] rounded-sm" style="background-color: oklch(0.596 0.145 163.225)"></div>
		<div class="h-[9px] w-[9px] rounded-sm" style="background-color: oklch(0.696 0.17 162.48)"></div>
		<div class="h-[9px] w-[9px] rounded-sm" style="background-color: oklch(0.765 0.177 163.223)"></div>
		<span>More</span>
	</div>
</div>
