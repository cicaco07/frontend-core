<script lang="ts">
	import { loadout } from '$lib/stores/loadout.svelte';

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}
</script>

<h1 class="mb-6 text-2xl font-bold">Theorycrafter</h1>

<div class="grid gap-6 md:grid-cols-2">
	<section class="space-y-4 rounded-md border border-slate-800 p-4">
		<h2 class="font-semibold">Loadout</h2>

		<label class="block text-sm">
			Level: {loadout.level}
			<input type="range" min="1" max="15" bind:value={loadout.level} class="w-full" />
		</label>

		<p class="text-sm text-slate-400">
			{#if loadout.hero}
				Hero: {loadout.hero.name}
			{:else}
				No hero selected. Wire hero selection to the backend API.
			{/if}
		</p>

		<p class="text-sm text-slate-400">Items: {loadout.items.length} / 6</p>
	</section>

	<section class="space-y-3 rounded-md border border-slate-800 p-4">
		<h2 class="font-semibold">Output</h2>
		<dl class="space-y-2 text-sm">
			<div class="flex justify-between">
				<dt class="text-slate-400">Physical Attack</dt>
				<dd>{round(loadout.finalStats.physicalAttack)}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Magic Power</dt>
				<dd>{round(loadout.finalStats.magicPower)}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Avg Basic Attack</dt>
				<dd>{round(loadout.basicAttackDamage)}</dd>
			</div>
			<div class="flex justify-between border-t border-slate-800 pt-2 font-semibold">
				<dt>DPS</dt>
				<dd>{round(loadout.dps)}</dd>
			</div>
		</dl>
	</section>
</div>
