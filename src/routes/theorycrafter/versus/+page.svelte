<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { Versus } from '$lib/stores/versus.svelte';
	import LoadoutColumn from '$lib/components/calculator/LoadoutColumn.svelte';

	let { data }: { data: PageData } = $props();

	const vs = new Versus();

	function round(n: number): number {
		if (!Number.isFinite(n)) return Infinity;
		return Math.round(n * 10) / 10;
	}

	function ttk(seconds: number): string {
		return Number.isFinite(seconds) ? `${round(seconds)}s` : '∞';
	}

	const nameA = $derived(vs.a.hero?.name ?? 'Hero A');
	const nameB = $derived(vs.b.hero?.name ?? 'Hero B');
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<a href={resolve('/theorycrafter')} class="text-sm text-slate-400 hover:text-white"
				>&larr; Kalkulator Damage</a
			>
			<h1 class="mt-1 text-2xl font-bold">Versus</h1>
			<p class="text-sm text-slate-400">
				Compare damage and survivability between two builds to find the right counter.
			</p>
		</div>
		<button
			type="button"
			onclick={() => vs.swap()}
			class="rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
		>
			Swap sides
		</button>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<LoadoutColumn
			loadout={vs.a}
			heroes={data.heroes}
			items={data.items}
			emblems={data.emblems}
			accent="#5b8cff"
		/>
		<LoadoutColumn
			loadout={vs.b}
			heroes={data.heroes}
			items={data.items}
			emblems={data.emblems}
			accent="#fb6a6a"
		/>
	</div>

	{#if !vs.ready}
		<p class="rounded-md border border-slate-800 p-4 text-sm text-slate-400">
			Select a hero on both sides to see the comparison.
		</p>
	{:else}
		<div class="rounded-md border border-slate-800 p-4">
			<div class="mb-4 text-center">
				<p class="text-xs tracking-wide text-slate-500 uppercase">First blood favors</p>
				<p class="text-lg font-bold">
					{#if vs.result.firstBloodFavors === 'a'}
						<span style="color:#5b8cff">{nameA}</span>
					{:else if vs.result.firstBloodFavors === 'b'}
						<span style="color:#fb6a6a">{nameB}</span>
					{:else}
						<span class="text-slate-400">Even matchup</span>
					{/if}
				</p>
			</div>

			<table class="w-full text-sm">
				<thead>
					<tr class="text-xs tracking-wide text-slate-500 uppercase">
						<th class="px-2 py-2 text-left">Metric</th>
						<th class="px-2 py-2 text-right" style="color:#5b8cff">{nameA} → {nameB}</th>
						<th class="px-2 py-2 text-right" style="color:#fb6a6a">{nameB} → {nameA}</th>
					</tr>
				</thead>
				<tbody class="font-mono tabular-nums">
					<tr class="border-t border-slate-800/60">
						<td class="px-2 py-2 font-sans text-slate-400">Avg Basic Attack</td>
						<td class="px-2 py-2 text-right">{round(vs.result.aToB.basicAttack)}</td>
						<td class="px-2 py-2 text-right">{round(vs.result.bToA.basicAttack)}</td>
					</tr>
					<tr class="border-t border-slate-800/60">
						<td class="px-2 py-2 font-sans text-slate-400">DPS</td>
						<td class="px-2 py-2 text-right">{round(vs.result.aToB.dps)}</td>
						<td class="px-2 py-2 text-right">{round(vs.result.bToA.dps)}</td>
					</tr>
					<tr class="border-t border-slate-800/60">
						<td class="px-2 py-2 font-sans text-slate-400">Skill Burst</td>
						<td class="px-2 py-2 text-right">{round(vs.result.aToB.burst)}</td>
						<td class="px-2 py-2 text-right">{round(vs.result.bToA.burst)}</td>
					</tr>
					<tr class="border-t border-slate-800/60">
						<td class="px-2 py-2 font-sans text-slate-400">Time to Kill</td>
						<td class="px-2 py-2 text-right">{ttk(vs.result.aToB.timeToKillSeconds)}</td>
						<td class="px-2 py-2 text-right">{ttk(vs.result.bToA.timeToKillSeconds)}</td>
					</tr>
				</tbody>
			</table>

			<p class="mt-3 text-xs text-slate-500">
				Time to Kill uses DPS against effective HP (HP scaled by the defender's resistance to the
				attacker's primary damage type). Lower wins. Burst is shown separately and not factored into
				the kill-time race.
			</p>
		</div>
	{/if}
</div>
