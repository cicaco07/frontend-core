<script lang="ts">
	import type { PageData } from './$types';
	import type { Item, ItemCategory } from '$lib/types/equipment';
	import { ITEM_CATEGORIES, categoryColor, titleCase } from '$lib/utils/labels';
	import { statEntries } from '$lib/utils/stats';

	let { data }: { data: PageData } = $props();

	let category = $state<ItemCategory | null>(null);
	let query = $state('');

	const filtered = $derived(
		data.items.filter((item) => {
			const matchesCat = category === null || item.category === category;
			const matchesQuery =
				query.trim() === '' || item.name.toLowerCase().includes(query.trim().toLowerCase());
			return matchesCat && matchesQuery;
		})
	);

	const tier1 = $derived(
		filtered.filter((i) => i.tier === 'TIER_1').sort((a, b) => a.cost - b.cost)
	);
	const tier2 = $derived(
		filtered.filter((i) => i.tier === 'TIER_2').sort((a, b) => a.cost - b.cost)
	);
	const tier3 = $derived(
		filtered.filter((i) => i.tier === 'TIER_3').sort((a, b) => a.cost - b.cost)
	);
	const tierEtc = $derived(
		filtered.filter((i) => i.tier === 'ETC').sort((a, b) => a.cost - b.cost)
	);
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-3xl font-bold text-ink">Items</h1>
			<p class="mt-1 text-sm text-ink-muted">{filtered.length} of {data.items.length} items</p>
		</div>
		<input
			type="search"
			placeholder="Search item…"
			bind:value={query}
			class="w-full max-w-xs rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
		/>
	</div>

	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => (category = null)}
			class="rounded-full border px-3 py-1 text-sm transition"
			class:border-line-strong={category === null}
			class:bg-surface-3={category === null}
			class:text-ink={category === null}
			class:border-line={category !== null}
			class:text-ink-muted={category !== null}
		>
			All
		</button>
		{#each ITEM_CATEGORIES as cat (cat)}
			<button
				type="button"
				onclick={() => (category = category === cat ? null : cat)}
				class="rounded-full border px-3 py-1 text-sm capitalize transition"
				class:text-ink={category === cat}
				class:text-ink-muted={category !== cat}
				style={category === cat
					? `border-color:${categoryColor(cat)};background:${categoryColor(cat)}22`
					: ''}
			>
				{titleCase(cat)}
			</button>
		{/each}
	</div>

	{#if data.items.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No items loaded yet. Connect the backend API.
		</p>
	{:else if filtered.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No items match your filters.
		</p>
	{:else}
		{#snippet itemCard(item: Item)}
			<li
				class="rounded-2xl border border-line bg-surface/82 p-4 transition hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2"
				style="border-left:3px solid {categoryColor(item.category)}"
			>
				<div class="flex items-start justify-between gap-2">
					<div class="flex items-center gap-3">
						<span class="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-surface-3">
							{#if item.imageUrl}
								<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
							{/if}
						</span>
						<div>
							<p class="font-display font-bold text-ink">{item.name}</p>
							<p class="text-xs text-ink-muted capitalize">
								{item.type || titleCase(item.category)}
							</p>
						</div>
					</div>
					<span class="font-mono-stat text-sm text-gold tabular-nums">{item.cost}</span>
				</div>

				{#if statEntries(item.stats).length}
					<ul class="mt-3 space-y-1 text-sm">
						{#each statEntries(item.stats) as entry (entry.key)}
							<li class="flex justify-between">
								<span class="text-ink-muted">{entry.label}</span>
								<span class="font-mono-stat text-ink tabular-nums">+{entry.display}</span>
							</li>
						{/each}
					</ul>
				{/if}

				{#if item.passiveName}
					<div class="mt-3 border-t border-line pt-2">
						<p class="text-xs font-semibold text-accent-2">{item.passiveName}</p>
						{#if item.passiveDescription}
							<p class="mt-0.5 text-xs leading-relaxed text-ink-muted">
								{item.passiveDescription}
							</p>
						{/if}
					</div>
				{/if}
			</li>
		{/snippet}

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div>
				<h2 class="font-display mb-3 text-lg font-bold text-ink">Tier 1</h2>
				<ul class="space-y-4">
					{#each tier1 as item (item.id)}
						{@render itemCard(item)}
					{/each}
				</ul>
			</div>
			<div>
				<h2 class="font-display mb-3 text-lg font-bold text-ink">Tier 2</h2>
				<ul class="space-y-4">
					{#each tier2 as item (item.id)}
						{@render itemCard(item)}
					{/each}
				</ul>
			</div>
			<div>
				<h2 class="font-display mb-3 text-lg font-bold text-ink">Tier 3</h2>
				<ul class="space-y-4">
					{#each tier3 as item (item.id)}
						{@render itemCard(item)}
					{/each}
				</ul>
			</div>
		</div>

		{#if tierEtc.length > 0}
			<div class="mt-8">
				<h2 class="font-display mb-3 text-lg font-bold text-ink">Other</h2>
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each tierEtc as item (item.id)}
						{@render itemCard(item)}
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>
