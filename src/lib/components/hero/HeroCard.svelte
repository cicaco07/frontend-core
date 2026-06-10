<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Hero } from '$lib/types';
	import { roleColor, titleCase } from '$lib/utils/labels';

	let { hero }: { hero: Hero } = $props();
</script>

<div class="group relative">
	<a
		href={resolve('/heroes/[slug]', { slug: hero.slug })}
		class="block overflow-hidden border border-line bg-surface-3 transition hover:border-line-strong"
	>
		<div class="relative aspect-[3/4] overflow-hidden">
			{#if hero.imageUrl}
				<img
					src={hero.imageUrl}
					alt={hero.name}
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			{/if}

			<div
				class="absolute top-0 left-0 px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
				style="background:{roleColor(hero.role)}"
			>
				{titleCase(hero.role)}
			</div>

			<div class="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-2 backdrop-blur-sm">
				<p class="truncate text-sm font-bold text-white">{hero.name}</p>
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
				{#if hero.specialities && hero.specialities.length}
					{#each hero.specialities.slice(0, 3) as spec (spec)}
						<span class="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-muted"
							>{titleCase(spec)}</span
						>
					{/each}
				{/if}
			</div>
			{#if hero.lanes && hero.lanes.length}
				<p class="mt-1.5 text-[11px] text-ink-muted">
					<span class="text-ink-faint">Lane:</span>
					{hero.lanes.join(' · ')}
				</p>
			{/if}
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
