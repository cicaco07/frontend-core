<script lang="ts">
	import type { PageData } from './$types';
	import type { HeroRole } from '$lib/types';
	import HeroCard from '$lib/components/hero/HeroCard.svelte';
	import RoleFilter from '$lib/components/hero/RoleFilter.svelte';

	let { data }: { data: PageData } = $props();

	let role = $state<HeroRole | null>(null);
	let query = $state('');

	const filtered = $derived(
		data.heroes.filter((hero) => {
			const matchesRole = role === null || hero.role === role;
			const matchesQuery =
				query.trim() === '' || hero.name.toLowerCase().includes(query.trim().toLowerCase());
			return matchesRole && matchesQuery;
		})
	);
</script>

<div class="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-3xl font-bold text-ink">Heroes</h1>
			<p class="mt-1 text-sm text-ink-muted">
				{filtered.length} of {data.heroes.length} heroes
			</p>
		</div>
		<input
			type="search"
			placeholder="Search hero…"
			bind:value={query}
			class="w-full max-w-xs rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
		/>
	</div>

	<RoleFilter bind:selected={role} />

	{#if data.heroes.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No heroes loaded yet. Connect the backend API.
		</p>
	{:else if filtered.length === 0}
		<p class="rounded-2xl border border-line bg-surface p-6 text-ink-muted">
			No heroes match your filters.
		</p>
	{:else}
		<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each filtered as hero (hero.id)}
				<li><HeroCard {hero} /></li>
			{/each}
		</ul>
	{/if}
</div>
