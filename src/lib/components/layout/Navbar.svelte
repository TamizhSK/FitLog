<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="navbar safe-top">
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
		position: sticky;
		top: 0;
		z-index: 50;
		width: 100%;
		background: transparent;
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
