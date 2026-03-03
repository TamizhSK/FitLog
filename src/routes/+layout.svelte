<script lang="ts">
	import '../app.css';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import InstallPrompt from '$lib/components/layout/InstallPrompt.svelte';
	import WelcomeOnboarding from '$lib/components/layout/WelcomeOnboarding.svelte';
	import { initTheme } from '$lib/stores/theme.svelte';
	import { initPreferences } from '$lib/stores/preferences.svelte';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();
	let scrolled = $state(false);
	let splashVisible = $state(true);
	let splashFading = $state(false);

	onMount(() => {
		initTheme();
		initPreferences();

		// Splash screen: show icon briefly, then fade out
		setTimeout(() => {
			splashFading = true;
			setTimeout(() => {
				splashVisible = false;
			}, 500);
		}, 800);

		function onScroll() {
			scrolled = window.scrollY > 10;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>FitLog</title>
	<meta name="description" content="Full body workout tutorial & logger" />
	<link rel="preconnect" href="/" />
</svelte:head>

<div class="app-shell">
	<header class="brand-strip">
		<span class="brand-name" class:brand-hidden={scrolled}>FitLog</span>
	</header>
	<main class="app-main">
		{@render children()}
	</main>

	<BottomNav />
	<InstallPrompt />
</div>

<WelcomeOnboarding />

{#if splashVisible}
	<div class="splash" class:splash-fade={splashFading}>
		<img
			src="/icons/icon-192.png"
			alt="FitLog"
			class="splash-icon"
			class:splash-icon-entered={!splashFading}
		/>
	</div>
{/if}

<style>
	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--background);
		color: var(--foreground);
		overflow-x: hidden;
	}

	/* Fixed brand bar — always visible, clears the notch/punch-hole */
	.brand-strip {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		align-items: flex-end;
		padding: 0 1.125rem 0.5rem;
		height: calc(3rem + env(safe-area-inset-top, 0px));
		pointer-events: none;
		view-transition-name: brand-strip;
	}

	.brand-name {
		pointer-events: auto;
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: -0.02em;
		color: oklch(1 0 0 / 0.75);
		text-shadow: 0 1px 6px oklch(0 0 0 / 0.35);
		transition: opacity 0.3s ease, transform 0.3s ease;
	}
	.brand-hidden {
		opacity: 0;
		transform: translateY(-0.5rem);
		pointer-events: none;
	}
	:global(:root:not(.dark)) .brand-name {
		color: oklch(0.12 0.01 286 / 0.7);
		text-shadow: 0 1px 6px oklch(1 0 0 / 0.5);
	}

	/* Main content — padded below the brand strip */
	.app-main {
		flex: 1;
		width: 100%;
		max-width: 80rem;
		margin: 0 auto;
		padding: calc(3rem + env(safe-area-inset-top, 0px)) 1rem calc(80px + env(safe-area-inset-bottom, 0px));
		view-transition-name: page-content;
	}
	@media (min-width: 640px) {
		.app-main {
			padding-top: calc(3.25rem + env(safe-area-inset-top, 0px));
		}
	}

	/* Splash screen — native app launch feel */
	.splash {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--background);
		transition: opacity 0.5s ease;
	}
	.splash-fade {
		opacity: 0;
		pointer-events: none;
	}
	.splash-icon {
		width: 80px;
		height: 80px;
		border-radius: 1.25rem;
		opacity: 0;
		transform: scale(0.8);
		animation: splash-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
	}
	@keyframes splash-enter {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
