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
			const q = query.trim().toLowerCase();
			return (category === null || item.category === category) && (q === '' || item.name.toLowerCase().includes(q));
		})
	);

	const sections = $derived([
		{ title: 'Tier 1', items: filtered.filter((i) => i.tier === 'TIER_1').sort((a, b) => a.cost - b.cost) },
		{ title: 'Tier 2', items: filtered.filter((i) => i.tier === 'TIER_2').sort((a, b) => a.cost - b.cost) },
		{ title: 'Tier 3', items: filtered.filter((i) => i.tier === 'TIER_3').sort((a, b) => a.cost - b.cost) },
		{ title: 'Other', items: filtered.filter((i) => i.tier === 'ETC').sort((a, b) => a.cost - b.cost) }
	]);
</script>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
	<header class="overflow-hidden rounded-3xl border border-line bg-surface/70 p-6 shadow-xl shadow-black/10">
		<p class="font-display text-xs font-bold tracking-[0.22em] text-accent uppercase">Database</p>
		<div class="mt-3 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="font-display text-3xl font-bold text-ink sm:text-4xl">Items Database</h1>
				<p class="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">Item Mobile Legends lengkap dengan kategori, tier, cost, stats, dan passive effect.</p>
			</div>
			<span class="rounded-full border border-line bg-bg/60 px-4 py-2 text-sm font-semibold text-ink-muted">{filtered.length} of {data.items.length} items</span>
		</div>
	</header>

	<section class="space-y-4 rounded-3xl border border-line bg-surface/55 p-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<input
				type="search"
				placeholder="Search item…"
				bind:value={query}
				class="min-w-56 rounded-full border border-line bg-bg/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none sm:w-80"
			/>
			{#if category !== null || query.trim() !== ''}
				<button type="button" onclick={() => { category = null; query = ''; }} class="rounded-full border border-negative/40 px-4 py-2 text-xs font-bold text-negative transition hover:bg-negative/10">Reset</button>
			{/if}
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				onclick={() => (category = null)}
				class="rounded-full border px-3 py-2 text-xs font-bold transition"
				class:border-accent={category === null}
				class:bg-accent={category === null}
				class:text-bg={category === null}
				class:border-line={category !== null}
				class:text-ink-muted={category !== null}
			>
				All
			</button>
			{#each ITEM_CATEGORIES as cat (cat)}
				<button
					type="button"
					onclick={() => (category = category === cat ? null : cat)}
					class="rounded-full border px-3 py-2 text-xs font-bold capitalize transition"
					class:text-bg={category === cat}
					class:text-ink-muted={category !== cat}
					style={category === cat ? `border-color:${categoryColor(cat)};background:${categoryColor(cat)}` : ''}
				>
					{titleCase(cat)}
				</button>
			{/each}
		</div>
	</section>

	{#if data.items.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-10 text-center">
			<p class="font-display text-xl font-bold text-ink">No items loaded yet</p>
			<p class="mt-2 text-sm text-ink-muted">Connect the backend API to show items.</p>
		</div>
	{:else if filtered.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-10 text-center">
			<p class="font-display text-xl font-bold text-ink">No items match your filters</p>
			<p class="mt-2 text-sm text-ink-muted">Try another keyword or reset the category filter.</p>
		</div>
	{:else}
		{#snippet itemCard(item: Item)}
			<li class="group rounded-3xl border border-line bg-surface/78 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-accent/35" style="border-top-color:{categoryColor(item.category)}">
				<div class="flex items-start gap-4">
					<span class="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-bg/55 shadow-[0_0_28px_rgb(255_134_91/0.08)]">
						{#if item.imageUrl}<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" loading="lazy" />{/if}
					</span>
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-3">
							<div class="min-w-0">
								<span class="rounded-full px-2.5 py-1 text-[10px] font-bold text-ink uppercase" style="background:{categoryColor(item.category)}22;color:{categoryColor(item.category)}">{titleCase(item.category)}</span>
								<h3 class="font-display mt-2 truncate text-lg font-bold text-ink">{item.name}</h3>
							</div>
							<span class="font-mono-stat rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-gold">{item.cost}</span>
						</div>
					</div>
				</div>

				{#if statEntries(item.stats).length}
					<div class="mt-4 rounded-2xl border border-line bg-bg/45 p-3">
						<p class="mb-2 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Stats</p>
						<ul class="space-y-1.5 text-sm">
							{#each statEntries(item.stats) as entry (entry.key)}
								<li class="flex justify-between gap-3"><span class="text-ink-muted">{entry.label}</span><b class="font-mono-stat text-good">+{entry.display}</b></li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if item.passiveName}
					<div class="mt-4 rounded-2xl border border-accent/20 bg-accent/5 p-3">
						<p class="text-xs font-bold text-accent">{item.passiveName}</p>
						{#if item.passiveDescription}<p class="mt-1 text-xs leading-5 text-ink-muted">{item.passiveDescription}</p>{/if}
					</div>
				{/if}
			</li>
		{/snippet}

		{#each sections as section (section.title)}
			{#if section.items.length}
				<section>
					<div class="mb-4 flex items-center justify-between gap-4">
						<h2 class="font-display text-2xl font-bold text-ink">{section.title}</h2>
						<p class="text-sm text-ink-muted">{section.items.length} items</p>
					</div>
					<ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{#each section.items as item (item.id)}
							{@render itemCard(item)}
						{/each}
					</ul>
				</section>
			{/if}
		{/each}
	{/if}
</div>
