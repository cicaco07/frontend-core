<script lang="ts">
	let {
		filterMode = $bindable('lane')
	}: {
		filterMode?: 'lane' | 'type';
	} = $props();

	let open = $state(false);
</script>

<div class="relative">
	<button
		type="button"
		onclick={() => (open = !open)}
		class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition"
		class:border-accent={open}
		class:bg-surface-3={open}
		class:text-ink={open}
		class:border-line={!open}
		class:text-ink-muted={!open}
		class:hover:border-line-strong={!open}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
				clip-rule="evenodd"
			/>
		</svg>
		{filterMode === 'lane' ? 'By Lane' : 'By Type'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-3 w-3 transition-transform"
			class:rotate-180={open}
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>

	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-20 cursor-default"
			tabindex="-1"
			onclick={() => (open = false)}
			aria-label="Close filter menu"
		></button>
		<div
			class="absolute top-full right-0 z-30 mt-1 w-40 rounded-lg border border-line bg-surface p-1 shadow-lg shadow-black/20"
		>
			<button
				type="button"
				onclick={() => {
					filterMode = 'lane';
					open = false;
				}}
				class="w-full rounded-md px-3 py-2 text-left text-sm transition"
				class:bg-surface-3={filterMode === 'lane'}
				class:text-ink={filterMode === 'lane'}
				class:text-ink-muted={filterMode !== 'lane'}
				class:hover:bg-surface-3={filterMode !== 'lane'}
			>
				By Lane
			</button>
			<button
				type="button"
				onclick={() => {
					filterMode = 'type';
					open = false;
				}}
				class="w-full rounded-md px-3 py-2 text-left text-sm transition"
				class:bg-surface-3={filterMode === 'type'}
				class:text-ink={filterMode === 'type'}
				class:text-ink-muted={filterMode !== 'type'}
				class:hover:bg-surface-3={filterMode !== 'type'}
			>
				By Type
			</button>
		</div>
	{/if}
</div>
