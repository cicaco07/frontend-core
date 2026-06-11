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
</script>

<div class="group relative">
	<a
		href={resolve('/heroes/[slug]', { slug: hero.slug })}
		class="block overflow-hidden border border-line bg-surface-3 transition hover:border-line-strong"
	>
		<div class="relative aspect-2/3 overflow-hidden">
			{#if hero.imageUrl}
				<img
					src={hero.imageUrl}
					alt={hero.name}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			{/if}

			{#if laneIcons.length}
				<div class="absolute top-0 left-0 flex">
					{#each laneIcons as li (li.lane)}
						<div class="flex size-7 items-center justify-center bg-black opacity-80">
							<img src={li.icon} alt={li.lane} class="h-4 w-4" />
						</div>
					{/each}
				</div>
			{/if}

			<div
				class="absolute inset-x-0 bottom-0 flex items-end justify-center bg-linear-to-t from-black via-black/50 to-transparent pt-32 pb-3"
			>
				<p class="text-sm text-center font-bold text-white drop-shadow-md tracking-wide">{hero.name}</p>
			</div>
		</div>
	</a>

	<div
		class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 scale-95 opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100"
		role="tooltip"
	>
		<div class="border border-line-strong bg-surface-2 p-4 shadow-xl shadow-black/40">
			<p class="font-display font-bold text-ink">
				{hero.name}
				{#if hero.title}
					<span class="font-body font-normal text-ink-muted">— {hero.title}</span>
				{/if}
			</p>
			<div class="mt-1 flex items-center gap-2">
				<span
					class="px-1.5 py-0.5 text-[10px] font-bold text-white uppercase"
					style="background:{roleColor(hero.role)}"
				>
					{titleCase(hero.role)}
				</span>
				{#if hero.lanes && hero.lanes.length}
					<span class="text-[11px] text-ink-muted">{hero.lanes.join(' · ')}</span>
				{/if}
			</div>
			{#if hero.lore}
				<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{hero.lore}</p>
			{/if}
			<p class="mt-2 text-[10px] text-accent">Click for full detail</p>
		</div>
		<div
			class="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-r border-b border-line-strong bg-surface-2"
		></div>
	</div>
</div>
