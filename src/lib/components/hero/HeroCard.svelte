<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Hero } from '$lib/types';
	import { roleColor, titleCase } from '$lib/utils/labels';

	let { hero }: { hero: Hero } = $props();
</script>

<div class="group relative">
	<a
		href={resolve('/heroes/[slug]', { slug: hero.slug })}
		class="block rounded-2xl border border-line bg-surface/82 p-3 transition hover:-translate-y-1 hover:border-line-strong hover:bg-surface-2"
		style="border-left: 2px solid {roleColor(hero.role)}"
	>
		<div class="mb-3 aspect-[5/4] overflow-hidden rounded-xl bg-surface-3">
			{#if hero.imageUrl}
				<img src={hero.imageUrl} alt={hero.name} class="h-full w-full object-cover" />
			{/if}
		</div>
		<p class="font-display truncate font-bold text-ink">{hero.name}</p>
		<p class="flex items-center gap-1.5 text-xs text-ink-muted">
			<span class="inline-block h-2 w-2 rounded-full" style="background:{roleColor(hero.role)}"
			></span>
			{titleCase(hero.role)}
		</p>
	</a>

	<div
		class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 scale-95 opacity-0 transition duration-150 group-hover:scale-100 group-hover:opacity-100"
		role="tooltip"
	>
		<div class="rounded-xl border border-line-strong bg-surface-2 p-4 shadow-xl shadow-black/40">
			<p class="font-display font-bold text-ink">
				{hero.name}
				{#if hero.title}<span class="font-body font-normal text-ink-muted">— {hero.title}</span>{/if}
			</p>
			<p class="mt-0.5 text-xs capitalize" style="color:{roleColor(hero.role)}">{hero.role}</p>
			{#if hero.specialities && hero.specialities.length}
				<div class="mt-2 flex flex-wrap gap-1">
					{#each hero.specialities.slice(0, 4) as spec (spec)}
						<span class="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-ink-muted"
							>{titleCase(spec)}</span
						>
					{/each}
				</div>
			{/if}
			{#if hero.lore}
				<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{hero.lore}</p>
			{/if}
			<p class="mt-2 text-[10px] text-accent">Click for full detail →</p>
		</div>
		<div
			class="mx-auto h-2 w-2 -translate-y-1 rotate-45 border-r border-b border-line-strong bg-surface-2"
		></div>
	</div>
</div>
