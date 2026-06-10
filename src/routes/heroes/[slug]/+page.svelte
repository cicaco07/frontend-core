<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import RelationGroup from '$lib/components/hero/RelationGroup.svelte';

	let { data }: { data: PageData } = $props();

	const hero = $derived(data.hero);
	const relations = $derived(data.relations);

	const damageColor: Record<string, string> = {
		physical: '#ffb86b',
		magic: '#89e0eb',
		true: '#f4f7ff',
		none: '#6a7a89'
	};

	const hasBaseStats = $derived(
		hero.baseStats.hp > 0 ||
			hero.baseStats.physicalAttack > 0 ||
			hero.baseStats.magicPower > 0 ||
			hero.baseStats.physicalDefense > 0 ||
			hero.baseStats.magicDefense > 0
	);

	const baseStatRows = $derived([
		{ label: 'HP', value: hero.baseStats.hp },
		{ label: 'Mana', value: hero.baseStats.mana },
		{ label: 'Physical Attack', value: hero.baseStats.physicalAttack },
		{ label: 'Magic Power', value: hero.baseStats.magicPower },
		{ label: 'Physical Defense', value: hero.baseStats.physicalDefense },
		{ label: 'Magic Defense', value: hero.baseStats.magicDefense },
		{ label: 'Movement Speed', value: hero.baseStats.movementSpeed }
	]);
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
	<a href={resolve('/heroes')} class="text-sm text-ink-muted hover:text-accent"
		>&larr; Back to heroes</a
	>

	<div class="mt-4 grid gap-6 lg:grid-cols-[420px_1fr]">
		<div class="space-y-4">
			<div class="aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-surface-3">
				{#if hero.imageUrl}
					<img src={hero.imageUrl} alt={hero.name} class="h-full w-full object-cover" />
				{/if}
			</div>
			<div>
				<h1 class="font-display text-4xl font-bold text-ink">{hero.name}</h1>
				{#if hero.title}<p class="text-ink-muted">{hero.title}</p>{/if}
				<p class="mt-1 flex items-center gap-2 text-sm" style="color:{roleColor(hero.role)}">
					<span
						class="inline-block h-2.5 w-2.5 rounded-full"
						style="background:{roleColor(hero.role)}"
					></span>
					{titleCase(hero.role)}
					{#if hero.difficulty}<span class="text-ink-faint">· Difficulty {hero.difficulty}/3</span
						>{/if}
				</p>
			</div>
			{#if hero.lanes && hero.lanes.length}
				<p class="text-sm text-ink-muted">
					<span class="text-ink-faint">Lane:</span>
					{hero.lanes.join(' · ')}
				</p>
			{/if}
			{#if hero.specialities && hero.specialities.length}
				<div class="flex flex-wrap gap-1.5">
					{#each hero.specialities as spec (spec)}
						<span class="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-ink-muted"
							>{titleCase(spec)}</span
						>
					{/each}
				</div>
			{/if}
			{#if hero.lore}
				<p class="text-sm leading-relaxed text-ink-muted">{hero.lore}</p>
			{/if}
			<a
				href={resolve('/theorycrafter')}
				class="inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold text-bg hover:bg-gold"
			>
				Gunakan di Kalkulator Damage
			</a>
		</div>

		<div class="space-y-6">
			{#if hasBaseStats}
				<section class="rounded-2xl border border-line bg-surface/82 p-5">
					<h2 class="font-display mb-3 text-lg font-bold">Base Stats</h2>
					<table class="w-full text-sm">
						<tbody>
							{#each baseStatRows as row (row.label)}
								<tr class="border-b border-line/60 odd:bg-surface-2/40">
									<td class="px-3 py-1.5 text-ink-muted">{row.label}</td>
									<td class="font-mono-stat px-3 py-1.5 text-right tabular-nums">{row.value}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</section>
			{/if}

			{#if hero.skills.length}
				<section class="rounded-2xl border border-line bg-surface/82 p-5">
					<h2 class="font-display mb-3 text-lg font-bold">Skills</h2>
					<ul class="space-y-2">
						{#each hero.skills as skill (skill.id)}
							<li class="rounded-xl border border-line bg-bg/30 p-3">
								<div class="flex items-center justify-between">
									<span class="font-medium text-ink">{skill.name}</span>
									<span
										class="rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase"
										style="color:{damageColor[skill.damageType]};background:{damageColor[
											skill.damageType
										]}1f"
									>
										{skill.damageType}
									</span>
								</div>
								{#if skill.description}
									<p class="mt-1 text-xs leading-relaxed text-ink-muted">{skill.description}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</div>
	</div>

	<div class="mt-8">
		<h2 class="font-display mb-3 text-lg font-bold">Matchups & Synergy</h2>
		<div class="grid gap-4 md:grid-cols-3">
			<RelationGroup title="Strong Against" accent="#addfad" relations={relations.strongAgainst} />
			<RelationGroup title="Weak Against" accent="#ff7a7c" relations={relations.weakAgainst} />
			<RelationGroup title="Synergy" accent="#b387fa" relations={relations.synergy} />
		</div>
	</div>
</div>
