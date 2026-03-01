<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Input } from '$lib/components/ui/input';
	import {
		getPreferences,
		setWeightUnit,
		setRestTimerDefault,
		setSoundEnabled,
		setVibrationEnabled,
		setUserName
	} from '$lib/stores/preferences.svelte';
	import { toggleMode, getTheme } from '$lib/stores/theme.svelte';
	import { exportData, importData } from '$lib/utils/export';
	import { getDB } from '$lib/db/index';
	import {
		Sun,
		Moon,
		Download,
		Upload,
		Trash2,
		Volume2,
		VolumeOff,
		Smartphone,
		Weight,
		Timer,
		User,
		Shield
	} from '@lucide/svelte';

	let prefs = $derived(getPreferences());
	let theme = $derived(getTheme());
	let importStatus = $state('');

	let fileInput: HTMLInputElement;

	async function handleImport(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			const result = await importData(file);
			importStatus = `Imported ${result.workouts} workouts and ${result.favorites} favorites`;
			setTimeout(() => (importStatus = ''), 3000);
		} catch {
			importStatus = 'Import failed. Check the file format.';
		}
	}

	async function clearAllData() {
		if (!confirm('This will permanently delete all your workout data. Are you sure?')) return;
		if (!confirm('Last chance — this cannot be undone. Delete everything?')) return;
		const db = await getDB();
		await db.clear('workouts');
		await db.clear('favorites');
		location.reload();
	}
</script>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-bold tracking-tight">Settings</h1>
		<p class="text-sm text-muted-foreground">Customize your FitLog experience.</p>
	</div>

	<!-- Name -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			<User class="h-5 w-5" />
			<div>
				<p class="text-sm font-medium">Your Name</p>
				<p class="text-xs text-muted-foreground">Shown on the home screen</p>
			</div>
		</div>
		<Input
			value={prefs.userName ?? ''}
			placeholder="Name"
			oninput={(e) => setUserName(e.currentTarget.value)}
			class="h-9 w-32 text-right text-sm"
		/>
	</div>

	<!-- Theme -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			{#if theme === 'dark'}
				<Moon class="h-5 w-5" />
			{:else}
				<Sun class="h-5 w-5" />
			{/if}
			<div>
				<p class="text-sm font-medium">Theme</p>
				<p class="text-xs text-muted-foreground capitalize">{theme} mode</p>
			</div>
		</div>
		<Button variant="outline" size="sm" onclick={toggleMode}>Toggle</Button>
	</div>

	<!-- Weight Unit -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			<Weight class="h-5 w-5" />
			<div>
				<p class="text-sm font-medium">Weight Unit</p>
				<p class="text-xs text-muted-foreground">Currently using {prefs.weightUnit}</p>
			</div>
		</div>
		<div class="flex gap-1">
			<Button
				variant={prefs.weightUnit === 'kg' ? 'default' : 'outline'}
				size="sm"
				onclick={() => setWeightUnit('kg')}
			>
				kg
			</Button>
			<Button
				variant={prefs.weightUnit === 'lbs' ? 'default' : 'outline'}
				size="sm"
				onclick={() => setWeightUnit('lbs')}
			>
				lbs
			</Button>
		</div>
	</div>

	<!-- Rest Timer Default -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			<Timer class="h-5 w-5" />
			<div>
				<p class="text-sm font-medium">Default Rest Timer</p>
				<p class="text-xs text-muted-foreground">{prefs.restTimerDefault} seconds</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => setRestTimerDefault(Math.max(15, prefs.restTimerDefault - 15))}>-</Button>
			<span class="w-10 text-center text-sm font-mono tabular-nums">{prefs.restTimerDefault}s</span>
			<Button variant="outline" size="sm" onclick={() => setRestTimerDefault(Math.min(300, prefs.restTimerDefault + 15))}>+</Button>
		</div>
	</div>

	<!-- Sound -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			{#if prefs.soundEnabled}
				<Volume2 class="h-5 w-5" />
			{:else}
				<VolumeOff class="h-5 w-5" />
			{/if}
			<div>
				<p class="text-sm font-medium">Sound Effects</p>
				<p class="text-xs text-muted-foreground">Timer completion alerts</p>
			</div>
		</div>
		<Button
			variant={prefs.soundEnabled ? 'default' : 'outline'}
			size="sm"
			onclick={() => setSoundEnabled(!prefs.soundEnabled)}
		>
			{prefs.soundEnabled ? 'On' : 'Off'}
		</Button>
	</div>

	<!-- Vibration -->
	<div class="flex items-center justify-between rounded-lg border border-border p-4 gap-3">
		<div class="flex items-center gap-3">
			<Smartphone class="h-5 w-5" />
			<div>
				<p class="text-sm font-medium">Vibration</p>
				<p class="text-xs text-muted-foreground">Haptic feedback on mobile</p>
			</div>
		</div>
		<Button
			variant={prefs.vibrationEnabled ? 'default' : 'outline'}
			size="sm"
			onclick={() => setVibrationEnabled(!prefs.vibrationEnabled)}
		>
			{prefs.vibrationEnabled ? 'On' : 'Off'}
		</Button>
	</div>

	<Separator />

	<!-- Data Management -->
	<div class="space-y-3">
		<h2 class="text-sm font-semibold text-muted-foreground">Data Management</h2>

		<Button variant="outline" class="w-full gap-2" onclick={exportData}>
			<Download class="h-4 w-4" />
			Export Data (JSON)
		</Button>

		<div>
			<Button variant="outline" class="w-full gap-2" onclick={() => fileInput.click()}>
				<Upload class="h-4 w-4" />
				Import Data
			</Button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".json"
				class="hidden"
				onchange={handleImport}
			/>
			{#if importStatus}
				<p class="mt-1 text-center text-xs text-muted-foreground">{importStatus}</p>
			{/if}
		</div>

		<Button variant="destructive" class="w-full gap-2" onclick={clearAllData}>
			<Trash2 class="h-4 w-4" />
			Clear All Data
		</Button>
	</div>

	<Separator />

	<!-- Data Privacy -->
	<div class="rounded-lg border border-border bg-card p-4">
		<div class="flex items-start gap-3">
			<Shield class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
			<div class="space-y-1">
				<p class="text-sm font-medium">Your Data is Private</p>
				<p class="text-xs leading-relaxed text-muted-foreground">
					All workout data is stored locally on this device in your browser.
					Each person on their own phone has completely separate data.
					Use Export to back up or transfer data between devices.
				</p>
			</div>
		</div>
	</div>

	<!-- About -->
	<div class="text-center text-xs text-muted-foreground">
		<p>FitLog v1.0.0</p>
		<p class="mt-1">Exercise data from ExerciseDB API</p>
	</div>
</div>
