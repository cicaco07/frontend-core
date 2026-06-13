<script lang="ts">
	import type { PageData } from './$types';
	import { Loadout } from '$lib/stores/loadout.svelte';
	import { roleColor, titleCase, ITEM_CATEGORIES, categoryColor } from '$lib/utils/labels';
	import type { Emblem, Item, ItemCategory } from '$lib/types/equipment';
	import type { Hero, HeroSkill, SkillLevelData } from '$lib/types';
	import { ChevronDown, Swords, Shield, X } from 'lucide-svelte';
	import { gqlRequest } from '$lib/api/graphql';
	import { HERO_SKILLS_QUERY } from '$lib/api/queries';

	import { SvelteSet } from 'svelte/reactivity';
	import { computeDamage } from '$lib/calc/formulas';
	import type { StatBlock } from '$lib/types/stats';

	let { data }: { data: PageData } = $props();

	const loadout = new Loadout();
	const targetLoadout = new Loadout();

	$effect(() => {
		loadout.target = targetLoadout.finalStats;
	});

	interface BackendSkillsResponse {
		hero: {
			_id: string;
			skills: {
				_id: string;
				name: string;
				type: string;
				tag: string[];
				lite_description: string;
				full_description: string;
				attack_effect: number | null;
				skill_icon: string | null;
				skills_detail: {
					_id: string;
					level: number;
					attributes: Record<string, number>;
				}[];
			}[];
		};
	}

	function parseSkillAttributes(
		attrs: Record<string, number> | undefined
	): { label: string; value: string }[] {
		if (!attrs) return [];
		return Object.entries(attrs).map(([key, val]) => ({
			label: key,
			value: String(val)
		}));
	}

	function replaceAttributePlaceholders(
		text: string,
		levelData: SkillLevelData[] | undefined,
		level: number
	): string {
		if (!levelData || levelData.length === 0) return text;
		const targetLevel = levelData.find((l) => l.level === level) ?? levelData[0];
		if (!targetLevel) return text;
		return text.replace(/\{\{(\w+)\}\}/g, (_match, attrName: string) => {
			const normalized = attrName.toLowerCase().replace(/_/g, ' ');
			const entry = targetLevel.attributes.find(
				(a) => a.label.toLowerCase().replace(/_/g, ' ') === normalized
			);
			return entry ? entry.value : `{{${attrName}}}`;
		});
	}

	const enrichedMainIds = new SvelteSet<string>();
	const enrichedTargetIds = new SvelteSet<string>();

	let skillLevels = $state<Record<string, number>>({});

	function getSkillLevel(skillId: string, maxLevel: number): number {
		return skillLevels[skillId] ?? (maxLevel > 0 ? 1 : 0);
	}

	function setSkillLevel(skillId: string, level: number) {
		skillLevels = { ...skillLevels, [skillId]: level };
	}

	function parseScalingFromDescription(description: string | undefined): {
		type: 'total' | 'extra';
		stat: 'physicalAttack' | 'magicPower';
		ratio: number;
	}[] {
		if (!description) return [];
		const scalings: {
			type: 'total' | 'extra';
			stat: 'physicalAttack' | 'magicPower';
			ratio: number;
		}[] = [];
		const pattern = /\+(\d+)%\s+(Total|Extra)?\s*(Physical Attack|Magic Power)/gi;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(description)) !== null) {
			const ratio = Number(match[1]) / 100;
			const type = (match[2] ?? 'Total').toLowerCase() === 'extra' ? 'extra' : 'total';
			const stat: 'physicalAttack' | 'magicPower' = match[3].toLowerCase().includes('magic')
				? 'magicPower'
				: 'physicalAttack';
			scalings.push({ type, stat, ratio });
		}
		return scalings;
	}

	function parseHitCount(description: string | undefined): number {
		if (!description) return 1;
		const match = description.match(/(\d+)\s*kali/i);
		return match ? Number(match[1]) : 1;
	}

	function calculateSkillDamage(
		skill: HeroSkill,
		skillLevel: number,
		attackerStats: StatBlock,
		targetStats: StatBlock
	): number {
		const levelData = skill.levelData;
		const currentLvl = levelData?.find((l) => l.level === skillLevel) ?? levelData?.[0];
		const baseDamageAttr = currentLvl?.attributes.find(
			(a) => a.label.toLowerCase() === 'base_damage'
		);
		const baseDmg = baseDamageAttr ? Number(baseDamageAttr.value) : (skill.baseDamage[0] ?? 0);

		const scalings = parseScalingFromDescription(skill.description);
		const heroBase = loadout.heroStats;
		let raw = baseDmg;
		for (const s of scalings) {
			if (s.type === 'extra') {
				const extra = attackerStats[s.stat] - (heroBase[s.stat] ?? 0);
				raw += Math.max(0, extra) * s.ratio;
			} else {
				raw += attackerStats[s.stat] * s.ratio;
			}
		}

		if (raw === 0) return 0;

		const hits = parseHitCount(skill.description);

		const dmgPerHit = computeDamage({
			rawDamage: raw,
			damageType: skill.damageType === 'none' ? 'physical' : skill.damageType,
			attacker: attackerStats,
			target: targetStats
		});

		return dmgPerHit * hits;
	}

	async function enrichHeroSkills(hero: Hero, isTarget: boolean = false): Promise<void> {
		const ids = isTarget ? enrichedTargetIds : enrichedMainIds;
		if (!hero || ids.has(hero.id)) return;
		ids.add(hero.id);

		try {
			const result = await gqlRequest<BackendSkillsResponse>(HERO_SKILLS_QUERY, { id: hero.id });

			if (!result.hero?.skills) return;

			const merged: HeroSkill[] = hero.skills.map((skill) => {
				const detail = result.hero.skills.find((s) => s._id === skill.id);
				if (!detail) return skill;

				const levelData: SkillLevelData[] = (detail.skills_detail ?? []).map((d) => ({
					level: d.level,
					attributes: parseSkillAttributes(d.attributes)
				}));

				return {
					...skill,
					imageUrl: detail.skill_icon || skill.imageUrl,
					description: detail.full_description || detail.lite_description || skill.description,
					levelData: levelData.length > 0 ? levelData : skill.levelData
				} satisfies HeroSkill;
			});

			if (isTarget) {
				targetLoadout.hero = { ...hero, skills: merged };
			} else {
				loadout.hero = { ...hero, skills: merged };
			}
		} catch (err) {
			console.error(`[enrich] Query failed for ${hero.name}:`, err);
		}
	}

	function selectHero(hero: Hero) {
		loadout.hero = hero;
		heroDropdownOpen = false;
		skillLevels = {};
		enrichHeroSkills(hero, false);
	}

	function selectTargetHero(hero: Hero) {
		targetLoadout.hero = hero;
		targetHeroDropdownOpen = false;
		enrichHeroSkills(hero, true);
	}

	let dragItem = $state<Item | null>(null);
	let dragTargetItem = $state<Item | null>(null);
	let searchQuery = $state('');
	let targetSearchQuery = $state('');
	let categoryFilter = $state<ItemCategory | null>(null);
	let targetCategoryFilter = $state<ItemCategory | null>(null);
	let heroDropdownOpen = $state(false);
	let targetHeroDropdownOpen = $state(false);
	let openEmblem = $state<string | null>(null);
	let openTargetEmblem = $state<string | null>(null);

	const sortedHeroes = $derived([...data.heroes].sort((a, b) => a.name.localeCompare(b.name)));

	const filteredItems = $derived(
		data.items.filter((i) => {
			if (categoryFilter && i.category !== categoryFilter) return false;
			if (searchQuery.trim() && !i.name.toLowerCase().includes(searchQuery.toLowerCase()))
				return false;
			return true;
		})
	);

	const filteredTargetItems = $derived(
		data.items.filter((i) => {
			if (targetCategoryFilter && i.category !== targetCategoryFilter) return false;
			if (
				targetSearchQuery.trim() &&
				!i.name.toLowerCase().includes(targetSearchQuery.toLowerCase())
			)
				return false;
			return true;
		})
	);

	const mainEmblems = $derived(data.emblems.filter((e) => e.type === 'Main Emblem'));
	const primaryTalents = $derived(data.emblems.filter((e) => e.type === 'Primary Talent'));
	const commonTalentsS1 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 1')
	);
	const commonTalentsS2 = $derived(
		data.emblems.filter((e) => e.type === 'Common Talent - Section 2')
	);

	function onDragStart(item: Item) {
		dragItem = item;
	}

	function onTargetDragStart(item: Item) {
		dragTargetItem = item;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDropPrimary(_e: DragEvent) {
		_e.preventDefault();
		if (!dragItem) return;
		loadout.addItem(dragItem);
		dragItem = null;
	}

	function onDropSecondary(_e: DragEvent) {
		_e.preventDefault();
		if (!dragItem) return;
		loadout.addSecondaryItem(dragItem);
		dragItem = null;
	}

	function onTargetDropPrimary(e: DragEvent) {
		e.preventDefault();
		if (!dragTargetItem) return;
		targetLoadout.addItem(dragTargetItem);
		dragTargetItem = null;
	}

	function onTargetDropSecondary(e: DragEvent) {
		e.preventDefault();
		if (!dragTargetItem) return;
		targetLoadout.addSecondaryItem(dragTargetItem);
		dragTargetItem = null;
	}

	function round(n: number): number {
		return Math.round(n * 10) / 10;
	}

	const stats = $derived(loadout.finalStats);
	const targetStats = $derived(targetLoadout.finalStats);
	const mainItemStats = $derived(loadout.itemStats);
	const targetItemStats = $derived(targetLoadout.itemStats);

	const heroStats = $derived(loadout.heroStats);
	const emblemStatsData = $derived(loadout.emblemStats);

	type StatKey =
		| 'physicalAttack'
		| 'magicPower'
		| 'attackSpeedPct'
		| 'critChancePct'
		| 'lifestealPct'
		| 'spellVampPct'
		| 'physicalPenFlat'
		| 'physicalPenPct'
		| 'magicPenFlat'
		| 'magicPenPct'
		| 'hp'
		| 'mana'
		| 'physicalDefense'
		| 'magicDefense'
		| 'movementSpeed';

	function getStatBreakdown(key: StatKey): { source: string; value: number }[] {
		const sources: { source: string; value: number }[] = [];
		const hv = heroStats[key];
		if (hv) sources.push({ source: 'Hero', value: hv });
		const iv = mainItemStats[key];
		if (iv) sources.push({ source: 'Items', value: iv });
		const ev = emblemStatsData[key];
		if (ev) sources.push({ source: 'Emblem', value: ev });
		return sources;
	}

	let openBreakdown = $state<string | null>(null);

	function toggleBreakdown(label: string) {
		openBreakdown = openBreakdown === label ? null : label;
	}

	interface StatRow {
		label: string;
		value: number;
		color: string;
		suffix?: string;
		key: StatKey;
		isPct?: boolean;
	}

	const offenseStats = $derived<StatRow[]>([
		{ label: 'Physical ATK', value: stats.physicalAttack, color: '#ffb86b', key: 'physicalAttack' },
		{ label: 'Magic Power', value: stats.magicPower, color: '#89e0eb', key: 'magicPower' },
		{
			label: 'ATK SPD',
			value: stats.attackSpeedPct * 100,
			color: '#ffb86b',
			suffix: '%',
			key: 'attackSpeedPct',
			isPct: true
		},
		{
			label: 'Crit Chance',
			value: stats.critChancePct * 100,
			color: '#f4f7ff',
			suffix: '%',
			key: 'critChancePct',
			isPct: true
		},
		{
			label: 'Lifesteal',
			value: stats.lifestealPct * 100,
			color: '#ff7a7c',
			suffix: '%',
			key: 'lifestealPct',
			isPct: true
		},
		{
			label: 'Spell Vamp',
			value: stats.spellVampPct * 100,
			color: '#a78bfa',
			suffix: '%',
			key: 'spellVampPct',
			isPct: true
		},
		{
			label: 'Phys PEN',
			value: stats.physicalPenFlat,
			color: '#e07a5f',
			key: 'physicalPenFlat'
		},
		{
			label: 'Phys PEN %',
			value: stats.physicalPenPct * 100,
			color: '#e07a5f',
			suffix: '%',
			key: 'physicalPenPct',
			isPct: true
		},
		{
			label: 'Magic PEN',
			value: stats.magicPenFlat,
			color: '#7b68ee',
			key: 'magicPenFlat'
		},
		{
			label: 'Magic PEN %',
			value: stats.magicPenPct * 100,
			color: '#7b68ee',
			suffix: '%',
			key: 'magicPenPct',
			isPct: true
		}
	]);

	const defenseStats = $derived<StatRow[]>([
		{ label: 'HP', value: stats.hp, color: '#5fb38a', key: 'hp' },
		{ label: 'Mana', value: stats.mana, color: '#5aa6c4', key: 'mana' },
		{
			label: 'Phys DEF',
			value: stats.physicalDefense,
			color: '#c2724a',
			key: 'physicalDefense'
		},
		{ label: 'Magic DEF', value: stats.magicDefense, color: '#b25c8f', key: 'magicDefense' },
		{ label: 'Move SPD', value: stats.movementSpeed, color: '#c9a24a', key: 'movementSpeed' }
	]);

	const targetOffenseStats = $derived([
		{ label: 'Physical ATK', value: targetStats.physicalAttack, color: '#ffb86b' },
		{ label: 'Magic Power', value: targetStats.magicPower, color: '#89e0eb' },
		{ label: 'ATK SPD', value: targetStats.attackSpeedPct * 100, color: '#ffb86b', suffix: '%' },
		{ label: 'Crit Chance', value: targetStats.critChancePct * 100, color: '#f4f7ff', suffix: '%' },
		{ label: 'Lifesteal', value: targetStats.lifestealPct * 100, color: '#ff7a7c', suffix: '%' },
		{ label: 'Spell Vamp', value: targetStats.spellVampPct * 100, color: '#a78bfa', suffix: '%' }
	] as Array<{ label: string; value: number; color: string; suffix?: string }>);

	const targetDefenseStats = $derived([
		{ label: 'HP', value: targetStats.hp, color: '#5fb38a' },
		{ label: 'Mana', value: targetStats.mana, color: '#5aa6c4' },
		{ label: 'Phys DEF', value: targetStats.physicalDefense, color: '#c2724a' },
		{ label: 'Magic DEF', value: targetStats.magicDefense, color: '#b25c8f' },
		{ label: 'Move SPD', value: targetStats.movementSpeed, color: '#c9a24a' }
	] as Array<{ label: string; value: number; color: string; suffix?: string }>);

	function selectMainEmblem(slug: string) {
		loadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectPrimaryTalent(slug: string) {
		loadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTier1Talent(slug: string) {
		loadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTier2Talent(slug: string) {
		loadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openEmblem = null;
	}

	function selectTargetMainEmblem(slug: string) {
		targetLoadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetPrimaryTalent(slug: string) {
		targetLoadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetTier1Talent(slug: string) {
		targetLoadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	function selectTargetTier2Talent(slug: string) {
		targetLoadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
		openTargetEmblem = null;
	}

	const emblemSelector: Record<string, (slug: string) => void> = {
		main: (s) => selectMainEmblem(s),
		primary: (s) => selectPrimaryTalent(s),
		s1: (s) => selectTier1Talent(s),
		s2: (s) => selectTier2Talent(s),
		tmain: (s) => selectTargetMainEmblem(s),
		tprimary: (s) => selectTargetPrimaryTalent(s),
		ts1: (s) => selectTargetTier1Talent(s),
		ts2: (s) => selectTargetTier2Talent(s)
	};

	function getSelectedEmblem(groupKey: string): Emblem | null {
		const map: Record<string, Emblem | null> = {
			main: loadout.mainEmblem,
			primary: loadout.primaryTalent,
			s1: loadout.tier1Talent,
			s2: loadout.tier2Talent,
			tmain: targetLoadout.mainEmblem,
			tprimary: targetLoadout.primaryTalent,
			ts1: targetLoadout.tier1Talent,
			ts2: targetLoadout.tier2Talent
		};
		return map[groupKey] ?? null;
	}

	function handleEmblemSelect(slug: string, groupKey: string) {
		emblemSelector[groupKey]?.(slug);
		if (groupKey.startsWith('t')) {
			openTargetEmblem = null;
		} else {
			openEmblem = null;
		}
	}

	function handleWindowClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-emblem-dropdown]')) {
			openEmblem = null;
			openTargetEmblem = null;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="mx-auto max-w-[1400px] space-y-6 px-4 py-10 sm:px-6">
	<div>
		<h1 class="font-display text-3xl font-bold text-ink">Kalkulator Damage</h1>
		<p class="mt-1 text-sm text-ink-muted">
			Hitung damage, DPS, dan output build secara real-time.
		</p>
	</div>

	<div class="grid gap-6 xl:grid-cols-[300px_1fr_300px]">
		<!-- LEFT WIDGET: Loadout -->
		<section class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4">
			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="relative mt-1">
					<button
						type="button"
						onclick={() => (heroDropdownOpen = !heroDropdownOpen)}
						class="flex w-full items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<span>{loadout.hero?.name ?? 'Select hero'}</span>
						<ChevronDown class="size-4 text-ink-faint" />
					</button>
					{#if heroDropdownOpen}
						<div
							class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
						>
							{#each sortedHeroes as hero (hero.id)}
								<button
									type="button"
									onclick={() => selectHero(hero)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
								>
									<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
										{#if hero.avatarUrl}
											<img src={hero.avatarUrl} alt="" class="h-full w-full object-cover" />
										{/if}
									</span>
									<span>{hero.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</label>

			{#if loadout.hero}
				<p class="flex items-center gap-2 text-sm" style="color:{roleColor(loadout.hero.role)}">
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background:{roleColor(loadout.hero.role)}"
					></span>
					{titleCase(loadout.hero.role)}
				</p>
			{/if}

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Level: {loadout.level}</span
				>
				<input
					type="range"
					min="1"
					max="15"
					bind:value={loadout.level}
					class="mt-1 w-full accent-accent"
				/>
				<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
					<span>1</span><span>15</span>
				</div>
			</label>

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'main', label: 'Main Emblem', items: mainEmblems }, { key: 'primary', label: 'Primary Talent', items: primaryTalents }, { key: 's1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 's2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<div class="relative" data-emblem-dropdown>
							<button
								type="button"
								onclick={() => (openEmblem = openEmblem === group.key ? null : group.key)}
								class="flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
							>
								{#if selected}
									{#if selected.icon}
										<span class="size-5 shrink-0 overflow-hidden rounded">
											<img src={selected.icon} alt="" class="h-full w-full object-contain" />
										</span>
									{/if}
									<span class="flex-1 text-left">{selected.name}</span>
								{:else}
									<span class="flex-1 text-left">{group.label}…</span>
								{/if}
								<ChevronDown class="size-4 shrink-0 text-ink-faint" />
							</button>
							{#if openEmblem === group.key}
								<div
									class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
								>
									{#each group.items as em (em.id)}
										<button
											type="button"
											onclick={() => handleEmblemSelect(em.slug, group.key)}
											class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
										>
											{#if em.icon}
												<span class="size-5 shrink-0 overflow-hidden rounded">
													<img src={em.icon} alt="" class="h-full w-full object-contain" />
												</span>
											{/if}
											<span>{em.name}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div>
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Primary Items ({loadout.items.length}/6)</span
				>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2, 3, 4, 5] as i (i)}
						{@const item = loadout.items[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
							class:border-accent-40={item}
							class:border-line={!item}
							class:bg-surface-3={item}
							role="listitem"
							ondragover={onDragOver}
							ondrop={onDropPrimary}
						>
							{#if item}
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
								{/if}
								<button
									type="button"
									onclick={() => loadout.removeItem(i)}
									class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
								>
									<X class="size-3" />
								</button>
							{:else}
								<span class="text-xs text-ink-faint">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div>
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Secondary Items ({loadout.secondaryItems.length}/3)</span
				>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2] as i (i)}
						{@const item = loadout.secondaryItems[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition {item
								? 'border-amber-400 bg-surface-3'
								: 'border-line'}"
							role="listitem"
							ondragover={onDragOver}
							ondrop={onDropSecondary}
						>
							{#if item}
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
								{/if}
								<button
									type="button"
									onclick={() => loadout.removeSecondaryItem(i)}
									class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
								>
									<X class="size-3" />
								</button>
							{:else}
								<span class="text-xs text-ink-faint">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="border-t border-line pt-4">
				<div class="mb-2 flex items-center gap-2">
					<input
						type="search"
						placeholder="Search item..."
						bind:value={searchQuery}
						class="flex-1 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
					/>
				</div>
				<div class="mb-2 flex flex-wrap gap-1">
					<button
						type="button"
						onclick={() => (categoryFilter = null)}
						class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
						class:bg-accent={categoryFilter === null}
						class:text-white={categoryFilter === null}
						class:bg-surface-3={categoryFilter !== null}
						class:text-ink-muted={categoryFilter !== null}>All</button
					>
					{#each ITEM_CATEGORIES as cat (cat)}
						<button
							type="button"
							onclick={() => (categoryFilter = categoryFilter === cat ? null : cat)}
							class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
							class:text-white={categoryFilter === cat}
							class:bg-surface-3={categoryFilter !== cat}
							class:text-ink-muted={categoryFilter !== cat}
							style={categoryFilter === cat ? `background:${categoryColor(cat)}` : ''}
							>{titleCase(cat)}</button
						>
					{/each}
				</div>
				<div class="max-h-48 overflow-y-auto">
					<div class="grid grid-cols-2 gap-1">
						{#each filteredItems as item (item.id)}
							<button
								type="button"
								draggable="true"
								ondragstart={() => onDragStart(item)}
								onclick={() => loadout.addItem(item)}
								class="flex items-center gap-1.5 rounded-lg border border-line bg-bg/50 px-1.5 py-1 text-left text-[11px] transition hover:border-accent/40 hover:bg-surface-2"
							>
								<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
									{#if item.imageUrl}
										<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
									{/if}
								</span>
								<span class="truncate text-ink">{item.name}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- MIDDLE WIDGET: Stats Display -->
		<section
			class="flex flex-col items-center justify-start rounded-2xl border border-line bg-surface/60 p-6"
		>
			<div class="mb-4 size-36 overflow-hidden rounded-full border-2 border-accent/40 bg-accent/10">
				{#if loadout.hero?.avatarUrl}
					<img
						src={loadout.hero.avatarUrl}
						alt={loadout.hero.name}
						class="h-full w-full object-cover"
					/>
				{/if}
			</div>
			<h2 class="font-display text-2xl font-bold text-ink">{loadout.hero?.name ?? 'Pilih Hero'}</h2>
			<p class="mt-1 text-xs text-ink-muted">Level {loadout.level}</p>

			<div class="mt-6 w-full">
				<div class="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
					<div class="space-y-1.5">
						<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
							<Swords class="size-3.5" /> Offense
						</div>
						{#each offenseStats as row (row.label)}
							<div class="relative">
								<button
									type="button"
									onclick={() => toggleBreakdown(row.label)}
									class="-mx-1 flex w-full items-center justify-between rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
								>
									<span class="text-ink-muted">{row.label}</span>
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-16 overflow-hidden rounded bg-surface-3">
											<div
												class="h-full rounded"
												style="width:{Math.min(
													100,
													Math.max(2, (row.value / 10000) * 100)
												)}%;background:{row.color}"
											></div>
										</div>
										<span class="font-mono-stat w-14 text-right text-ink tabular-nums"
											>{round(row.value)}{row.suffix ?? ''}</span
										>
									</div>
								</button>
								{#if openBreakdown === row.label}
									<div
										class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
									>
										{#each getStatBreakdown(row.key) as src (src.source)}
											<div class="flex justify-between text-[11px]">
												<span class="text-ink-faint">{src.source}</span>
												<span class="font-mono-stat text-ink tabular-nums"
													>{row.isPct ? round(src.value * 100) + '%' : round(src.value)}</span
												>
											</div>
										{/each}
										{#if getStatBreakdown(row.key).length === 0}
											<span class="text-[11px] text-ink-faint">No sources</span>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
					<div class="space-y-1.5">
						<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
							<Shield class="size-3.5" /> Defense
						</div>
						{#each defenseStats as row (row.label)}
							<div class="relative">
								<button
									type="button"
									onclick={() => toggleBreakdown(row.label)}
									class="-mx-1 flex w-full items-center justify-between rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
								>
									<span class="text-ink-muted">{row.label}</span>
									<div class="flex items-center gap-2">
										<div class="h-1.5 w-16 overflow-hidden rounded bg-surface-3">
											<div
												class="h-full rounded"
												style="width:{Math.min(
													100,
													Math.max(2, (row.value / 10000) * 100)
												)}%;background:{row.color}"
											></div>
										</div>
										<span class="font-mono-stat w-14 text-right text-ink tabular-nums"
											>{round(row.value)}{row.suffix ?? ''}</span
										>
									</div>
								</button>
								{#if openBreakdown === row.label}
									<div
										class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
									>
										{#each getStatBreakdown(row.key) as src (src.source)}
											<div class="flex justify-between text-[11px]">
												<span class="text-ink-faint">{src.source}</span>
												<span class="font-mono-stat text-ink tabular-nums"
													>{row.isPct ? round(src.value * 100) + '%' : round(src.value)}</span
												>
											</div>
										{/each}
										{#if getStatBreakdown(row.key).length === 0}
											<span class="text-[11px] text-ink-faint">No sources</span>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="mt-6 w-full border-t border-line pt-4">
				<div class="grid grid-cols-3 gap-2 text-center">
					<div>
						<p class="text-xs text-ink-muted">Avg BA</p>
						<p class="font-mono-stat text-sm text-ink">{round(loadout.basicAttackDamage)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-muted">DPS</p>
						<p class="font-mono-stat text-sm text-accent">{round(loadout.dps)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-muted">EHP Phys</p>
						<p class="font-mono-stat text-sm text-ink">
							{round(stats.hp / (120 / (120 + Math.max(0, stats.physicalDefense))))}
						</p>
					</div>
				</div>
			</div>

			{#if loadout.hero}
				<div class="mt-6 w-full border-t border-line pt-4">
					<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
						>Skills</span
					>
					<div class="mt-3 space-y-3">
						{#each loadout.hero.skills as skill (skill.id)}
							{@const maxLevel = skill.levelData?.length ?? 0}
							{@const currentLevel = getSkillLevel(skill.id, maxLevel)}
							{@const currentLevelData = skill.levelData?.find((l) => l.level === currentLevel)}
							<div class="rounded-lg border border-line bg-bg/50 p-3">
								<div class="flex items-start gap-3">
									{#if skill.imageUrl}
										<span class="size-12 shrink-0 overflow-hidden rounded-lg bg-surface-3">
											<img
												src={skill.imageUrl}
												alt={skill.name}
												class="h-full w-full object-cover"
											/>
										</span>
									{/if}
									<div class="min-w-0 flex-1">
										<div class="flex items-center justify-between gap-2">
											<span class="text-sm font-semibold text-ink">{skill.name}</span>
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
												<span class="font-mono-stat shrink-0 text-xs text-accent"
													>{round(
														calculateSkillDamage(skill, currentLevel, stats, targetStats)
													)}</span
												>
											</div>
										</div>
										{#if skill.description}
											<p class="mt-1 text-xs leading-relaxed text-ink-muted">
												{replaceAttributePlaceholders(
													skill.description,
													skill.levelData,
													currentLevel
												)}
											</p>
										{/if}
										{#if currentLevelData}
											<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
												{#each currentLevelData.attributes as attr (attr.label)}
													<span class="text-xs text-ink-muted">
														<span class="text-ink-faint">{attr.label}:</span>
														<span class="font-mono-stat text-ink">{attr.value}</span>
													</span>
												{/each}
											</div>
										{/if}
										{#if skill.levelData && skill.levelData.length > 0}
											<div class="mt-2">
												<details class="group">
													<summary
														class="flex cursor-pointer list-none items-center gap-1 text-xs text-ink-faint transition-colors hover:text-ink-muted"
													>
														<ChevronDown class="size-3 transition group-open:rotate-180" />
														All Levels
													</summary>
													<div class="mt-2 overflow-x-auto">
														<table class="w-full text-xs">
															<thead>
																<tr class="border-b border-line text-ink-faint">
																	<th class="px-2 py-1 text-left">Lv</th>
																	{#each skill.levelData[0]?.attributes ?? [] as attr (attr.label)}
																		<th class="px-2 py-1 text-right">{attr.label}</th>
																	{/each}
																</tr>
															</thead>
															<tbody>
																{#each skill.levelData as level (level.level)}
																	<tr
																		class="border-b border-line/50 {level.level === currentLevel
																			? 'bg-accent/10'
																			: 'hover:bg-surface-2/50'}"
																	>
																		<td class="px-2 py-1 font-medium text-ink-muted"
																			>{level.level}</td
																		>
																		{#each level.attributes as attr (attr.label)}
																			<td
																				class="font-mono-stat px-2 py-1 text-right text-ink tabular-nums"
																				>{attr.value}</td
																			>
																		{/each}
																	</tr>
																{/each}
															</tbody>
														</table>
													</div>
												</details>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</section>

		<!-- RIGHT WIDGET: Target -->
		<section class="space-y-4 rounded-2xl border border-line bg-surface/82 p-4">
			<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
				>Target</span
			>

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="relative mt-1">
					<button
						type="button"
						onclick={() => (targetHeroDropdownOpen = !targetHeroDropdownOpen)}
						class="flex w-full items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
					>
						<span>{targetLoadout.hero?.name ?? 'Select target'}</span>
						<ChevronDown class="size-4 text-ink-faint" />
					</button>
					{#if targetHeroDropdownOpen}
						<div
							class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
						>
							{#each sortedHeroes as hero (hero.id)}
								<button
									type="button"
									onclick={() => selectTargetHero(hero)}
									class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
								>
									<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
										{#if hero.avatarUrl}
											<img src={hero.avatarUrl} alt="" class="h-full w-full object-cover" />
										{/if}
									</span>
									<span>{hero.name}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</label>

			{#if targetLoadout.hero}
				<p
					class="flex items-center gap-2 text-sm"
					style="color:{roleColor(targetLoadout.hero.role)}"
				>
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background:{roleColor(targetLoadout.hero.role)}"
					></span>
					{titleCase(targetLoadout.hero.role)}
				</p>
			{/if}

			<label class="block">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Level: {targetLoadout.level}</span
				>
				<input
					type="range"
					min="1"
					max="15"
					bind:value={targetLoadout.level}
					class="mt-1 w-full accent-accent"
				/>
				<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
					<span>1</span><span>15</span>
				</div>
			</label>

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'tmain', label: 'Main Emblem', items: mainEmblems }, { key: 'tprimary', label: 'Primary Talent', items: primaryTalents }, { key: 'ts1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 'ts2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<div class="relative" data-emblem-dropdown>
							<button
								type="button"
								onclick={() =>
									(openTargetEmblem = openTargetEmblem === group.key ? null : group.key)}
								class="flex w-full items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink"
							>
								{#if selected}
									{#if selected.icon}
										<span class="size-5 shrink-0 overflow-hidden rounded">
											<img src={selected.icon} alt="" class="h-full w-full object-contain" />
										</span>
									{/if}
									<span class="flex-1 text-left">{selected.name}</span>
								{:else}
									<span class="flex-1 text-left">{group.label}…</span>
								{/if}
								<ChevronDown class="size-4 shrink-0 text-ink-faint" />
							</button>
							{#if openTargetEmblem === group.key}
								<div
									class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-bg shadow-lg"
								>
									{#each group.items as em (em.id)}
										<button
											type="button"
											onclick={() => handleEmblemSelect(em.slug, group.key)}
											class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
										>
											{#if em.icon}
												<span class="size-5 shrink-0 overflow-hidden rounded">
													<img src={em.icon} alt="" class="h-full w-full object-contain" />
												</span>
											{/if}
											<span>{em.name}</span>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="border-t border-line pt-4">
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Primary Items ({targetLoadout.items.length}/6)</span
				>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2, 3, 4, 5] as i (i)}
						{@const item = targetLoadout.items[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
							class:border-accent-40={item}
							class:border-line={!item}
							class:bg-surface-3={item}
							role="listitem"
							ondragover={onDragOver}
							ondrop={onTargetDropPrimary}
						>
							{#if item}
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
								{/if}
								<button
									type="button"
									onclick={() => targetLoadout.removeItem(i)}
									class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
								>
									<X class="size-3" />
								</button>
							{:else}
								<span class="text-xs text-ink-faint">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div>
				<span class="text-xs tracking-wide text-ink-faint uppercase"
					>Secondary Items ({targetLoadout.secondaryItems.length}/3)</span
				>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2] as i (i)}
						{@const item = targetLoadout.secondaryItems[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition {item
								? 'border-amber-400 bg-surface-3'
								: 'border-line'}"
							role="listitem"
							ondragover={onDragOver}
							ondrop={onTargetDropSecondary}
						>
							{#if item}
								{#if item.imageUrl}
									<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
								{:else}
									<span class="px-1 text-center text-[10px] text-ink-muted">{item.name}</span>
								{/if}
								<button
									type="button"
									onclick={() => targetLoadout.removeSecondaryItem(i)}
									class="absolute top-0 right-0 flex size-4 items-center justify-center rounded-bl bg-red-500/80 text-xs text-white hover:bg-red-500"
								>
									<X class="size-3" />
								</button>
							{:else}
								<span class="text-xs text-ink-faint">+</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="border-t border-line pt-4">
				<div class="mb-2 flex items-center gap-2">
					<input
						type="search"
						placeholder="Search item..."
						bind:value={targetSearchQuery}
						class="flex-1 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
					/>
				</div>
				<div class="mb-2 flex flex-wrap gap-1">
					<button
						type="button"
						onclick={() => (targetCategoryFilter = null)}
						class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
						class:bg-accent={targetCategoryFilter === null}
						class:text-white={targetCategoryFilter === null}
						class:bg-surface-3={targetCategoryFilter !== null}
						class:text-ink-muted={targetCategoryFilter !== null}>All</button
					>
					{#each ITEM_CATEGORIES as cat (cat)}
						<button
							type="button"
							onclick={() => (targetCategoryFilter = targetCategoryFilter === cat ? null : cat)}
							class="rounded-full px-2 py-0.5 text-[10px] font-medium transition"
							class:text-white={targetCategoryFilter === cat}
							class:bg-surface-3={targetCategoryFilter !== cat}
							class:text-ink-muted={targetCategoryFilter !== cat}
							style={targetCategoryFilter === cat ? `background:${categoryColor(cat)}` : ''}
							>{titleCase(cat)}</button
						>
					{/each}
				</div>
				<div class="max-h-48 overflow-y-auto">
					<div class="grid grid-cols-2 gap-1">
						{#each filteredTargetItems as item (item.id)}
							<button
								type="button"
								draggable="true"
								ondragstart={() => onTargetDragStart(item)}
								onclick={() => targetLoadout.addItem(item)}
								class="flex items-center gap-1.5 rounded-lg border border-line bg-bg/50 px-1.5 py-1 text-left text-[11px] transition hover:border-accent/40 hover:bg-surface-2"
							>
								<span class="size-6 shrink-0 overflow-hidden rounded bg-surface-3">
									{#if item.imageUrl}
										<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
									{/if}
								</span>
								<span class="truncate text-ink">{item.name}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Target Stats</span
				>
				<div class="mt-3 space-y-1.5">
					<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
						<Swords class="size-3.5" /> Offense
					</div>
					{#each targetOffenseStats as row (row.label)}
						<div class="flex items-center justify-between text-sm">
							<span class="text-ink-muted">{row.label}</span>
							<span class="font-mono-stat text-ink tabular-nums">
								{round(row.value)}{row.suffix ?? ''}
							</span>
						</div>
					{/each}
				</div>
				<div class="mt-3 space-y-1.5 border-t border-line pt-3">
					<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
						<Shield class="size-3.5" /> Defense
					</div>
					{#each targetDefenseStats as row (row.label)}
						<div class="flex items-center justify-between text-sm">
							<span class="text-ink-muted">{row.label}</span>
							<span class="font-mono-stat text-ink tabular-nums">
								{round(row.value)}{row.suffix ?? ''}
							</span>
						</div>
					{/each}
				</div>
			</div>
		</section>
	</div>

	<!-- Item Stats Summary -->
	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
				>Total Item Stats (Hero)</span
			>
			<div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
				{#if mainItemStats.physicalAttack}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Physical ATK</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.physicalAttack)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.magicPower}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic Power</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.magicPower)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.hp}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">HP</span>
						<span class="font-mono-stat text-ink tabular-nums">+{round(mainItemStats.hp)}</span>
					</div>
				{/if}
				{#if mainItemStats.mana}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Mana</span>
						<span class="font-mono-stat text-ink tabular-nums">+{round(mainItemStats.mana)}</span>
					</div>
				{/if}
				{#if mainItemStats.hpRegen}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">HP Regen</span>
						<span class="font-mono-stat text-ink tabular-nums">+{round(mainItemStats.hpRegen)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.manaRegen}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Mana Regen</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.manaRegen)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.physicalDefense}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys DEF</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.physicalDefense)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.magicDefense}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic DEF</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.magicDefense)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.attackSpeedPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">ATK SPD</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.attackSpeedPct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.critChancePct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Crit Chance</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.critChancePct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.critDamagePct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Crit DMG</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.critDamagePct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.cooldownReductionPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">CDR</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.cooldownReductionPct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.lifestealPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Lifesteal</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.lifestealPct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.spellVampPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Spell Vamp</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.spellVampPct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.movementSpeed}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Move SPD</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.movementSpeed)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.physicalPenFlat}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys PEN</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.physicalPenFlat)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.physicalPenPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys PEN %</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.physicalPenPct * 100)}%</span
						>
					</div>
				{/if}
				{#if mainItemStats.magicPenFlat}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic PEN</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.magicPenFlat)}</span
						>
					</div>
				{/if}
				{#if mainItemStats.magicPenPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic PEN %</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(mainItemStats.magicPenPct * 100)}%</span
						>
					</div>
				{/if}
			</div>
		</section>

		<section class="rounded-2xl border border-line bg-surface/82 p-4">
			<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
				>Total Item Stats (Target)</span
			>
			<div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
				{#if targetItemStats.physicalAttack}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Physical ATK</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.physicalAttack)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.magicPower}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic Power</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.magicPower)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.hp}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">HP</span>
						<span class="font-mono-stat text-ink tabular-nums">+{round(targetItemStats.hp)}</span>
					</div>
				{/if}
				{#if targetItemStats.mana}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Mana</span>
						<span class="font-mono-stat text-ink tabular-nums">+{round(targetItemStats.mana)}</span>
					</div>
				{/if}
				{#if targetItemStats.hpRegen}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">HP Regen</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.hpRegen)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.manaRegen}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Mana Regen</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.manaRegen)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.physicalDefense}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys DEF</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.physicalDefense)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.magicDefense}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic DEF</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.magicDefense)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.attackSpeedPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">ATK SPD</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.attackSpeedPct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.critChancePct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Crit Chance</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.critChancePct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.critDamagePct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Crit DMG</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.critDamagePct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.cooldownReductionPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">CDR</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.cooldownReductionPct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.lifestealPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Lifesteal</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.lifestealPct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.spellVampPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Spell Vamp</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.spellVampPct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.movementSpeed}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Move SPD</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.movementSpeed)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.physicalPenFlat}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys PEN</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.physicalPenFlat)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.physicalPenPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Phys PEN %</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.physicalPenPct * 100)}%</span
						>
					</div>
				{/if}
				{#if targetItemStats.magicPenFlat}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic PEN</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.magicPenFlat)}</span
						>
					</div>
				{/if}
				{#if targetItemStats.magicPenPct}
					<div class="flex items-center justify-between">
						<span class="text-ink-muted">Magic PEN %</span>
						<span class="font-mono-stat text-ink tabular-nums"
							>+{round(targetItemStats.magicPenPct * 100)}%</span
						>
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>
