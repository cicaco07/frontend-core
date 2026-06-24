<script lang="ts">
	import SearchSelect from '$lib/components/SearchSelect.svelte';
	import type { Emblem } from '$lib/types/equipment';

	let {
		groups,
		getSelected,
		onSelect,
		emblemSelectItems
	}: {
		groups: Array<{ key: string; label: string; items: Emblem[] }>;
		getSelected: (key: string) => Emblem | null | undefined;
		onSelect: (key: string, itemId: string) => void;
		emblemSelectItems: (items: Emblem[]) => Array<{ id: string; label: string; imageUrl?: string }>;
	} = $props();
</script>

<div class="border-t border-line pt-4">
	<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
		>Emblem Set</span
	>
	<div class="mt-2 space-y-2">
		{#each groups as group (group.key)}
			{@const selected = group.items.find(
				(e) => e.slug === getSelected(group.key)?.slug
			)}
			<SearchSelect
				items={emblemSelectItems(group.items)}
				value={selected
					? { id: selected.slug, label: selected.name, imageUrl: selected.icon || undefined }
					: null}
				placeholder={group.label + '…'}
				onchange={(item) => onSelect(group.key, item?.id ?? '')}
			/>
		{/each}
	</div>
</div>
