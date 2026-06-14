<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import { roleColor, titleCase } from '$lib/utils/labels';
	import { scaleStatsByLevel } from '$lib/calc/formulas';
	import RelationGroup from '$lib/components/hero/RelationGroup.svelte';
	import type { SkillLevelData } from '$lib/types';
	import type { Build } from '$lib/types/build';
	import { gqlRequest } from '$lib/api/graphql';
	import { OFFICIAL_BUILDS_QUERY } from '$lib/api/queries';
	import { mapBuild, type BackendBuild } from '$lib/api/mappers';

	let { data }: { data: PageData } = $props();

	const hero = $derived(data.hero);
	const relations = $derived(data.relations);

	let heroBuilds = $state<Build[]>([]);
	let buildsLoaded = $state(false);

	async function loadHeroBuilds() {
		if (buildsLoaded) return;
		buildsLoaded = true;
		try {
			const result = await gqlRequest<
				{ officialBuilds: BackendBuild[] },
				{ limit: number; offset: number }
			>(OFFICIAL_BUILDS_QUERY, { limit: 50, offset: 0 });
			heroBuilds = result.officialBuilds.map(mapBuild).filter((b) => b.hero.id === hero.id);
		} catch {
			heroBuilds = [];
		}
	}

	type Tab = 'introduction' | 'base-stat' | 'skill' | 'builds' | 'matchup' | 'patch-note';
	let activeTab = $state<Tab>('introduction');

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'introduction', label: 'Introduction' },
		{ id: 'base-stat', label: 'Base Stat' },
		{ id: 'skill', label: 'Skill' },
		{ id: 'builds', label: 'Builds' },
		{ id: 'matchup', label: 'MatchUp' },
		{ id: 'patch-note', label: 'Patch Note' }
	];

	$effect(() => {
		if (activeTab === 'builds') loadHeroBuilds();
	});

	let level = $state(1);

	const damageColor: Record<string, string> = {
		physical: '#ffb86b',
		magic: '#89e0eb',
		true: '#f4f7ff',
		none: '#6a7a89'
	};

	const scaledStats = $derived(scaleStatsByLevel(hero.baseStats, hero.statsPerLevel, level));

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}

	function humanizeKey(key: string): string {
		return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function attrValueColor(label: string): string {
		const l = label.toLowerCase().replace(/_/g, ' ');
		if (l.includes('physical') || l.includes('attack') || l.includes('base damage'))
			return '#ffb86b';
		if (l.includes('magic') || l.includes('mana')) return '#a78bfa';
		if (l.includes('true') || l.includes('pure')) return '#f4f7ff';
		if (l.includes('hp') || l.includes('health') || l.includes('regen')) return '#5fb38a';
		if (l.includes('defense') || l.includes('armour') || l.includes('armor')) return '#c2724a';
		if (l.includes('speed') || l.includes('movement')) return '#c9a24a';
		if (l.includes('cooldown') || l.includes('cd')) return '#89e0eb';
		return '#e2e8f0';
	}

	function colorizeValue(value: string, label: string): string {
		const color = attrValueColor(label);
		const escaped = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return `<span style="color:${color};font-weight:700">${escaped}</span>`;
	}

	function processOutsideTags(text: string, fn: (segment: string) => string): string {
		return text.replace(/(<[^>]*>)|([^<]+)/g, (full, tag: string, content: string) => {
			if (tag) return tag;
			return fn(content);
		});
	}

	function highlightNumbers(text: string): string {
		return processOutsideTags(text, (segment) =>
			segment.replace(
				/(\+?\d+\.?\d*%?)/g,
				(match) => `<span style="color:#ffb86b;font-weight:700">${match}</span>`
			)
		);
	}

	function colorizeKeywords(text: string): string {
		const keywords: { pattern: RegExp; color: string }[] = [
			{ pattern: /Physical Attack|Physical Damage/gi, color: '#ffb86b' },
			{ pattern: /Magic Power|Magic Damage|Magical Damage/gi, color: '#a78bfa' },
			{ pattern: /True Damage/gi, color: '#f4f7ff' },
			{ pattern: /HP|Health Points/gi, color: '#5fb38a' },
			{ pattern: /Physical Defense|Magic Defense|Armor/gi, color: '#c2724a' },
			{ pattern: /Movement Speed/gi, color: '#c9a24a' },
			{ pattern: /Cooldown/gi, color: '#89e0eb' }
		];
		return processOutsideTags(text, (segment) => {
			let result = segment;
			for (const kw of keywords) {
				result = result.replace(
					kw.pattern,
					(match) => `<span style="color:${kw.color};font-weight:600">${match}</span>`
				);
			}
			return result;
		});
	}

	function replaceAttributePlaceholders(
		text: string,
		levelData: SkillLevelData[] | undefined,
		selectedLevel: number
	): string {
		if (!levelData || levelData.length === 0) return colorizeKeywords(highlightNumbers(text));
		const target = levelData.find((l) => l.level === selectedLevel) ?? levelData[0];
		if (!target) return colorizeKeywords(highlightNumbers(text));
		const replaced = text.replace(/\{\{(\w+)\}\}/g, (_match, attrName: string) => {
			const normalized = attrName.toLowerCase().replace(/_/g, ' ');
			const entry = target.attributes.find(
				(a) => a.label.toLowerCase().replace(/_/g, ' ') === normalized
			);
			return entry ? colorizeValue(entry.value, entry.label) : `{{${attrName}}}`;
		});
		return colorizeKeywords(highlightNumbers(replaced));
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

	<div class="mt-4 flex items-center gap-4">
		<div class="size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-3">
			{#if hero.avatarUrl}
				<img src={hero.avatarUrl} alt={hero.name} class="h-full w-full object-cover" />
			{/if}
		</div>
		<div>
			<h1 class="font-display text-3xl font-bold text-ink">{hero.name}</h1>
			<p class="flex items-center gap-2 text-sm" style="color:{roleColor(hero.role)}">
				<span
					class="inline-block h-2.5 w-2.5 rounded-full"
					style="background:{roleColor(hero.role)}"
				></span>
				{titleCase(hero.role)}
			</p>
		</div>
	</div>

	<div class="mt-6 border-b border-line">
		<nav class="-mb-px flex gap-1 overflow-x-auto" aria-label="Tabs">
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					onclick={() => (activeTab = tab.id)}
					class="shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition"
					class:border-accent={activeTab === tab.id}
					class:text-accent={activeTab === tab.id}
					class:border-transparent={activeTab !== tab.id}
					class:text-ink-muted={activeTab !== tab.id}
					class:hover:text-ink={activeTab !== tab.id}
				>
					{tab.label}
				</button>
			{/each}
		</nav>
	</div>

	<div class="mt-6">
		{#if activeTab === 'introduction'}
			<div class="grid gap-6 lg:grid-cols-[300px_1fr]">
				<div
					class="aspect-[3/4] max-h-[400px] overflow-hidden rounded-2xl border border-line bg-surface-3"
				>
					{#if hero.imageUrl}
						<img src={hero.imageUrl} alt={hero.name} class="h-full w-full object-cover" />
					{/if}
				</div>
				<div class="space-y-4">
					{#if hero.title}
						<p class="text-lg text-ink-muted italic">"{hero.title}"</p>
					{/if}
					{#if hero.lanes && hero.lanes.length}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase">Lane</span>
							<p class="mt-1 text-sm text-ink">{hero.lanes.join(' · ')}</p>
						</div>
					{/if}
					{#if hero.specialities && hero.specialities.length}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase"
								>Specialities</span
							>
							<div class="mt-1 flex flex-wrap gap-1.5">
								{#each hero.specialities as spec (spec)}
									<span class="rounded-full bg-surface-3 px-2.5 py-0.5 text-xs text-ink-muted"
										>{titleCase(spec)}</span
									>
								{/each}
							</div>
						</div>
					{/if}
					{#if hero.abilityScores}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase"
								>Ability Scores</span
							>
							<div class="mt-2 grid grid-cols-2 gap-3">
								{#each [{ label: 'Offense', value: hero.abilityScores.offense, color: '#ffb86b' }, { label: 'Durability', value: hero.abilityScores.durability, color: '#5fb38a' }, { label: 'Control Effect', value: hero.abilityScores.controlEffect, color: '#89e0eb' }, { label: 'Difficulty', value: hero.abilityScores.difficulty, color: '#a78bfa' }] as score (score.label)}
									<div>
										<div class="flex items-center justify-between text-xs">
											<span class="text-ink-muted">{score.label}</span>
											<span class="font-mono-stat text-ink">{score.value}</span>
										</div>
										<div class="mt-1 h-1.5 w-full overflow-hidden rounded bg-surface-3">
											<div
												class="h-full rounded"
												style="width:{(score.value / 100) * 100}%;background:{score.color}"
											></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					{#if hero.region}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase"
								>Region</span
							>
							<p class="mt-1 text-sm text-ink">{hero.region}</p>
						</div>
					{/if}
					{#if hero.releaseDate}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase"
								>Release Date</span
							>
							<p class="mt-1 text-sm text-ink">{hero.releaseDate}</p>
						</div>
					{/if}
					{#if hero.lore}
						<div>
							<span class="text-xs font-semibold tracking-wide text-ink-faint uppercase">Lore</span>
							<p class="mt-1 text-sm leading-relaxed text-ink-muted">{hero.lore}</p>
						</div>
					{/if}
					<a
						href={resolve('/calculator')}
						class="inline-block rounded-full bg-accent px-4 py-2 text-sm font-bold text-bg hover:bg-gold"
					>
						Gunakan di Kalkulator Damage
					</a>
				</div>
			</div>
		{:else if activeTab === 'base-stat'}
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
											<span class="font-mono-stat tabular-nums">{row.value}{row.suffix ?? ''}</span>
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
											<span class="font-mono-stat tabular-nums">{row.value}{row.suffix ?? ''}</span>
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
		{:else if activeTab === 'skill'}
			<section class="space-y-4">
				<h2 class="font-display text-lg font-bold">Skills</h2>
				<ul class="space-y-5">
					{#each hero.skills as skill (skill.id)}
						{@const maxLevel = skill.levelData?.length ?? 0}
						{@const currentLevel = getSkillLevel(skill.id, maxLevel)}
						{@const currentLevelData = skill.levelData?.find((l) => l.level === currentLevel)}
						<li class="overflow-hidden rounded-xl border border-line bg-bg">
							<div class="flex items-center gap-3 border-b border-line bg-surface/60 px-4 py-3">
								{#if skill.imageUrl}
									<span class="size-12 shrink-0 overflow-hidden rounded-lg bg-surface-3">
										<img src={skill.imageUrl} alt={skill.name} class="h-full w-full object-cover" />
									</span>
								{/if}
								<div class="min-w-0 flex-1">
									<div class="flex items-center gap-2">
										<span
											class="shrink-0 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
											style="color:{damageColor[skill.damageType]};background:{damageColor[
												skill.damageType
											]}2a"
										>
											{skill.rawType ?? skill.damageType}
										</span>
										<span class="text-base font-semibold text-ink">{skill.name}</span>
									</div>
									{#if skill.tags && skill.tags.length > 0}
										<p class="mt-0.5 text-xs text-ink-faint">
											{skill.tags.join(' · ')}
										</p>
									{/if}
								</div>
							</div>
							{#if maxLevel > 0}
								<div class="border-b border-line px-4 py-2.5">
									<div class="flex items-center gap-3">
										<span class="text-xs text-ink-faint"
											>Lv. <span class="font-mono-stat text-accent">{currentLevel}</span></span
										>
										<input
											type="range"
											min="1"
											max={maxLevel}
											value={currentLevel}
											oninput={(e) => setSkillLevel(skill.id, Number(e.currentTarget.value))}
											class="flex-1 accent-accent"
										/>
									</div>
								</div>
							{/if}
							{#if currentLevelData && currentLevelData.attributes.length > 0}
								<div
									class="flex flex-wrap gap-x-6 gap-y-1 border-b border-line px-4 py-2.5 text-xs"
								>
									{#each currentLevelData.attributes as attr (attr.label)}
										<span>
											<span class="text-ink-faint">{humanizeKey(attr.label)}:</span>
											<span
												class="font-mono-stat font-bold"
												style="color:{attrValueColor(attr.label)}">{attr.value}</span
											>
										</span>
									{/each}
								</div>
							{/if}
							{#if skill.description}
								<div class="px-4 py-3">
									<p class="text-sm leading-relaxed text-ink-muted">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html replaceAttributePlaceholders(
											skill.description,
											skill.levelData,
											currentLevel
										)}
									</p>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{:else if activeTab === 'builds'}
			<section class="space-y-4">
				<h2 class="font-display text-lg font-bold">Builds</h2>
				{#if !buildsLoaded}
					<p class="text-sm text-ink-muted">Memuat builds...</p>
				{:else if heroBuilds.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/82 p-12"
					>
						<p class="text-lg font-semibold text-ink-muted">Belum ada build</p>
						<p class="mt-1 text-sm text-ink-faint">Build untuk hero ini belum tersedia.</p>
					</div>
				{:else}
					<div class="grid gap-4 sm:grid-cols-2">
						{#each heroBuilds as build (build.id)}
							<article
								class="overflow-hidden rounded-xl border border-line bg-bg transition hover:border-accent/40"
							>
								<div class="border-b border-line bg-surface/60 px-4 py-3">
									<p class="text-sm font-semibold text-ink">{build.name}</p>
									<p class="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
										<span
											class="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent"
											>{build.role}</span
										>
										{#if build.description}
											<span class="text-ink-faint">· {build.description}</span>
										{/if}
									</p>
								</div>
								<div class="space-y-3 px-4 py-3">
									<div>
										<span class="text-[10px] font-medium tracking-wide text-ink-faint uppercase"
											>Items</span
										>
										<div class="mt-1 flex gap-1">
											{#each build.items.slice(0, 6) as item (item.id)}
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
														<span class="size-7 shrink-0 overflow-hidden rounded-md bg-surface-3">
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
			</section>
		{:else if activeTab === 'matchup'}
			<section class="space-y-4">
				<h2 class="font-display text-lg font-bold">Matchups & Synergy</h2>
				{#if relations.strongAgainst.length || relations.weakAgainst.length || relations.synergy.length}
					<div class="grid gap-4 md:grid-cols-3">
						<RelationGroup
							title="Strong Against"
							accent="#addfad"
							relations={relations.strongAgainst}
						/>
						<RelationGroup
							title="Weak Against"
							accent="#ff7a7c"
							relations={relations.weakAgainst}
						/>
						<RelationGroup title="Synergy" accent="#b387fa" relations={relations.synergy} />
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/82 p-12"
					>
						<p class="text-lg font-semibold text-ink-muted">Coming Soon</p>
						<p class="mt-1 text-sm text-ink-faint">Data matchup belum tersedia dari backend.</p>
					</div>
				{/if}
			</section>
		{:else if activeTab === 'patch-note'}
			<section class="space-y-4">
				<h2 class="font-display text-lg font-bold">Patch Note</h2>
				{#if relations.strongAgainst.length || relations.weakAgainst.length || relations.synergy.length}
					<div class="grid gap-4 md:grid-cols-3">
						<RelationGroup
							title="Strong Against"
							accent="#addfad"
							relations={relations.strongAgainst}
						/>
						<RelationGroup
							title="Weak Against"
							accent="#ff7a7c"
							relations={relations.weakAgainst}
						/>
						<RelationGroup title="Synergy" accent="#b387fa" relations={relations.synergy} />
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/82 p-12"
					>
						<p class="text-lg font-semibold text-ink-muted">Coming Soon</p>
						<p class="mt-1 text-sm text-ink-faint">Data patch-note belum tersedia dari backend.</p>
					</div>
				{/if}
			</section>
		{/if}
	</div>
</div>
