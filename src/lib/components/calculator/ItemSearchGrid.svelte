<script lang="ts">
	import type { Item, ItemCategory } from '$lib/types/equipment';
	import { titleCase, ITEM_CATEGORIES, categoryColor } from '$lib/utils/labels';

	let {
		items,
		etcItems = [],
		searchQuery = $bindable(''),
		categoryFilter = $bindable(null),
		onAddItem,
		onAddEtcItem,
		onDragStart
	}: {
		items: Item[];
		etcItems?: Item[];
		searchQuery?: string;
		categoryFilter?: ItemCategory | null;
		onAddItem: (item: Item) => void;
		onAddEtcItem?: (item: Item) => void;
		onDragStart?: (item: Item) => void;
	} = $props();
</script>

<div>
	<div class="mb-2 flex items-center gap-2">
		<input
			type="search"
			placeholder="Search item..."
			bind:value={searchQuery}
			class="flex-1 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
		/>
	</div>
	<div class="mb-2 flex flex-wrap gap-1">
		<button
			type="button"
			onclick={() => (categoryFilter = null)}
			class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
			class:bg-accent={categoryFilter === null}
			class:text-white={categoryFilter === null}
			class:bg-surface-3={categoryFilter !== null}
			class:text-ink-muted={categoryFilter !== null}>All</button
		>
		{#each ITEM_CATEGORIES as cat (cat)}
			<button
				type="button"
				onclick={() => (categoryFilter = categoryFilter === cat ? null : cat)}
				class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
				class:text-white={categoryFilter === cat}
				class:bg-surface-3={categoryFilter !== cat}
				class:text-ink-muted={categoryFilter !== cat}
				style={categoryFilter === cat ? `background:${categoryColor(cat)}` : ''}
				>{titleCase(cat)}</button
			>
		{/each}
	</div>
	<div class="max-h-52 overflow-y-auto">
		<div class="grid grid-cols-3 gap-1.5">
			{#each items as item (item.id)}
				<button
					type="button"
					draggable="true"
					ondragstart={() => onDragStart?.(item)}
					onclick={() => onAddItem(item)}
					class="flex flex-col items-center gap-1 rounded-lg border border-line bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-accent/40 hover:bg-surface-2"
				>
					<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
						{#if item.imageUrl}
							<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
						{/if}
					</span>
					<span class="w-full truncate text-ink">{item.name}</span>
				</button>
			{/each}
		</div>
	</div>
	{#if etcItems.length > 0}
		<div class="mt-3 border-t border-line pt-3">
			<span class="text-xs tracking-wide text-ink-faint uppercase">Optional (ETC)</span>
			<div class="mt-2 max-h-36 overflow-y-auto">
				<div class="grid grid-cols-3 gap-1.5">
					{#each etcItems as item (item.id)}
						<button
							type="button"
							draggable="true"
							ondragstart={() => onDragStart?.(item)}
							onclick={() => onAddEtcItem?.(item)}
							class="flex flex-col items-center gap-1 rounded-lg border border-amber-400/40 bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-amber-400 hover:bg-surface-2"
						>
							<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{/if}
							</span>
							<span class="w-full truncate text-ink">{item.name}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
