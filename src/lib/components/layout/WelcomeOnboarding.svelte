<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		setUserName,
		setWeightUnit,
		setOnboardingComplete,
		getPreferences
	} from '$lib/stores/preferences.svelte';
	import { Dumbbell, ChevronRight, Shield, Smartphone } from '@lucide/svelte';

	let step = $state(0);
	let name = $state('');
	let unit = $state<'kg' | 'lbs'>('kg');
	let prefs = $derived(getPreferences());

	function nextStep() {
		step++;
	}

	function finish() {
		if (name.trim()) setUserName(name.trim());
		setWeightUnit(unit);
		setOnboardingComplete(true);
	}
</script>

{#if !prefs.onboardingComplete}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-background"
		transition:fade={{ duration: 300 }}
	>
		<div class="mx-auto w-full max-w-sm px-6">
			{#if step === 0}
				<!-- Welcome -->
				<div
					class="flex flex-col items-center gap-6 text-center"
					in:scale={{ duration: 300, start: 0.9 }}
				>
					<div
						class="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
					>
						<Dumbbell class="h-10 w-10 text-primary" />
					</div>
					<div class="space-y-2">
						<h1 class="text-3xl font-bold tracking-tight">Welcome to FitLog</h1>
						<p class="text-sm text-muted-foreground">
							Your personal workout tracker. Log exercises, track progress, and build
							consistency.
						</p>
					</div>
					<Button onclick={nextStep} size="lg" class="mt-4 min-h-[48px] w-full gap-2">
						Get Started
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			{:else if step === 1}
				<!-- Name + Unit -->
				<div
					class="flex flex-col gap-6"
					in:fly={{ x: 40, duration: 250 }}
				>
					<div class="space-y-2 text-center">
						<h2 class="text-xl font-bold">Set Up Your Profile</h2>
						<p class="text-sm text-muted-foreground">This only takes a moment.</p>
					</div>

					<div class="space-y-4">
						<div class="space-y-2">
							<label for="name" class="text-sm font-medium">Your Name (optional)</label>
							<Input
								id="name"
								placeholder="Enter your name"
								bind:value={name}
								class="h-12 text-base"
							/>
						</div>

						<div class="space-y-2">
							<p class="text-sm font-medium">Weight Unit</p>
							<div class="grid grid-cols-2 gap-2">
								<button
									onclick={() => (unit = 'kg')}
									class="rounded-lg border-2 p-4 text-center transition-all active:scale-95
										{unit === 'kg'
										? 'border-primary bg-primary/5'
										: 'border-border hover:border-primary/30'}"
								>
									<span class="text-lg font-bold">kg</span>
									<p class="text-xs text-muted-foreground">Kilograms</p>
								</button>
								<button
									onclick={() => (unit = 'lbs')}
									class="rounded-lg border-2 p-4 text-center transition-all active:scale-95
										{unit === 'lbs'
										? 'border-primary bg-primary/5'
										: 'border-border hover:border-primary/30'}"
								>
									<span class="text-lg font-bold">lbs</span>
									<p class="text-xs text-muted-foreground">Pounds</p>
								</button>
							</div>
						</div>
					</div>

					<Button onclick={nextStep} size="lg" class="min-h-[48px] w-full gap-2">
						Continue
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			{:else if step === 2}
				<!-- Data privacy + done -->
				<div
					class="flex flex-col items-center gap-6 text-center"
					in:fly={{ x: 40, duration: 250 }}
				>
					<div class="space-y-4">
						<div class="flex justify-center gap-3">
							<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
								<Shield class="h-6 w-6 text-emerald-500" />
							</div>
							<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
								<Smartphone class="h-6 w-6 text-blue-500" />
							</div>
						</div>
						<h2 class="text-xl font-bold">Your Data, Your Device</h2>
						<div class="space-y-3 text-sm text-muted-foreground">
							<p>
								All your workout data is stored <strong class="text-foreground">locally on this device</strong> in your browser. No accounts, no cloud sync.
							</p>
							<p>
								Each person using FitLog on their own phone has completely separate data — your friends won't see yours and vice versa.
							</p>
							<p>
								Use <strong class="text-foreground">Settings &gt; Export</strong> to back up
								your data or transfer it to another device.
							</p>
						</div>
					</div>

					<Button onclick={finish} size="lg" class="min-h-[48px] w-full gap-2">
						Start Training
						<Dumbbell class="h-4 w-4" />
					</Button>
				</div>
			{/if}

			<!-- Step indicator -->
			<div class="mt-8 flex justify-center gap-2">
				{#each [0, 1, 2] as s}
					<div
						class="h-1.5 rounded-full transition-all duration-300 {s === step
							? 'w-6 bg-primary'
							: s < step
								? 'w-1.5 bg-primary/50'
								: 'w-1.5 bg-muted'}"
					></div>
				{/each}
			</div>
		</div>
	</div>
{/if}
