<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import InstallPrompt from '$lib/components/layout/InstallPrompt.svelte';
	import WelcomeOnboarding from '$lib/components/layout/WelcomeOnboarding.svelte';
	import { initTheme } from '$lib/stores/theme.svelte';
	import { initPreferences } from '$lib/stores/preferences.svelte';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	onMount(() => {
		initTheme();
		initPreferences();
	});

	// View Transitions API for native-like page transitions
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

<div class="flex min-h-[100dvh] flex-col bg-background text-foreground">
	<Navbar />

	<main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-4 pb-[calc(72px+env(safe-area-inset-bottom,0px))] sm:pt-6 md:pb-6">
		{@render children()}
	</main>

	<BottomNav />
	<InstallPrompt />
</div>

<WelcomeOnboarding />
