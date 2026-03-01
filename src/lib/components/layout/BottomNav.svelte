<script lang="ts">
	import { Home, Search, Play, History, Settings } from '@lucide/svelte';
	import { page } from '$app/state';

	const navItems = [
		{ href: '/', label: 'Home', icon: Home },
		{ href: '/exercises', label: 'Exercises', icon: Search },
		{ href: '/workout', label: 'Workout', icon: Play },
		{ href: '/history', label: 'History', icon: History },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md safe-bottom md:hidden">
	<div class="flex items-stretch justify-around">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors active:scale-95
					{isActive(item.href) ? 'text-primary' : 'text-muted-foreground'}"
			>
				<item.icon class="h-5 w-5" strokeWidth={isActive(item.href) ? 2.5 : 1.8} />
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
