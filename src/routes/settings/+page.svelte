<script lang="ts">
	import { Button } from '$lib/components/ui/button';
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

<div class="fl-page-enter space-y-6">
	<div class="fl-page-header">
		<h1 class="fl-page-title">Settings</h1>
		<p class="fl-page-subtitle">Customize your FitLog experience</p>
	</div>

	<!-- Profile Group -->
	<div class="settings-group">
		<div class="fl-settings-row">
			<div class="settings-row-info">
				<User class="h-[18px] w-[18px] text-muted-foreground" />
				<div>
					<p class="settings-row-label">Your Name</p>
					<p class="settings-row-hint">Shown on the home screen</p>
				</div>
			</div>
			<Input
				value={prefs.userName ?? ''}
				placeholder="Name"
				oninput={(e) => setUserName(e.currentTarget.value)}
				class="h-9 w-32 text-right text-sm"
			/>
		</div>
	</div>

	<!-- Appearance Group -->
	<div class="settings-group">
		<p class="settings-group-label">Appearance</p>
		<div class="fl-settings-row">
			<div class="settings-row-info">
				{#if theme === 'dark'}
					<Moon class="h-[18px] w-[18px] text-muted-foreground" />
				{:else}
					<Sun class="h-[18px] w-[18px] text-muted-foreground" />
				{/if}
				<div>
					<p class="settings-row-label">Theme</p>
					<p class="settings-row-hint capitalize">{theme} mode</p>
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={toggleMode}>Toggle</Button>
		</div>
	</div>

	<!-- Workout Group -->
	<div class="settings-group">
		<p class="settings-group-label">Workout</p>
		<div class="fl-settings-row">
			<div class="settings-row-info">
				<Weight class="h-[18px] w-[18px] text-muted-foreground" />
				<div>
					<p class="settings-row-label">Weight Unit</p>
					<p class="settings-row-hint">Currently using {prefs.weightUnit}</p>
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

		<div class="fl-settings-row">
			<div class="settings-row-info">
				<Timer class="h-[18px] w-[18px] text-muted-foreground" />
				<div>
					<p class="settings-row-label">Default Rest Timer</p>
					<p class="settings-row-hint">{prefs.restTimerDefault} seconds</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="outline" size="sm" onclick={() => setRestTimerDefault(Math.max(15, prefs.restTimerDefault - 15))}>-</Button>
				<span class="w-10 text-center text-sm font-mono tabular-nums">{prefs.restTimerDefault}s</span>
				<Button variant="outline" size="sm" onclick={() => setRestTimerDefault(Math.min(300, prefs.restTimerDefault + 15))}>+</Button>
			</div>
		</div>

		<div class="fl-settings-row">
			<div class="settings-row-info">
				{#if prefs.soundEnabled}
					<Volume2 class="h-[18px] w-[18px] text-muted-foreground" />
				{:else}
					<VolumeOff class="h-[18px] w-[18px] text-muted-foreground" />
				{/if}
				<div>
					<p class="settings-row-label">Sound Effects</p>
					<p class="settings-row-hint">Timer completion alerts</p>
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

		<div class="fl-settings-row">
			<div class="settings-row-info">
				<Smartphone class="h-[18px] w-[18px] text-muted-foreground" />
				<div>
					<p class="settings-row-label">Vibration</p>
					<p class="settings-row-hint">Haptic feedback on mobile</p>
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
	</div>

	<!-- Data Group -->
	<div class="settings-group">
		<p class="settings-group-label">Data Management</p>

		<button onclick={exportData} class="data-btn">
			<Download class="h-4 w-4 text-muted-foreground" />
			<span>Export Data (JSON)</span>
		</button>

		<div>
			<button onclick={() => fileInput.click()} class="data-btn">
				<Upload class="h-4 w-4 text-muted-foreground" />
				<span>Import Data</span>
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept=".json"
				class="hidden"
				onchange={handleImport}
			/>
			{#if importStatus}
				<p class="mt-1.5 text-center text-xs text-muted-foreground">{importStatus}</p>
			{/if}
		</div>

		<button onclick={clearAllData} class="data-btn data-btn-danger">
			<Trash2 class="h-4 w-4" />
			<span>Clear All Data</span>
		</button>
	</div>

	<!-- Privacy notice -->
	<div class="privacy-card">
		<Shield class="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-400" />
		<div class="space-y-0.5">
			<p class="text-[0.8125rem] font-medium">Your Data is Private</p>
			<p class="text-xs leading-relaxed text-muted-foreground">
				All workout data is stored locally on this device.
				Each person has completely separate data.
				Use Export to back up or transfer between devices.
			</p>
		</div>
	</div>

	<!-- About -->
	<div class="pb-4 text-center text-[0.6875rem] text-muted-foreground/50">
		<p>FitLog v1.0.0</p>
		<p class="mt-0.5">Exercise data from ExerciseDB API</p>
	</div>
</div>

<style>
	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.settings-group-label {
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		padding-left: 0.25rem;
		margin-bottom: 0.125rem;
	}

	.settings-row-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.settings-row-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.settings-row-hint {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		margin-top: 0.0625rem;
	}

	.data-btn {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		background: oklch(0.19 0.006 286);
		border: 1px solid oklch(1 0 0 / 0.08);
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--foreground);
		transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s var(--ease-spring);
		-webkit-tap-highlight-color: transparent;
	}
	.data-btn:hover {
		background: oklch(0.22 0.006 286);
		border-color: oklch(1 0 0 / 0.12);
	}
	.data-btn:active {
		transform: scale(0.98);
	}
	:global(:root:not(.dark)) .data-btn {
		background: white;
		border-color: oklch(0 0 0 / 0.06);
		box-shadow: 0 1px 3px oklch(0 0 0 / 0.04);
	}
	:global(:root:not(.dark)) .data-btn:hover {
		background: oklch(0.97 0 0);
		border-color: oklch(0 0 0 / 0.1);
	}

	.data-btn-danger {
		color: var(--destructive);
	}

	.privacy-card {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		background: oklch(0.18 0.02 155);
		border: 1px solid oklch(0.5 0.12 155 / 0.2);
	}
	:global(:root:not(.dark)) .privacy-card {
		background: oklch(0.96 0.02 155);
		border-color: oklch(0.5 0.12 155 / 0.2);
	}
</style>
