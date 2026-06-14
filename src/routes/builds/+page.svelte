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
			if (roleFilter && b.role !== roleFilter) return false;
			if (
				searchQuery.trim() &&
				!b.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!b.hero.name.toLowerCase().includes(searchQuery.toLowerCase())
			)
				return false;
			return true;
		})
	);
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
	<div class="mb-8">
		<h1 class="font-display text-3xl font-bold text-ink">Builds</h1>
		<p class="mt-1 text-sm text-ink-muted">Build rekomendasi resmi untuk berbagai hero dan role.</p>
	</div>

	<div class="mb-6 flex flex-wrap items-center gap-3">
		<input
			type="search"
			placeholder="Cari build atau hero..."
			bind:value={searchQuery}
			class="w-64 rounded-full border border-line bg-bg px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
		/>
		<div class="flex flex-wrap gap-1.5">
			<button
				type="button"
				onclick={() => (roleFilter = null)}
				class="rounded-full px-3 py-1 text-xs font-medium transition"
				class:bg-accent={roleFilter === null}
				class:text-white={roleFilter === null}
				class:bg-surface-3={roleFilter !== null}
				class:text-ink-muted={roleFilter !== null}>All</button
			>
			{#each roles as role (role)}
				<button
					type="button"
					onclick={() => (roleFilter = roleFilter === role ? null : role)}
					class="rounded-full px-3 py-1 text-xs font-medium transition"
					class:bg-accent={roleFilter === role}
					class:text-white={roleFilter === role}
					class:bg-surface-3={roleFilter !== role}
					class:text-ink-muted={roleFilter !== role}>{titleCase(role)}</button
				>
			{/each}
		</div>
	</div>

	{#if filteredBuilds.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/82 p-12"
		>
			<p class="text-lg font-semibold text-ink-muted">Tidak ada build ditemukan</p>
			<p class="mt-1 text-sm text-ink-faint">Coba ubah filter atau kata kunci pencarian.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredBuilds as build (build.id)}
				<article
					class="group overflow-hidden rounded-xl border border-line bg-bg transition hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
				>
					<div class="flex items-center gap-3 border-b border-line bg-surface/60 px-4 py-3">
						<span class="size-11 shrink-0 overflow-hidden rounded-lg bg-surface-3">
							{#if build.hero.avatarUrl}
								<img
									src={build.hero.avatarUrl}
									alt={build.hero.name}
									class="h-full w-full object-cover"
								/>
							{/if}
						</span>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-semibold text-ink">{build.name}</p>
							<p class="flex items-center gap-1.5 text-xs text-ink-muted">
								<span>{build.hero.name}</span>
								<span class="text-ink-faint">·</span>
								<span class="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent"
									>{build.role}</span
								>
							</p>
						</div>
					</div>

					<div class="space-y-3 px-4 py-3">
						<div>
							<span class="text-[10px] font-medium tracking-wide text-ink-faint uppercase"
								>Items</span
							>
							<div class="mt-1 flex gap-1">
								{#each [0, 1, 2, 3, 4, 5] as idx (idx)}
									{@const item = build.items[idx]}
									{#if item}
										<span
											class="size-9 shrink-0 overflow-hidden rounded-md border border-line bg-surface-3"
											title={item.name}
										>
											{#if item.imageUrl}
												<img
													src={item.imageUrl}
													alt={item.name}
													class="h-full w-full object-cover"
												/>
											{/if}
										</span>
									{:else}
										<span
											class="flex size-9 shrink-0 items-center justify-center rounded-md border border-dashed border-line"
										>
											<span class="text-[10px] text-ink-faint">-</span>
										</span>
									{/if}
								{/each}
							</div>
						</div>

						{#if build.emblems.length > 0}
							<div>
								<span class="text-[10px] font-medium tracking-wide text-ink-faint uppercase"
									>Emblem</span
								>
								<div class="mt-1 flex gap-1.5">
									{#each build.emblems as emblem (emblem.id)}
										<span
											class="size-7 shrink-0 overflow-hidden rounded-md bg-surface-3"
											title={emblem.name}
										>
											{#if emblem.icon}
												<img
													src={emblem.icon}
													alt={emblem.name}
													class="h-full w-full object-cover"
												/>
											{/if}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						{#if build.battleSpells.length > 0}
							<div>
								<span class="text-[10px] font-medium tracking-wide text-ink-faint uppercase"
									>Battle Spell</span
								>
								<div class="mt-1 flex items-center gap-2">
									{#each build.battleSpells as spell (spell.id)}
										<div class="flex items-center gap-1.5">
											<span
												class="size-7 shrink-0 overflow-hidden rounded-md bg-surface-3"
												title={spell.name}
											>
												{#if spell.icon}
													<img
														src={spell.icon}
														alt={spell.name}
														class="h-full w-full object-cover"
													/>
												{/if}
											</span>
											<span class="text-xs text-ink-muted">{spell.name}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div class="flex items-center justify-between border-t border-line px-4 py-2">
						<span class="text-[10px] text-ink-faint">by {build.author}</span>
						{#if build.isOfficial}
							<span
								class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
								>Official</span
							>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
