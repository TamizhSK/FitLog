<script lang="ts">
	import { onMount } from 'svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let hidden = $state(false);
	let scrolled = $state(false);
	let lastScrollY = 0;

	function handleScroll() {
		const y = window.scrollY;

		scrolled = y > 10;

		if (y > lastScrollY && y > 48) {
			hidden = true;
		} else if (y < lastScrollY) {
			hidden = false;
		}

		lastScrollY = y;
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<header class="navbar safe-top" class:navbar-hidden={hidden} class:navbar-scrolled={scrolled}>
	<div class="navbar-inner">
		<a href="/" class="navbar-logo">
			<span>FitLog</span>
		</a>

		<nav class="hidden items-center gap-0.5 md:flex">
			<a href="/exercises" class="navbar-link">Exercises</a>
			<a href="/workout" class="navbar-link">Workout</a>
			<a href="/history" class="navbar-link">History</a>
			<a href="/settings" class="navbar-link">Settings</a>
		</nav>

		<ThemeToggle />
	</div>
</header>

<style>
	.navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background: transparent;
		border-bottom: 1px solid transparent;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
		            background 0.25s ease,
		            border-color 0.25s ease;
		will-change: transform;
	}

	/* Only show backdrop when user has scrolled */
	.navbar-scrolled {
		background: oklch(0.14 0.005 286 / 0.6);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border-bottom-color: oklch(1 0 0 / 0.08);
	}
	:global(:root:not(.dark)) .navbar-scrolled {
		background: oklch(1 0 0 / 0.5);
		border-bottom-color: oklch(0 0 0 / 0.08);
	}

	.navbar-hidden {
		transform: translateY(-100%);
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 3rem;
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.navbar-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1rem;
		letter-spacing: -0.02em;
		text-decoration: none;
		color: var(--foreground);
		-webkit-tap-highlight-color: transparent;
	}

	.navbar-link {
		padding: 0.375rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		transition: color 0.15s ease, background 0.15s ease;
	}
	.navbar-link:hover {
		color: var(--foreground);
		background: oklch(1 0 0 / 0.05);
	}
	:global(:root:not(.dark)) .navbar-link:hover {
		background: oklch(0 0 0 / 0.04);
	}
</style>
