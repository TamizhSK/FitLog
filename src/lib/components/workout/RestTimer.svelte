<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Plus, Minus, SkipForward } from '@lucide/svelte';
	import { getPreferences } from '$lib/stores/preferences.svelte';

	interface Props {
		onComplete: () => void;
		onSkip: () => void;
	}

	let { onComplete, onSkip }: Props = $props();

	// Read the default once at mount time (not reactively — we don't want
	// the timer to reset when prefs change mid-countdown)
	const defaultSeconds = getPreferences().restTimerDefault;

	let totalSeconds = $state(defaultSeconds);
	let remaining = $state(defaultSeconds);
	let interval: ReturnType<typeof setInterval> | null = null;

	function start() {
		remaining = totalSeconds;
		interval = setInterval(() => {
			remaining--;
			if (remaining <= 0) {
				stop();
				playAlert();
				onComplete();
			}
		}, 1000);
	}

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function adjust(delta: number) {
		totalSeconds = Math.max(15, totalSeconds + delta);
		remaining = Math.max(0, remaining + delta);
	}

	function playAlert() {
		const prefs = getPreferences();
		try {
			if (!prefs.soundEnabled) return;
			const ctx = new AudioContext();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.frequency.value = 880;
			gain.gain.value = 0.3;
			osc.start();
			osc.stop(ctx.currentTime + 0.3);
			// Second beep
			setTimeout(() => {
				const osc2 = ctx.createOscillator();
				const gain2 = ctx.createGain();
				osc2.connect(gain2);
				gain2.connect(ctx.destination);
				osc2.frequency.value = 880;
				gain2.gain.value = 0.3;
				osc2.start();
				osc2.stop(ctx.currentTime + 0.3);
			}, 400);
		} catch {
			// Audio not available
		}

		if (prefs.vibrationEnabled && navigator.vibrate) {
			navigator.vibrate([200, 100, 200]);
		}
	}

	$effect(() => {
		start();
		return () => stop();
	});

	onDestroy(() => stop());

	let progress = $derived(totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0);
	let minutes = $derived(Math.floor(remaining / 60));
	let seconds = $derived(remaining % 60);

	// SVG circle calculations
	const radius = 70;
	const circumference = 2 * Math.PI * radius;
	let dashOffset = $derived(circumference * (1 - progress / 100));
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
	transition:fade={{ duration: 200 }}
>
	<div class="flex flex-col items-center gap-6" in:scale={{ duration: 250, start: 0.9 }}>
		<p class="text-sm font-medium text-muted-foreground">Rest Timer</p>

		<!-- Circular timer -->
		<div class="relative flex items-center justify-center">
			<svg width="200" height="200" class="-rotate-90">
				<circle
					cx="100"
					cy="100"
					r={radius}
					fill="none"
					stroke="currentColor"
					stroke-width="6"
					class="text-muted/30"
				/>
				<circle
					cx="100"
					cy="100"
					r={radius}
					fill="none"
					stroke="currentColor"
					stroke-width="6"
					stroke-linecap="round"
					stroke-dasharray={circumference}
					stroke-dashoffset={dashOffset}
					class="text-primary transition-all duration-1000"
				/>
			</svg>
			<div class="absolute text-center">
				<span class="font-mono text-5xl font-bold tabular-nums">
					{minutes}:{String(seconds).padStart(2, '0')}
				</span>
			</div>
		</div>

		<!-- Adjust buttons -->
		<div class="flex items-center gap-3">
			<Button
				variant="outline"
				size="sm"
				onclick={() => adjust(-15)}
				class="min-h-[44px] min-w-[72px] active:scale-95 sm:min-h-[32px]"
			>
				<Minus class="mr-1 h-3 w-3" />
				15s
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => adjust(15)}
				class="min-h-[44px] min-w-[72px] active:scale-95 sm:min-h-[32px]"
			>
				<Plus class="mr-1 h-3 w-3" />
				15s
			</Button>
		</div>

		<!-- Skip button -->
		<Button
			variant="secondary"
			onclick={onSkip}
			class="min-h-[48px] gap-2 px-8 active:scale-95 sm:min-h-[36px]"
		>
			<SkipForward class="h-4 w-4" />
			Skip Rest
		</Button>
	</div>
</div>
