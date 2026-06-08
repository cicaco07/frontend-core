<script lang="ts">
	import type { PageData } from './$types';
	import { loadout } from '$lib/stores/loadout.svelte';
	import { resolve } from '$app/paths';
	import LoadoutColumn from '$lib/components/calculator/LoadoutColumn.svelte';

	let { data }: { data: PageData } = $props();

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="font-display text-3xl font-bold text-ink">Theorycrafter</h1>
			<p class="mt-1 text-sm text-ink-muted">Hitung damage, DPS, dan output build secara real-time.</p>
		</div>
		<a
			href={resolve('/theorycrafter/versus')}
			class="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-bg"
		>
			Versus mode →
		</a>
	</div>

	<div class="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
		<LoadoutColumn
			{loadout}
			heroes={data.heroes}
			items={data.items}
			emblems={data.emblems}
			accent="#ff865b"
		/>

		<section class="flex min-h-[520px] items-center justify-center rounded-3xl border border-line bg-surface/60 p-6 text-center">
			<div>
				<div class="mx-auto mb-5 size-40 rounded-full border border-accent/40 bg-accent/10"></div>
				<h2 class="font-display text-4xl font-bold text-ink uppercase">{loadout.hero?.name ?? 'LAYLA'}</h2>
				<p class="mt-2 text-sm text-ink-muted">Malefic Gun build · Physical carry</p>
				<div class="mt-5 flex justify-center gap-3">
					{#each loadout.items.slice(0, 4) as item (item.id)}
						<span class="size-14 overflow-hidden rounded-xl border border-line bg-surface-3">
							{#if item.imageUrl}<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />{/if}
						</span>
					{/each}
				</div>
			</div>
		</section>

		<section class="space-y-3 rounded-2xl border border-line bg-surface/82 p-4">
			<h2 class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">Output</h2>
			<dl class="space-y-3 text-sm">
				<div class="flex justify-between">
					<dt class="text-ink-muted">Physical Attack</dt>
					<dd class="font-mono-stat">{round(loadout.finalStats.physicalAttack)}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-ink-muted">Magic Power</dt>
					<dd class="font-mono-stat">{round(loadout.finalStats.magicPower)}</dd>
				</div>
				<div class="flex justify-between">
					<dt class="text-ink-muted">Avg Basic Attack</dt>
					<dd class="font-mono-stat">{round(loadout.basicAttackDamage)}</dd>
				</div>
				<div class="flex justify-between border-t border-line pt-3 font-semibold">
					<dt>DPS</dt>
					<dd class="font-mono-stat text-accent">{round(loadout.dps)}</dd>
				</div>
			</dl>
		</section>
	</div>
</div>
