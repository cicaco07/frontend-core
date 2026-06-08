<script lang="ts">
	import type { Loadout } from '$lib/stores/loadout.svelte';
	import type { Hero } from '$lib/types';
	import type { Item, Emblem } from '$lib/types/equipment';
	import { roleColor, titleCase } from '$lib/utils/labels';

	let {
		loadout,
		heroes,
		items,
		emblems,
		accent
	}: {
		loadout: Loadout;
		heroes: Hero[];
		items: Item[];
		emblems: Emblem[];
		accent: string;
	} = $props();

	function onHero(event: Event) {
		const slug = (event.target as HTMLSelectElement).value;
		loadout.hero = heroes.find((h) => h.slug === slug) ?? null;
	}

	function onEmblem(event: Event) {
		const slug = (event.target as HTMLSelectElement).value;
		loadout.emblem = emblems.find((e) => e.slug === slug) ?? null;
	}

	function addItem(event: Event) {
		const select = event.target as HTMLSelectElement;
		const item = items.find((i) => i.id === select.value);
		if (item) loadout.addItem(item);
		select.value = '';
	}
</script>

<div class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4" style="border-top:3px solid {accent}">
	<label class="block">
		<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">Hero</span>
		<select
			onchange={onHero}
			value={loadout.hero?.slug ?? ''}
			class="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink"
		>
			<option value="">Select hero…</option>
			{#each heroes as hero (hero.id)}
				<option value={hero.slug}>{hero.name}</option>
			{/each}
		</select>
	</label>

	{#if loadout.hero}
		<p
			class="flex items-center gap-2 text-sm capitalize"
			style="color:{roleColor(loadout.hero.role)}"
		>
			<span
				class="inline-block h-2 w-2 rounded-full"
				style="background:{roleColor(loadout.hero.role)}"
			></span>
			{titleCase(loadout.hero.role)}
		</p>
	{/if}

	<label class="block">
		<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">Level: {loadout.level}</span>
		<input type="range" min="1" max="15" bind:value={loadout.level} class="mt-1 w-full" />
	</label>

	<label class="block">
		<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase">Emblem</span>
		<select
			onchange={onEmblem}
			value={loadout.emblem?.slug ?? ''}
			class="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink"
		>
			<option value="">No emblem</option>
			{#each emblems as emblem (emblem.id)}
				<option value={emblem.slug}>{emblem.name}</option>
			{/each}
		</select>
	</label>

	<div>
		<span class="text-xs tracking-wide text-slate-500 uppercase"
			>Items ({loadout.items.length}/6)</span
		>
		<ul class="mt-1 space-y-1">
			{#each loadout.items as item, i (item.id + i)}
				<li class="flex items-center justify-between rounded bg-slate-900 px-2 py-1 text-sm">
					<span class="text-slate-200">{item.name}</span>
					<button
						type="button"
						onclick={() => loadout.removeItem(i)}
						class="text-xs text-slate-500 hover:text-red-400">remove</button
					>
				</li>
			{/each}
		</ul>
		{#if loadout.items.length < 6}
			<select
				onchange={addItem}
				value=""
				class="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
			>
				<option value="">Add item…</option>
				{#each items as item (item.id)}
					<option value={item.id}>{item.name}</option>
				{/each}
			</select>
		{/if}
	</div>
</div>
