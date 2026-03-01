<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		muscle: string;
		variant?: 'default' | 'secondary' | 'outline';
		size?: 'sm' | 'default';
	}

	let { muscle, variant = 'secondary', size = 'sm' }: Props = $props();

	const BODY_PART_COLORS: Record<string, string> = {
		CHEST: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
		BACK: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
		SHOULDERS: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
		'UPPER ARMS': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
		BICEPS: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
		TRICEPS: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
		QUADRICEPS: 'bg-green-500/15 text-green-400 border-green-500/20',
		THIGHS: 'bg-green-500/15 text-green-400 border-green-500/20',
		HAMSTRINGS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
		CALVES: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
		WAIST: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
		HIPS: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
		FOREARMS: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
		NECK: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
		'FULL BODY': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
	};

	function getColorClass(name: string): string {
		return BODY_PART_COLORS[name] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
	}

	function formatName(name: string): string {
		return name
			.split(' ')
			.map((w) => w.charAt(0) + w.slice(1).toLowerCase())
			.join(' ');
	}
</script>

<Badge
	{variant}
	class="{getColorClass(muscle)} border {size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'}"
>
	{formatName(muscle)}
</Badge>
