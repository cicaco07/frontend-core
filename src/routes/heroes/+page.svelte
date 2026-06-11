<script lang="ts">
	import type { PageData } from './$types';
	import type { HeroRole } from '$lib/types';
	import HeroCard from '$lib/components/hero/HeroCard.svelte';
	import RoleFilter from '$lib/components/hero/RoleFilter.svelte';
	import { HERO_ROLES, roleColor, titleCase } from '$lib/utils/labels';

	let { data }: { data: PageData } = $props();

	const LANES = ['Gold Lane', 'Mid Lane', 'Exp Lane', 'Jungle', 'Roam'] as const;

	let filterMode = $state<'lane' | 'type'>('lane');
	let role = $state<HeroRole | null>(null);
	let lane = $state<string | null>(null);
	let query = $state('');

	const hasActiveFilter = $derived(role !== null || lane !== null);

	const filtered = $derived(
		data.heroes
			.filter((hero) => {
				const matchesRole = role === null || hero.role === role;
				const matchesLane = lane === null || (hero.lanes && hero.lanes.includes(lane));
				const matchesQuery =
					query.trim() === '' || hero.name.toLowerCase().includes(query.trim().toLowerCase());
				return matchesRole && matchesLane && matchesQuery;
			})
			.toSorted((a, b) => a.name.localeCompare(b.name))
	);
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div>
		<h1 class="font-display text-3xl font-bold text-ink">Daftar List Hero</h1>
		<p class="mt-1 text-sm text-ink-muted">
			{filtered.length} of {data.heroes.length} heroes
		</p>
	</div>

	<div class="flex items-center justify-end gap-3">
		<input
			type="search"
			placeholder="Search hero…"
			bind:value={query}
			class="w-full max-w-xs rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
		/>
		<RoleFilter bind:filterMode />
	</div>

	<div class="flex flex-wrap items-center gap-2">
		{#if filterMode === 'lane'}
			{#each LANES as l (l)}
				<button
					type="button"
					onclick={() => (lane = lane === l ? null : l)}
					class="rounded-full border px-3 py-1.5 text-sm font-medium transition"
					class:border-accent={lane === l}
					class:bg-accent={lane === l}
					class:text-white={lane === l}
					class:border-line={lane !== l}
					class:text-ink-muted={lane !== l}
					class:hover:border-line-strong={lane !== l}
				>
					{l}
				</button>
			{/each}
		{:else}
			{#each HERO_ROLES as r (r)}
				<button
					type="button"
					onclick={() => (role = role === r ? null : r)}
					class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition"
					class:text-white={role === r}
					class:border-line={role !== r}
					class:text-ink-muted={role !== r}
					class:hover:border-line-strong={role !== r}
					style={role === r ? `border-color:${roleColor(r)};background:${roleColor(r)}` : ''}
				>
					<span class="inline-block h-2 w-2 rounded-full" style="background:{roleColor(r)}"></span>
					{titleCase(r)}
				</button>
			{/each}
		{/if}
		{#if hasActiveFilter}
			<button
				type="button"
				onclick={() => {
					role = null;
					lane = null;
				}}
				class="rounded-full border border-red-400/40 px-3 py-1.5 text-sm font-medium text-red-400 transition hover:border-red-400 hover:bg-red-400/10"
			>
				Reset
			</button>
		{/if}
	</div>

	{#if data.heroes.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No heroes loaded yet. Connect the backend API.
		</p>
	{:else if filtered.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No heroes match your filters.
		</p>
	{:else}
		<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
			{#each filtered as hero (hero.id)}
				<li><HeroCard {hero} /></li>
			{/each}
		</ul>
	{/if}
</div>
