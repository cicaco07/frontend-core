<script lang="ts">
	import { Swords, Shield } from 'lucide-svelte';

	interface StatRow {
		label: string;
		value: number;
		color: string;
		suffix?: string;
		isPct?: boolean;
	}

	let {
		offenseStats,
		defenseStats,
		targetOffenseStats,
		targetDefenseStats,
		onToggleBreakdown,
		openBreakdown,
		renderStatBreakdown,
		renderTargetStatBreakdown,
		round
	}: {
		offenseStats: StatRow[];
		defenseStats: StatRow[];
		targetOffenseStats: StatRow[];
		targetDefenseStats: StatRow[];
		onToggleBreakdown: (label: string) => void;
		openBreakdown: string | null;
		renderStatBreakdown: (label: string) => string;
		renderTargetStatBreakdown: (label: string) => string;
		round: (n: number) => number;
	} = $props();
</script>

<div class="w-full">
	<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
		<Swords class="size-3.5" /> Offense
	</div>
	<div class="space-y-1">
		{#each offenseStats as row, i (row.label)}
			{@const targetRow = targetOffenseStats[i]}
			<div class="relative">
				<button
					type="button"
					onclick={() => onToggleBreakdown(row.label)}
					class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
				>
					<span class="font-mono-stat text-left text-ink tabular-nums"
						>{round(row.value)}{row.suffix ?? ''}</span
					>
					<span class="text-center text-ink-muted">{row.label}</span>
					<span class="font-mono-stat text-right text-ink tabular-nums"
						>{round(targetRow.value)}{targetRow.suffix ?? ''}</span
					>
				</button>
				{#if openBreakdown === row.label}
					<div
						class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
					>
						<div class="grid grid-cols-2 gap-4">
							<div>
								{@html renderStatBreakdown(row.label)}
							</div>
							<div>
								{@html renderTargetStatBreakdown(row.label)}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="mt-4 mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
		<Shield class="size-3.5" /> Defense
	</div>
	<div class="space-y-1">
		{#each defenseStats as row, i (row.label)}
			{@const targetRow = targetDefenseStats[i]}
			<div class="relative">
				<button
					type="button"
					onclick={() => onToggleBreakdown(row.label)}
					class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
				>
					<span class="font-mono-stat text-left text-ink tabular-nums"
						>{round(row.value)}{row.suffix ?? ''}</span
					>
					<span class="text-center text-ink-muted">{row.label}</span>
					<span class="font-mono-stat text-right text-ink tabular-nums"
						>{round(targetRow.value)}{targetRow.suffix ?? ''}</span
					>
				</button>
				{#if openBreakdown === row.label}
					<div
						class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
					>
						<div class="grid grid-cols-2 gap-4">
							<div>
								{@html renderStatBreakdown(row.label)}
							</div>
							<div>
								{@html renderTargetStatBreakdown(row.label)}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
