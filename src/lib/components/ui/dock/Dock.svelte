<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	interface DockProps extends VariantProps<typeof dockVariants> {
		className?: string;
		magnification?: number;
		distance?: number;
		direction?: 'top' | 'middle' | 'bottom';
	}

	let className: DockProps['className'] = undefined;
	export { className as class };
	export let magnification: DockProps['magnification'] = 60;
	export let distance: DockProps['distance'] = 140;
	export let direction: DockProps['direction'] = 'middle';

	const dockVariants = cva(
		'mx-auto h-[62px] p-2 flex gap-1 rounded-[1.125rem] border supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 backdrop-blur-md overflow-visible'
	);

	let mouseX = Infinity;

	function handleMouseMove(e: MouseEvent) {
		mouseX = e.pageX;
	}
	function handleMouseLeave() {
		mouseX = Infinity;
	}
	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length > 0) {
			mouseX = e.touches[0].pageX;
		}
	}
	function handleTouchEnd() {
		mouseX = Infinity;
	}

	let dockClass = cn(dockVariants({ className }), {
		'items-start': direction === 'top',
		'items-center': direction === 'middle',
		'items-end': direction === 'bottom'
	});
</script>

<Motion let:motion>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		use:motion
		on:mousemove={handleMouseMove}
		on:mouseleave={handleMouseLeave}
		on:touchmove={handleTouchMove}
		on:touchend={handleTouchEnd}
		on:touchcancel={handleTouchEnd}
		class={dockClass}
	>
		<slot {mouseX} {magnification} {distance} />
	</div>
</Motion>
