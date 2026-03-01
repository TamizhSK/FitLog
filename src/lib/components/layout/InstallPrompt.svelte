<script lang="ts">
	import { browser } from '$app/environment';
	import { fly } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Download, X } from '@lucide/svelte';

	let deferredPrompt = $state<Event | null>(null);
	let showBanner = $state(false);
	let dismissed = $state(false);

	const DISMISS_KEY = 'fitlog-install-dismissed';

	$effect(() => {
		if (!browser) return;
		if (localStorage.getItem(DISMISS_KEY)) return;

		// Check if already installed (standalone mode)
		if (window.matchMedia('(display-mode: standalone)').matches) return;

		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e;
			showBanner = true;
		};

		window.addEventListener('beforeinstallprompt', handler);
		return () => window.removeEventListener('beforeinstallprompt', handler);
	});

	async function handleInstall() {
		if (!deferredPrompt) return;
		(deferredPrompt as any).prompt();
		const result = await (deferredPrompt as any).userChoice;
		if (result.outcome === 'accepted') {
			showBanner = false;
		}
		deferredPrompt = null;
	}

	function handleDismiss() {
		showBanner = false;
		dismissed = true;
		localStorage.setItem(DISMISS_KEY, 'true');
	}
</script>

{#if showBanner && !dismissed}
	<div
		class="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2 md:bottom-0 md:pb-4"
		transition:fly={{ y: 100, duration: 300 }}
	>
		<div class="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-2xl">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				<Download class="h-5 w-5 text-primary" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">Install FitLog</p>
				<p class="text-xs text-muted-foreground">Add to home screen for the best experience</p>
			</div>
			<Button size="sm" onclick={handleInstall} class="shrink-0">Install</Button>
			<button onclick={handleDismiss} class="shrink-0 p-1 text-muted-foreground">
				<X class="h-4 w-4" />
			</button>
		</div>
	</div>
{/if}
