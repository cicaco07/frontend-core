<script lang="ts">
	import type { Item, ItemCategory } from '$lib/types/equipment';
	import { X } from 'lucide-svelte';

	let {
		label = 'Items',
		items,
		etcItems = [],
		onAddItem,
		onAddEtcItem,
		onRemoveItem,
		onMoveItem,
		searchQuery = $bindable(''),
		categoryFilter = $bindable(null)
	}: {
		label?: string;
		items: (Item | null)[];
		etcItems?: Item[];
		onAddItem: (item: Item) => void;
		onAddEtcItem?: (item: Item) => void;
		onRemoveItem: (index: number) => void;
		onMoveItem: (from: number, to: number) => void;
		searchQuery?: string;
		categoryFilter?: ItemCategory | null;
	} = $props();

	let dragItem = $state<Item | null>(null);
	let dragSlotIndex = $state<number | null>(null);

	function onDragStart(item: Item) {
		dragItem = item;
		dragSlotIndex = null;
	}

	function onSlotDragStart(index: number) {
		dragSlotIndex = index;
		dragItem = null;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDropSlot(e: DragEvent, targetIndex: number) {
		e.preventDefault();
		if (dragSlotIndex !== null) {
			onMoveItem(dragSlotIndex, targetIndex);
			dragSlotIndex = null;
		} else if (dragItem) {
			onAddItem(dragItem);
			dragItem = null;
		}
	}
</script>

<div>
	<div class="flex items-center justify-between">
		<span class="text-xs tracking-wide text-ink-faint uppercase">{label}</span>
	</div>
	<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
		{#each [0, 1, 2, 3, 4, 5] as i (i)}
			{@const item = items[i]}
			<div
				class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
				class:border-accent-40={item}
				class:border-line={!item}
				class:bg-surface-3={item}
				role="listitem"
				draggable={item ? 'true' : 'false'}
				ondragstart={() => item && onSlotDragStart(i)}
				ondragover={onDragOver}
				ondrop={(e) => onDropSlot(e, i)}
			>
				{#if item}
					{#if item.imageUrl}
						<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
					{:else}
						<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
					{/if}
					<button
						type="button"
						onclick={() => onRemoveItem(i)}
						class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
					>
						<X class="size-3" />
					</button>
				{:else}
					<span class="text-xs text-ink-faint">+</span>
				{/if}
			</div>
		{/each}
	</div>
</div>
