<script lang="ts">
	import type { PageData } from './$types';
	import { titleCase } from '$lib/utils/labels';

	let { data }: { data: PageData } = $props();

	const builds = $derived(data.builds);
	let roleFilter = $state<string | null>(null);
	let searchQuery = $state('');

	const roles = $derived([...new Set(builds.map((b) => b.role))].sort());
	const filteredBuilds = $derived(
		builds.filter((b) => {
			const query = searchQuery.trim().toLowerCase();
			return (
				(roleFilter === null || b.role === roleFilter) &&
				(query === '' || b.name.toLowerCase().includes(query) || b.hero.name.toLowerCase().includes(query))
			);
		})
	);
</script>

<div class="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6">
	<header class="rounded-3xl border border-line bg-surface/70 p-6 shadow-xl shadow-black/10">
		<p class="font-display text-xs font-bold tracking-[0.22em] text-accent uppercase">Community Builds</p>
		<div class="mt-3 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="font-display text-3xl font-bold text-ink sm:text-4xl">Community Builds Gallery</h1>
				<p class="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">Discover and share top-rated builds for your favorite Mobile Legends heroes.</p>
			</div>
			<button type="button" class="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-bg shadow-[0_14px_36px_rgb(255_134_91/0.22)] transition hover:-translate-y-0.5 hover:bg-gold">Create Build +</button>
		</div>
	</header>

	<section class="flex flex-col gap-4 rounded-3xl border border-line bg-surface/55 p-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-1 flex-wrap items-center gap-2">
			<input type="search" placeholder="Cari build atau hero..." bind:value={searchQuery} class="min-w-56 flex-1 rounded-full border border-line bg-bg/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none sm:max-w-xs" />
			<button type="button" onclick={() => (roleFilter = null)} class="rounded-full border px-3 py-2 text-xs font-bold transition" class:border-accent={roleFilter === null} class:bg-accent={roleFilter === null} class:text-bg={roleFilter === null} class:border-line={roleFilter !== null} class:text-ink-muted={roleFilter !== null}>All</button>
			{#each roles as role (role)}
				<button type="button" onclick={() => (roleFilter = roleFilter === role ? null : role)} class="rounded-full border px-3 py-2 text-xs font-bold transition" class:border-accent={roleFilter === role} class:bg-accent={roleFilter === role} class:text-bg={roleFilter === role} class:border-line={roleFilter !== role} class:text-ink-muted={roleFilter !== role}>{titleCase(role)}</button>
			{/each}
		</div>
		<p class="text-sm text-ink-muted">{filteredBuilds.length} of {builds.length} builds</p>
	</section>

	{#if filteredBuilds.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-12 text-center">
			<p class="font-display text-xl font-bold text-ink">Tidak ada build ditemukan</p>
			<p class="mt-2 text-sm text-ink-muted">Coba ubah filter atau kata kunci pencarian.</p>
		</div>
	{:else}
		<div class="grid gap-5 lg:grid-cols-2">
			{#each filteredBuilds as build (build.id)}
				<article class="group overflow-hidden rounded-3xl border border-line bg-surface/75 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-accent/40">
					<div class="flex items-start gap-4 border-b border-line bg-bg/35 p-5">
						<span class="size-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-3">
							{#if build.hero.avatarUrl}<img src={build.hero.avatarUrl} alt={build.hero.name} class="h-full w-full object-cover" />{/if}
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="font-display truncate text-lg font-bold text-ink">{build.name}</h2>
								{#if build.isOfficial}<span class="rounded-full bg-good/15 px-2 py-0.5 text-[10px] font-bold text-good">Official</span>{/if}
							</div>
							<p class="mt-1 text-sm text-ink-muted">{build.hero.name} · <span class="text-accent">{titleCase(build.role)}</span></p>
							<p class="mt-1 text-xs text-ink-faint">by {build.author}</p>
						</div>
						<button type="button" class="rounded-full border border-accent/40 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent hover:text-bg">Copy Build</button>
					</div>

					<div class="space-y-4 p-5">
						<div>
							<p class="mb-2 text-[10px] font-bold tracking-[0.18em] text-ink-faint uppercase">Items</p>
							<div class="grid grid-cols-6 gap-2">
								{#each [0, 1, 2, 3, 4, 5] as idx (idx)}
									{@const item = build.items[idx]}
									<div class="min-w-0 text-center">
										<span class="mx-auto grid aspect-square max-w-14 place-items-center overflow-hidden rounded-xl border border-line bg-bg/60">
											{#if item?.imageUrl}<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />{:else}<span class="text-xs text-ink-faint">-</span>{/if}
										</span>
										{#if item}<p class="mt-1 truncate text-[10px] text-ink-muted" title={item.name}>{item.name}</p>{/if}
									</div>
								{/each}
							</div>
						</div>

						{#if build.emblems.length > 0}
							<div class="rounded-2xl border border-line bg-bg/45 p-3">
								<p class="mb-2 text-[10px] font-bold tracking-[0.18em] text-ink-faint uppercase">Emblem Set</p>
								<div class="flex flex-wrap gap-2">
									{#each build.emblems as emblem (emblem.id)}
										<span class="inline-flex items-center gap-2 rounded-full bg-surface-3 px-2.5 py-1.5 text-xs text-ink-muted">
											{#if emblem.icon}<img src={emblem.icon} alt={emblem.name} class="size-5 rounded-full object-cover" />{/if}
											{emblem.name}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if build.battleSpells.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each build.battleSpells as spell (spell.id)}
									<span class="inline-flex items-center gap-2 rounded-full border border-line bg-bg/45 px-3 py-1.5 text-xs text-ink-muted">
										{#if spell.icon}<img src={spell.icon} alt={spell.name} class="size-5 rounded-full object-cover" />{/if}
										{spell.name}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
