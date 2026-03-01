import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

let theme = $state<Theme>('system');

function getSystemPreference(): 'light' | 'dark' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(t: Theme) {
	if (!browser) return;
	const resolved = t === 'system' ? getSystemPreference() : t;
	document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function initTheme() {
	if (!browser) return;
	const stored = localStorage.getItem('fitlog-theme') as Theme | null;
	theme = stored ?? 'system';
	applyTheme(theme);

	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (theme === 'system') applyTheme('system');
	});
}

export function toggleMode() {
	const resolved = theme === 'system' ? getSystemPreference() : theme;
	theme = resolved === 'dark' ? 'light' : 'dark';
	if (browser) localStorage.setItem('fitlog-theme', theme);
	applyTheme(theme);
}

export function getTheme(): Theme {
	return theme;
}
