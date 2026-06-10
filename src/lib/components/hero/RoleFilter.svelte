<script lang="ts">
	import type { HeroRole } from '$lib/types';
	import { HERO_ROLES, roleColor, titleCase } from '$lib/utils/labels';

	let {
		selectedRole = $bindable(null),
		selectedLane = $bindable(null)
	}: {
		selectedRole?: HeroRole | null;
		selectedLane?: string | null;
	} = $props();

	const LANES = ['Gold Lane', 'Mid Lane', 'Exp Lane', 'Jungle', 'Roam'] as const;

	let open = $state(false);
	let tab = $state<'lane' | 'type'>('lane');

	const activeCount = $derived((selectedRole ? 1 : 0) + (selectedLane ? 1 : 0));

	function toggleRole(role: HeroRole) {
		selectedRole = selectedRole === role ? null : role;
	}

	function toggleLane(lane: string) {
		selectedLane = selectedLane === lane ? null : lane;
	}

	function clearAll() {
		selectedRole = null;
		selectedLane = null;
	}
</script>

<div class="relative">
	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition"
			class:border-accent={open || activeCount > 0}
			class:bg-accent={open || activeCount > 0}
			class:text-bg={open || activeCount > 0}
			class:border-line={!open && activeCount === 0}
			class:text-ink-muted={!open && activeCount === 0}
			class:hover:border-line-strong={!open && activeCount === 0}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
					clip-rule="evenodd"
				/>
			</svg>
			Filter{activeCount > 0 ? ` (${activeCount})` : ''}
		</button>

		{#if activeCount > 0}
			<button
				type="button"
				onclick={clearAll}
				class="rounded-lg border border-line px-3 py-2 text-xs text-ink-muted transition hover:border-red-400 hover:text-red-400"
			>
				Clear
			</button>
		{/if}

		{#if selectedLane}
			<span
				class="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent"
			>
				{selectedLane}
				<button type="button" onclick={() => (selectedLane = null)} class="hover:text-white"
					>×</button
				>
			</span>
		{/if}
		{#if selectedRole}
			<span
				class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
				style="background:{roleColor(selectedRole)}22;color:{roleColor(selectedRole)}"
			>
				{titleCase(selectedRole)}
				<button type="button" onclick={() => (selectedRole = null)} class="hover:opacity-70"
					>×</button
				>
			</span>
		{/if}
	</div>

	{#if open}
		<div
			class="absolute top-full left-0 z-30 mt-2 w-[600px] max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface/95 p-4 shadow-xl shadow-black/30 backdrop-blur-lg"
		>
			<div class="mb-3 flex items-center gap-2">
				<div class="flex flex-1 gap-1 rounded-lg bg-bg p-1">
					<button
						type="button"
						onclick={() => (tab = 'lane')}
						class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition"
						class:bg-surface-3={tab === 'lane'}
						class:text-ink={tab === 'lane'}
						class:text-ink-muted={tab !== 'lane'}
					>
						By Role (Lane)
					</button>
					<button
						type="button"
						onclick={() => (tab = 'type')}
						class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition"
						class:bg-surface-3={tab === 'type'}
						class:text-ink={tab === 'type'}
						class:text-ink-muted={tab !== 'type'}
					>
						By Type
					</button>
				</div>
				<button
					type="button"
					onclick={() => (open = false)}
					class="flex size-7 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted transition hover:border-line-strong hover:text-ink"
				>
					×
				</button>
			</div>

			{#if tab === 'lane'}
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
					{#each LANES as lane (lane)}
						<button
							type="button"
							onclick={() => toggleLane(lane)}
							class="rounded-lg border px-3 py-2 text-sm font-medium transition"
							class:border-accent={selectedLane === lane}
							class:bg-accent={selectedLane === lane}
							class:text-bg={selectedLane === lane}
							class:border-line={selectedLane !== lane}
							class:text-ink-muted={selectedLane !== lane}
							class:hover:border-line-strong={selectedLane !== lane}
						>
							{lane}
						</button>
					{/each}
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
					{#each HERO_ROLES as role (role)}
						<button
							type="button"
							onclick={() => toggleRole(role)}
							class="flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition"
							class:text-white={selectedRole === role}
							class:border-line={selectedRole !== role}
							class:text-ink-muted={selectedRole !== role}
							class:hover:border-line-strong={selectedRole !== role}
							style={selectedRole === role
								? `border-color:${roleColor(role)};background:${roleColor(role)}`
								: ''}
						>
							<span class="inline-block h-2 w-2 rounded-full" style="background:{roleColor(role)}"
							></span>
							{titleCase(role)}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
