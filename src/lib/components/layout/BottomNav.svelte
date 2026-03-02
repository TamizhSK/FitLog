<script lang="ts">
	import { Home, Search, Play, History, Settings } from '@lucide/svelte';
	import { page } from '$app/state';
	import Dock from '$lib/components/ui/dock/Dock.svelte';
	import DockIcon from '$lib/components/ui/dock/DockIcon.svelte';

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

<div class="dock-wrap md:hidden">
	<Dock direction="bottom" magnification={52} distance={100} class="dock-bar">
		<svelte:fragment slot="default" let:mouseX let:magnification let:distance>
			{#each navItems as item}
				<DockIcon {mouseX} {magnification} {distance}>
					<a
						href={item.href}
						class="dock-item"
						class:dock-active={isActive(item.href)}
						aria-label={item.label}
					>
						<div class="dock-icon-glow" class:glow-visible={isActive(item.href)}></div>
						<item.icon
							class="dock-icon-svg"
							strokeWidth={isActive(item.href) ? 2.2 : 1.5}
						/>
						<span class="dock-label">{item.label}</span>
					</a>
				</DockIcon>
			{/each}
		</svelte:fragment>
	</Dock>
</div>

<style>
	.dock-wrap {
		position: fixed;
		bottom: 0.5rem;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		justify-content: center;
		padding: 0 0.75rem;
		padding-bottom: env(safe-area-inset-bottom, 0px);
		pointer-events: none;
	}

	.dock-wrap :global(.dock-bar) {
		pointer-events: auto;
		width: calc(100% - 1.5rem);
		max-width: 26rem;
		justify-content: space-evenly;
		background: oklch(0.14 0.006 286 / 0.78);
		border-color: oklch(1 0 0 / 0.12);
		box-shadow:
			0 8px 32px oklch(0 0 0 / 0.3),
			0 1.5px 6px oklch(0 0 0 / 0.18),
			inset 0 0.5px 0 oklch(1 0 0 / 0.08);
	}
	:global(:root:not(.dark)) .dock-wrap :global(.dock-bar) {
		background: oklch(1 0 0 / 0.82);
		border-color: oklch(0 0 0 / 0.08);
		box-shadow:
			0 8px 32px oklch(0 0 0 / 0.1),
			0 1.5px 6px oklch(0 0 0 / 0.06),
			inset 0 0.5px 0 oklch(1 0 0 / 0.6);
	}

	.dock-item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.1875rem;
		width: 100%;
		height: 100%;
		min-height: 46px;
		border-radius: 0.75rem;
		padding: 0.25rem 0;
		color: oklch(1 0 0 / 0.38);
		text-decoration: none;
		transition: color 0.3s cubic-bezier(0.22, 1, 0.36, 1);
		-webkit-tap-highlight-color: transparent;
		overflow: visible;
	}
	:global(:root:not(.dark)) .dock-item {
		color: oklch(0 0 0 / 0.35);
	}
	.dock-item:active {
		transform: scale(0.88);
		transition: transform 0.1s ease;
	}

	/* Liquid glass glow behind active icon */
	.dock-icon-glow {
		position: absolute;
		inset: 2px;
		border-radius: 0.625rem;
		opacity: 0;
		background: radial-gradient(
			ellipse at 50% 40%,
			oklch(0.65 0.2 45 / 0.35) 0%,
			oklch(0.55 0.18 30 / 0.15) 50%,
			transparent 80%
		);
		filter: blur(1px);
		transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}
	:global(:root:not(.dark)) .dock-icon-glow {
		background: radial-gradient(
			ellipse at 50% 40%,
			oklch(0.65 0.2 45 / 0.28) 0%,
			oklch(0.6 0.18 30 / 0.12) 50%,
			transparent 80%
		);
	}
	.glow-visible {
		opacity: 1;
	}

	.dock-active {
		color: oklch(0.92 0.12 50);
	}
	:global(:root:not(.dark)) .dock-active {
		color: oklch(0.48 0.18 35);
	}

	.dock-item :global(.dock-icon-svg) {
		position: relative;
		width: 19px;
		height: 19px;
		z-index: 1;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.dock-label {
		position: relative;
		z-index: 1;
		font-size: 0.5625rem;
		font-weight: 500;
		letter-spacing: 0.01em;
		line-height: 1;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}
	.dock-active .dock-label {
		opacity: 1;
		font-weight: 600;
	}
</style>
