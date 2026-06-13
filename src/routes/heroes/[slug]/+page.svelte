<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import { scaleStatsByLevel } from '$lib/calc/formulas';
	import RelationGroup from '$lib/components/hero/RelationGroup.svelte';
	import type { SkillLevelData } from '$lib/types';

	let { data }: { data: PageData } = $props();

	const hero = $derived(data.hero);
	const relations = $derived(data.relations);

	let level = $state(1);

	const damageColor: Record<string, string> = {
		physical: '#ffb86b',
		magic: '#89e0eb',
		true: '#f4f7ff',
		none: '#6a7a89'
	};

	const scaledStats = $derived(scaleStatsByLevel(hero.baseStats, hero.statsPerLevel, level));

	const hasBaseStats = $derived(
		hero.baseStats.hp > 0 ||
			hero.baseStats.physicalAttack > 0 ||
			hero.baseStats.magicPower > 0 ||
			hero.baseStats.physicalDefense > 0 ||
			hero.baseStats.magicDefense > 0
	);

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}

	function humanizeKey(key: string): string {
		return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function replaceAttributePlaceholders(
		text: string,
		levelData: SkillLevelData[] | undefined,
		selectedLevel: number
	): string {
		if (!levelData || levelData.length === 0) return text;
		const target = levelData.find((l) => l.level === selectedLevel) ?? levelData[0];
		if (!target) return text;
		return text.replace(/\{\{(\w+)\}\}/g, (_match, attrName: string) => {
			const normalized = attrName.toLowerCase().replace(/_/g, ' ');
			const entry = target.attributes.find(
				(a) => a.label.toLowerCase().replace(/_/g, ' ') === normalized
			);
			return entry ? entry.value : `{{${attrName}}}`;
		});
	}

	const offenseStatRows = $derived([
		{
			label: 'Physical Attack',
			value: round(scaledStats.physicalAttack),
			growth: hero.statsPerLevel.physicalAttack
		},
		{
			label: 'Magic Power',
			value: round(scaledStats.magicPower),
			growth: hero.statsPerLevel.magicPower
		},
		{ label: 'Attack Speed', value: round(scaledStats.attackSpeedPct * 100), suffix: '%' },
		{ label: 'Crit Chance', value: round(scaledStats.critChancePct * 100), suffix: '%' },
		{ label: 'Lifesteal', value: round(scaledStats.lifestealPct * 100), suffix: '%' },
		{ label: 'Spell Vamp', value: round(scaledStats.spellVampPct * 100), suffix: '%' },
		{ label: 'Phys Penetration', value: round(scaledStats.physicalPenFlat) },
		{ label: 'Magic Penetration', value: round(scaledStats.magicPenFlat) }
	] as Array<{ label: string; value: number; suffix?: string; growth?: number }>);

	const defenseStatRows = $derived([
		{ label: 'HP', value: round(scaledStats.hp), growth: hero.statsPerLevel.hp },
		{ label: 'HP Regen', value: round(scaledStats.hpRegen), growth: hero.statsPerLevel.hpRegen },
		{ label: 'Mana', value: round(scaledStats.mana), growth: hero.statsPerLevel.mana },
		{
			label: 'Mana Regen',
			value: round(scaledStats.manaRegen),
			growth: hero.statsPerLevel.manaRegen
		},
		{
			label: 'Physical Defense',
			value: round(scaledStats.physicalDefense),
			growth: hero.statsPerLevel.physicalDefense
		},
		{
			label: 'Magic Defense',
			value: round(scaledStats.magicDefense),
			growth: hero.statsPerLevel.magicDefense
		},
		{ label: 'Movement Speed', value: round(scaledStats.movementSpeed) }
	] as Array<{ label: string; value: number; suffix?: string; growth?: number }>);

	let skillLevels = $state<Record<string, number>>({});

	function getSkillLevel(skillId: string, maxLevel: number): number {
		return skillLevels[skillId] ?? (maxLevel > 0 ? 1 : 0);
	}

	function setSkillLevel(skillId: string, lvl: number) {
		skillLevels = { ...skillLevels, [skillId]: lvl };
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
	<a href={resolve('/heroes')} class="text-sm text-ink-muted hover:text-accent"
		>&larr; Back to heroes</a
	>

	<div class="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
		<div class="space-y-4">
			<div
				class="aspect-[3/4] max-h-[360px] overflow-hidden rounded-2xl border border-line bg-surface-3"
			>
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
				href={resolve('/calculator')}
				class="inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold text-bg hover:bg-gold"
			>
				Gunakan di Kalkulator Damage
			</a>
		</div>

		<div class="space-y-6">
			{#if hasBaseStats}
				<section class="rounded-2xl border border-line bg-surface/82 p-5">
					<div class="mb-3 flex items-center justify-between">
						<h2 class="font-display text-lg font-bold">Base Stats</h2>
						<span class="text-xs text-ink-muted">Level {level}</span>
					</div>
					<div class="mb-4">
						<input type="range" min="1" max="15" bind:value={level} class="w-full accent-accent" />
						<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
							<span>1</span><span>15</span>
						</div>
					</div>
					<div class="grid gap-4 lg:grid-cols-2">
						<div>
							<h3 class="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
								Offense
							</h3>
							<table class="w-full text-sm">
								<tbody>
									{#each offenseStatRows as row (row.label)}
										<tr class="border-b border-line/60 odd:bg-surface-2/40">
											<td class="px-3 py-1.5 text-ink-muted">{row.label}</td>
											<td class="px-3 py-1.5 text-right">
												<span class="font-mono-stat tabular-nums"
													>{row.value}{row.suffix ?? ''}</span
												>
												{#if row.growth}
													<span class="ml-1 text-[10px] text-emerald-400"
														>+{round(row.growth)}/lv</span
													>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div>
							<h3 class="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
								Defense
							</h3>
							<table class="w-full text-sm">
								<tbody>
									{#each defenseStatRows as row (row.label)}
										<tr class="border-b border-line/60 odd:bg-surface-2/40">
											<td class="px-3 py-1.5 text-ink-muted">{row.label}</td>
											<td class="px-3 py-1.5 text-right">
												<span class="font-mono-stat tabular-nums"
													>{row.value}{row.suffix ?? ''}</span
												>
												{#if row.growth}
													<span class="ml-1 text-[10px] text-emerald-400"
														>+{round(row.growth)}/lv</span
													>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			{/if}

			{#if hero.skills.length}
				<section class="rounded-2xl border border-line bg-surface/82 p-5">
					<h2 class="font-display mb-3 text-lg font-bold">Skills</h2>
					<ul class="space-y-4">
						{#each hero.skills as skill (skill.id)}
							{@const maxLevel = skill.levelData?.length ?? 0}
							{@const currentLevel = getSkillLevel(skill.id, maxLevel)}
							<li class="rounded-xl border border-line bg-bg/30 p-4">
								<div class="flex items-start gap-4">
									{#if skill.imageUrl}
										<span class="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-3">
											<img
												src={skill.imageUrl}
												alt={skill.name}
												class="h-full w-full object-cover"
											/>
										</span>
									{/if}
									<div class="min-w-0 flex-1">
										<div class="flex items-center justify-between gap-2">
											<span class="text-base font-semibold text-ink">{skill.name}</span>
											<div class="flex items-center gap-2">
												{#if maxLevel > 0}
													<select
														class="rounded border border-line bg-bg px-1.5 py-0.5 text-xs text-ink"
														value={currentLevel}
														onchange={(e) => setSkillLevel(skill.id, Number(e.currentTarget.value))}
													>
														{#each skill.levelData ?? [] as lvl (lvl.level)}
															<option value={lvl.level}>Lv {lvl.level}</option>
														{/each}
													</select>
												{/if}
												<span
													class="rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase"
													style="color:{damageColor[skill.damageType]};background:{damageColor[
														skill.damageType
													]}1f"
												>
													{skill.damageType}
												</span>
											</div>
										</div>
										{#if skill.description}
											<p class="mt-1.5 text-sm leading-relaxed text-ink-muted">
												{replaceAttributePlaceholders(
													skill.description,
													skill.levelData,
													currentLevel
												)}
											</p>
										{/if}
										{#if skill.levelData && skill.levelData.length > 0}
											<div class="mt-3 overflow-x-auto">
												<table class="w-full text-xs">
													<thead>
														<tr class="border-b border-line text-ink-faint">
															<th class="px-2 py-1.5 text-left font-medium"></th>
															{#each skill.levelData as lvl (lvl.level)}
																<th
																	class="px-2 py-1.5 text-center font-medium {lvl.level ===
																	currentLevel
																		? 'bg-accent/15 text-accent'
																		: ''}"
																>
																	Lv {lvl.level}
																</th>
															{/each}
														</tr>
													</thead>
													<tbody>
														{#each skill.levelData[0]?.attributes ?? [] as attr, attrIdx (attr.label)}
															<tr class="border-b border-line/50 odd:bg-surface-2/30">
																<td class="px-2 py-1.5 font-medium text-ink-muted"
																	>{humanizeKey(attr.label)}</td
																>
																{#each skill.levelData as lvl (lvl.level)}
																	<td
																		class="font-mono-stat px-2 py-1.5 text-center text-ink tabular-nums {lvl.level ===
																		currentLevel
																			? 'bg-accent/15 font-semibold text-accent'
																			: ''}"
																	>
																		{lvl.attributes[attrIdx]?.value ?? '-'}
																	</td>
																{/each}
															</tr>
														{/each}
													</tbody>
												</table>
											</div>
										{/if}
									</div>
								</div>
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
