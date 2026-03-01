<script lang="ts">
	import { Dumbbell } from '@lucide/svelte';
	import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
	<div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
		<a href="/" class="flex items-center gap-2 font-bold text-lg">
			<Dumbbell class="h-5 w-5 text-primary" />
			<span>FitLog</span>
		</a>

		<nav class="hidden items-center gap-1 md:flex">
			<a href="/exercises" class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
				Exercises
			</a>
			<a href="/workout" class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
				Workout
			</a>
			<a href="/history" class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
				History
			</a>
			<a href="/settings" class="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
				Settings
			</a>
		</nav>

		<ThemeToggle />
	</div>
</header>
