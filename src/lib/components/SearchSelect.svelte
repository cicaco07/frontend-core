<script lang="ts">
	import { ChevronDown, X, Search } from 'lucide-svelte';

	interface SelectItem {
		id: string;
		label: string;
		imageUrl?: string;
	}

	let {
		items = [],
		value = null,
		placeholder = 'Select...',
		onchange,
		clearable = true,
		class: className = ''
	}: {
		items: SelectItem[];
		value: SelectItem | null;
		placeholder?: string;
		onchange?: (item: SelectItem | null) => void;
		clearable?: boolean;
		class?: string;
	} = $props();

	let open = $state(false);
	let search = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);

	const filtered = $derived(
		search.trim()
			? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
			: items
	);

	function select(item: SelectItem) {
		value = item;
		open = false;
		search = '';
		onchange?.(item);
	}

	function clear(e: MouseEvent) {
		e.stopPropagation();
		value = null;
		search = '';
		onchange?.(null);
	}

	function toggle() {
		open = !open;
		if (open) {
			search = '';
			setTimeout(() => inputEl?.focus(), 0);
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
			search = '';
		}
	}
</script>

<svelte:window
	onclick={(e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-search-select]')) open = false;
	}}
/>

<div class="relative {className}" data-search-select>
	<button
		type="button"
		onclick={toggle}
		class="flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink transition hover:border-ink-faint"
	>
		{#if value}
			{#if value.imageUrl}
				<span class="size-5 shrink-0 overflow-hidden rounded">
					<img src={value.imageUrl} alt="" class="h-full w-full object-cover" />
				</span>
			{/if}
			<span class="flex-1 truncate text-left">{value.label}</span>
			{#if clearable}
				<span
					role="button"
					tabindex="0"
					onclick={clear}
					onkeydown={(e) => {
						if (e.key === 'Enter') clear(e as unknown as MouseEvent);
					}}
					class="shrink-0 cursor-pointer rounded p-0.5 text-ink-faint hover:text-ink"
				>
					<X class="size-3.5" />
				</span>
			{/if}
		{:else}
			<span class="flex-1 text-left text-ink-faint">{placeholder}</span>
		{/if}
		<ChevronDown class="size-4 shrink-0 text-ink-faint transition {open ? 'rotate-180' : ''}" />
	</button>

	{#if open}
		<div
			class="absolute z-30 mt-1 w-full rounded-lg border border-line bg-bg shadow-lg"
			role="listbox"
		>
			<div class="flex items-center gap-2 border-b border-line px-3 py-2">
				<Search class="size-3.5 text-ink-faint" />
				<input
					bind:this={inputEl}
					type="text"
					bind:value={search}
					onkeydown={onKeydown}
					placeholder="Search..."
					class="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
				/>
			</div>
			<div class="max-h-48 overflow-y-auto">
				{#if filtered.length === 0}
					<div class="px-3 py-2 text-xs text-ink-faint">No results</div>
				{:else}
					{#each filtered as item (item.id)}
						<button
							type="button"
							onclick={() => select(item)}
							role="option"
							aria-selected={value?.id === item.id}
							class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink transition hover:bg-surface-2 {value?.id ===
							item.id
								? 'bg-accent/10 text-accent'
								: ''}"
						>
							{#if item.imageUrl}
								<span class="size-5 shrink-0 overflow-hidden rounded">
									<img src={item.imageUrl} alt="" class="h-full w-full object-cover" />
								</span>
							{/if}
							<span class="truncate">{item.label}</span>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
