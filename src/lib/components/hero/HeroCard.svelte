<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Hero } from '$lib/types';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import goldlane from '$lib/../assets/roles/goldlane.png';
	import midlane from '$lib/../assets/roles/midlane.png';
	import exp from '$lib/../assets/roles/exp.png';
	import jungle from '$lib/../assets/roles/jungle.png';
	import roam from '$lib/../assets/roles/roam.png';

	let { hero }: { hero: Hero } = $props();

	const LANE_ICONS: Record<string, string> = {
		'Gold Lane': goldlane,
		'Mid Lane': midlane,
		'Exp Lane': exp,
		Jungle: jungle,
		Roam: roam,
		Roaming: roam
	};

	const laneIcons = $derived(
		(hero.lanes ?? []).map((lane) => ({ lane, icon: LANE_ICONS[lane] })).filter((l) => l.icon)
	);
	const heroRoles = $derived(hero.roles ?? [hero.role]);
</script>

<div class="group relative">
	<a
		href={resolve('/heroes/[slug]', { slug: hero.slug })}
		class="block overflow-hidden rounded-3xl border border-line bg-surface/78 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-accent/35"
	>
		<div class="relative aspect-2/3 overflow-hidden bg-bg/55">
			{#if hero.imageUrl}
				<img
					src={hero.imageUrl}
					alt={hero.name}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
					loading="lazy"
				/>
			{/if}

			<div class="absolute inset-x-0 top-0 flex items-start justify-end p-2">
				{#if laneIcons.length}
					<div class="flex gap-1 rounded-full bg-bg/70 p-0.5 backdrop-blur">
						{#each laneIcons as li (li.lane)}
							<span class="grid size-6 place-items-center" title={li.lane}>
								<img src={li.icon} alt={li.lane} class="size-3.5" loading="lazy" />
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/65 to-transparent px-3 pt-20 pb-3">
				<p class="truncate text-center text-sm font-bold tracking-wide text-white drop-shadow-md">{hero.name}</p>
			</div>
		</div>
	</a>

	<div
		class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 scale-95 opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100"
		role="tooltip"
	>
		<div class="rounded-2xl border border-line-strong bg-surface-2 p-4 shadow-xl shadow-black/40">
			<p class="font-display font-bold text-ink">
				{hero.name}
				{#if hero.title}<span class="font-body font-normal text-ink-muted"> — {hero.title}</span>{/if}
			</p>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				{#each heroRoles as role (role)}
					<span class="rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase" style="background:{roleColor(role)}">{titleCase(role)}</span>
				{/each}
				{#if hero.lanes && hero.lanes.length}<span class="text-[11px] text-ink-muted">{hero.lanes.join(' · ')}</span>{/if}
			</div>
			{#if hero.lore}<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{hero.lore}</p>{/if}
			<p class="mt-3 text-[10px] font-bold text-accent">Click for full detail</p>
		</div>
		<div class="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-r border-b border-line-strong bg-surface-2"></div>
	</div>
</div>
