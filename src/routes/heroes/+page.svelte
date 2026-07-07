<script lang="ts">
	import type { PageData } from './$types';
	import type { HeroRole } from '$lib/types';
	import HeroCard from '$lib/components/hero/HeroCard.svelte';
	import RoleFilter from '$lib/components/hero/RoleFilter.svelte';
	import { HERO_ROLES, roleColor, titleCase } from '$lib/utils/labels';

	let { data }: { data: PageData } = $props();

	const LANES = ['Gold Lane', 'Mid Lane', 'Exp Lane', 'Jungle', 'Roam'] as const;

	let filterMode = $state<'lane' | 'type'>('lane');
	let roles = $state<HeroRole[]>([]);
	let lanes = $state<string[]>([]);
	let query = $state('');

	const hasActiveFilter = $derived(roles.length > 0 || lanes.length > 0 || query.trim() !== '');
	const filtered = $derived(
		data.heroes
			.filter((hero) => {
				const q = query.trim().toLowerCase();
				return (
					(roles.length === 0 || roles.every((r) => (hero.roles ?? [hero.role]).includes(r))) &&
					(lanes.length === 0 || lanes.every((l) => hero.lanes?.includes(l))) &&
					(q === '' || hero.name.toLowerCase().includes(q))
				);
			})
			.toSorted((a, b) => a.name.localeCompare(b.name))
	);

	function resetFilters() {
		roles = [];
		lanes = [];
		query = '';
	}

	function toggleRole(value: HeroRole) {
		roles = roles.includes(value) ? roles.filter((r) => r !== value) : [...roles, value].slice(-2);
	}

	function toggleLane(value: string) {
		lanes = lanes.includes(value) ? lanes.filter((l) => l !== value) : [...lanes, value].slice(-2);
	}
</script>

<div class="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6">
	<header class="overflow-hidden rounded-3xl border border-line bg-surface/70 p-6 shadow-xl shadow-black/10">
		<p class="font-display text-xs font-bold tracking-[0.22em] text-accent uppercase">Database</p>
		<div class="mt-3 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="font-display text-3xl font-bold text-ink sm:text-4xl">Heroes Database</h1>
				<p class="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">Daftar hero Mobile Legends lengkap dengan role, lane, dan detail build untuk theorycraft.</p>
			</div>
			<span class="rounded-full border border-line bg-bg/60 px-4 py-2 text-sm font-semibold text-ink-muted">{filtered.length} of {data.heroes.length} heroes</span>
		</div>
	</header>

	<section class="space-y-4 rounded-3xl border border-line bg-surface/55 p-4">
		<div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
			<div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
				<input
					type="search"
					placeholder="Search hero…"
					bind:value={query}
					class="min-w-56 rounded-full border border-line bg-bg/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none sm:w-80"
				/>
				<RoleFilter bind:filterMode />
			</div>
			{#if hasActiveFilter}
				<button type="button" onclick={resetFilters} class="rounded-full border border-negative/40 px-4 py-2 text-xs font-bold text-negative transition hover:bg-negative/10">Reset</button>
			{/if}
		</div>

		<div class="flex flex-wrap gap-2">
			{#if filterMode === 'lane'}
				{#each LANES as l (l)}
					<button
						type="button"
						onclick={() => toggleLane(l)}
						class="rounded-full border px-3 py-2 text-xs font-bold transition"
						class:border-accent={lanes.includes(l)}
						class:bg-accent={lanes.includes(l)}
						class:text-bg={lanes.includes(l)}
						class:border-line={!lanes.includes(l)}
						class:text-ink-muted={!lanes.includes(l)}
					>
						{l}
					</button>
				{/each}
			{:else}
				{#each HERO_ROLES as r (r)}
					<button
						type="button"
						onclick={() => toggleRole(r)}
						class="rounded-full border px-3 py-2 text-xs font-bold capitalize transition"
						class:text-bg={roles.includes(r)}
						class:text-ink-muted={!roles.includes(r)}
						style={roles.includes(r) ? `border-color:${roleColor(r)};background:${roleColor(r)}` : ''}
					>
						{titleCase(r)}
					</button>
				{/each}
			{/if}
		</div>
	</section>

	{#if data.heroes.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-10 text-center">
			<p class="font-display text-xl font-bold text-ink">No heroes loaded yet</p>
			<p class="mt-2 text-sm text-ink-muted">Connect the backend API to show heroes.</p>
		</div>
	{:else if filtered.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-10 text-center">
			<p class="font-display text-xl font-bold text-ink">No heroes match your filters</p>
			<p class="mt-2 text-sm text-ink-muted">Try another keyword or reset the filter.</p>
		</div>
	{:else}
		<section>
			<div class="mb-4 flex items-center justify-between gap-4">
				<h2 class="font-display text-2xl font-bold text-ink">Hero List</h2>
				<p class="text-sm text-ink-muted">{filtered.length} heroes</p>
			</div>
			<ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
				{#each filtered as hero (hero.id)}
					<li><HeroCard {hero} /></li>
				{/each}
			</ul>
		</section>
	{/if}
</div>
