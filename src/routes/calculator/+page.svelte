<script lang="ts">
	import type { PageData } from './$types';
	import { Loadout } from '$lib/stores/loadout.svelte';
	import { roleColor, titleCase, ITEM_CATEGORIES, categoryColor } from '$lib/utils/labels';
	import type { Emblem, Item, ItemCategory } from '$lib/types/equipment';
	import type { Hero, HeroSkill, SkillLevelData } from '$lib/types';
	import { ChevronDown, Swords, Shield, X } from 'lucide-svelte';
	import { gqlRequest } from '$lib/api/graphql';
	import { HERO_SKILLS_QUERY } from '$lib/api/queries';
	import SearchSelect from '$lib/components/SearchSelect.svelte';

	import { SvelteSet } from 'svelte/reactivity';
	import { computeDamage } from '$lib/calc/formulas';
	import type { StatBlock } from '$lib/types/stats';
	import {
		applyPassiveAmp,
		computeStackingFlatDamage,
		getSkillAreas,
		computeMultiAreaDamage
	} from '$lib/calc/apply-modifiers';

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
		level: number
	): string {
		if (!levelData || levelData.length === 0) return colorizeKeywords(highlightNumbers(text));
		const targetLevel = levelData.find((l) => l.level === level) ?? levelData[0];
		if (!targetLevel) return colorizeKeywords(highlightNumbers(text));
		const replaced = text.replace(/\{\{(\w+)\}\}/g, (_match, attrName: string) => {
			const normalized = attrName.toLowerCase().replace(/_/g, ' ');
			const entry = targetLevel.attributes.find(
				(a) => a.label.toLowerCase().replace(/_/g, ' ') === normalized
			);
			return entry ? colorizeValue(entry.value, entry.label) : `{{${attrName}}}`;
		});
		return colorizeKeywords(highlightNumbers(replaced));
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
		stat: 'physicalAttack' | 'magicPower' | 'hp';
		ratio: number;
	}[] {
		if (!description) return [];
		const scalings: {
			type: 'total' | 'extra';
			stat: 'physicalAttack' | 'magicPower' | 'hp';
			ratio: number;
		}[] = [];

		// Match Physical Attack or Magic Power: e.g. (+120% Total Physical Attack) or (+150% Magic Power)
		const pattern1 = /\+\s*(\d+)%\s*(Total|Extra)?\s*(Physical Attack|Magic Power)/gi;
		let match: RegExpExecArray | null;
		while ((match = pattern1.exec(description)) !== null) {
			const ratio = Number(match[1]) / 100;
			const type = (match[2] ?? 'Total').toLowerCase() === 'extra' ? 'extra' : 'total';
			const stat: 'physicalAttack' | 'magicPower' = match[3].toLowerCase().includes('magic')
				? 'magicPower'
				: 'physicalAttack';
			scalings.push({ type, stat, ratio });
		}

		// Match HP scaling: e.g. (+6% Total HP) or +6% Total HP or +6% Max HP or +6% HP
		const pattern2 = /\+\s*(\d+)%\s*(Total|Extra|Max)?\s*HP/gi;
		while ((match = pattern2.exec(description)) !== null) {
			const ratio = Number(match[1]) / 100;
			const type = (match[2] ?? 'Total').toLowerCase() === 'extra' ? 'extra' : 'total';
			scalings.push({ type, stat: 'hp', ratio });
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
		// Aldous: Skill 1 enhanced basic attack with Soul Steal stacks
		const mod = loadout.heroMod;
		if (
			mod?.passive?.type === 'stacking-flat-damage' &&
			skill.name.toLowerCase().includes(mod.passive.skillName.split(':')[0].trim())
		) {
			const raw = computeStackingFlatDamage(
				mod.passive,
				loadout.modifierState.passiveStacks,
				attackerStats
			);
			return computeDamage({
				rawDamage: raw,
				damageType: 'physical',
				attacker: attackerStats,
				target: targetStats
			});
		}

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

		// Cecilion: All skill damage scales with Max Mana (passive stacks add mana)
		if (mod?.passive?.type === 'mana-stacking') {
			raw += attackerStats.mana * 0.05;
		}

		if (raw === 0) return 0;

		const hits = parseHitCount(skill.description);

		const dmgPerHit = computeDamage({
			rawDamage: raw,
			damageType: skill.damageType === 'none' ? 'physical' : skill.damageType,
			attacker: attackerStats,
			target: targetStats
		});

		const totalDmg = dmgPerHit * hits;
		return applyPassiveAmp(totalDmg, loadout.heroMod, loadout.modifierState);
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
		skillLevels = {};
		loadout.modifierState = { passiveStacks: 0 };
		enrichHeroSkills(hero, false);
	}

	function selectTargetHero(hero: Hero) {
		targetLoadout.hero = hero;
		targetLoadout.modifierState = { passiveStacks: 0 };
		enrichHeroSkills(hero, true);
	}

	let dragItem = $state<Item | null>(null);
	let dragTargetItem = $state<Item | null>(null);
	let dragSlotIndex = $state<number | null>(null);
	let dragTargetSlotIndex = $state<number | null>(null);
	let searchQuery = $state('');
	let targetSearchQuery = $state('');
	let categoryFilter = $state<ItemCategory | null>(null);
	let targetCategoryFilter = $state<ItemCategory | null>(null);

	const sortedHeroes = $derived([...data.heroes].sort((a, b) => a.name.localeCompare(b.name)));

	const heroSelectItems = $derived(
		sortedHeroes.map((h) => ({ id: h.id, label: h.name, imageUrl: h.avatarUrl }))
	);
	const selectedHeroItem = $derived(
		loadout.hero
			? { id: loadout.hero.id, label: loadout.hero.name, imageUrl: loadout.hero.avatarUrl }
			: null
	);
	const selectedTargetHeroItem = $derived(
		targetLoadout.hero
			? {
					id: targetLoadout.hero.id,
					label: targetLoadout.hero.name,
					imageUrl: targetLoadout.hero.avatarUrl
				}
			: null
	);

	function onHeroSelect(item: { id: string; label: string; imageUrl?: string } | null) {
		if (!item) {
			loadout.hero = null;
			return;
		}
		const hero = data.heroes.find((h) => h.id === item.id);
		if (hero) selectHero(hero);
	}

	function onTargetHeroSelect(item: { id: string; label: string; imageUrl?: string } | null) {
		if (!item) {
			targetLoadout.hero = null;
			return;
		}
		const hero = data.heroes.find((h) => h.id === item.id);
		if (hero) selectTargetHero(hero);
	}

	function emblemSelectItems(emblems: Emblem[]) {
		return emblems.map((e) => ({ id: e.slug, label: e.name, imageUrl: e.icon || undefined }));
	}

	const filteredItems = $derived(
		data.items
			.filter((i) => {
				if (i.tier === 'ETC') return false;
				if (categoryFilter && i.category !== categoryFilter) return false;
				if (searchQuery.trim() && !i.name.toLowerCase().includes(searchQuery.toLowerCase()))
					return false;
				return true;
			})
			.sort((a, b) => a.cost - b.cost)
	);

	const etcItems = $derived(
		data.items
			.filter((i) => {
				if (i.tier !== 'ETC') return false;
				if (searchQuery.trim() && !i.name.toLowerCase().includes(searchQuery.toLowerCase()))
					return false;
				return true;
			})
			.sort((a, b) => a.cost - b.cost)
	);

	const filteredTargetItems = $derived(
		data.items
			.filter((i) => {
				if (i.tier === 'ETC') return false;
				if (targetCategoryFilter && i.category !== targetCategoryFilter) return false;
				if (
					targetSearchQuery.trim() &&
					!i.name.toLowerCase().includes(targetSearchQuery.toLowerCase())
				)
					return false;
				return true;
			})
			.sort((a, b) => a.cost - b.cost)
	);

	const targetEtcItems = $derived(
		data.items
			.filter((i) => {
				if (i.tier !== 'ETC') return false;
				if (
					targetSearchQuery.trim() &&
					!i.name.toLowerCase().includes(targetSearchQuery.toLowerCase())
				)
					return false;
				return true;
			})
			.sort((a, b) => a.cost - b.cost)
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
		dragSlotIndex = null;
	}

	function onSlotDragStart(index: number) {
		dragSlotIndex = index;
		dragItem = null;
	}

	function onTargetDragStart(item: Item) {
		dragTargetItem = item;
		dragTargetSlotIndex = null;
	}

	function onTargetSlotDragStart(index: number) {
		dragTargetSlotIndex = index;
		dragTargetItem = null;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDropSlot(e: DragEvent, targetIndex: number) {
		e.preventDefault();
		if (dragSlotIndex !== null) {
			loadout.moveItem(dragSlotIndex, targetIndex);
			dragSlotIndex = null;
		} else if (dragItem) {
			loadout.addItem(dragItem);
			dragItem = null;
		}
	}

	function onTargetDropSlot(e: DragEvent, targetIndex: number) {
		e.preventDefault();
		if (dragTargetSlotIndex !== null) {
			targetLoadout.moveItem(dragTargetSlotIndex, targetIndex);
			dragTargetSlotIndex = null;
		} else if (dragTargetItem) {
			targetLoadout.addItem(dragTargetItem);
			dragTargetItem = null;
		}
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
	const targetHeroStats = $derived(targetLoadout.heroStats);
	const targetEmblemStatsData = $derived(targetLoadout.emblemStats);

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
		const bv = loadout.baseBonus[key];
		if (bv) sources.push({ source: 'Base Bonus', value: bv });
		const iv = mainItemStats[key];
		if (iv) sources.push({ source: 'Items', value: iv });
		const ev = emblemStatsData[key];
		if (ev) sources.push({ source: 'Emblem', value: ev });
		return sources;
	}

	function getTargetStatBreakdown(key: StatKey): { source: string; value: number }[] {
		const sources: { source: string; value: number }[] = [];
		const hv = targetHeroStats[key];
		if (hv) sources.push({ source: 'Hero', value: hv });
		const bv = targetLoadout.baseBonus[key];
		if (bv) sources.push({ source: 'Base Bonus', value: bv });
		const iv = targetItemStats[key];
		if (iv) sources.push({ source: 'Items', value: iv });
		const ev = targetEmblemStatsData[key];
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

	const targetOffenseStats = $derived<StatRow[]>([
		{
			label: 'Physical ATK',
			value: targetStats.physicalAttack,
			color: '#ffb86b',
			key: 'physicalAttack'
		},
		{ label: 'Magic Power', value: targetStats.magicPower, color: '#89e0eb', key: 'magicPower' },
		{
			label: 'ATK SPD',
			value: targetStats.attackSpeedPct * 100,
			color: '#ffb86b',
			suffix: '%',
			key: 'attackSpeedPct',
			isPct: true
		},
		{
			label: 'Crit Chance',
			value: targetStats.critChancePct * 100,
			color: '#f4f7ff',
			suffix: '%',
			key: 'critChancePct',
			isPct: true
		},
		{
			label: 'Lifesteal',
			value: targetStats.lifestealPct * 100,
			color: '#ff7a7c',
			suffix: '%',
			key: 'lifestealPct',
			isPct: true
		},
		{
			label: 'Spell Vamp',
			value: targetStats.spellVampPct * 100,
			color: '#a78bfa',
			suffix: '%',
			key: 'spellVampPct',
			isPct: true
		},
		{
			label: 'Phys PEN',
			value: targetStats.physicalPenFlat,
			color: '#e07a5f',
			key: 'physicalPenFlat'
		},
		{
			label: 'Phys PEN %',
			value: targetStats.physicalPenPct * 100,
			color: '#e07a5f',
			suffix: '%',
			key: 'physicalPenPct',
			isPct: true
		},
		{ label: 'Magic PEN', value: targetStats.magicPenFlat, color: '#7b68ee', key: 'magicPenFlat' },
		{
			label: 'Magic PEN %',
			value: targetStats.magicPenPct * 100,
			color: '#7b68ee',
			suffix: '%',
			key: 'magicPenPct',
			isPct: true
		}
	]);

	const targetDefenseStats = $derived<StatRow[]>([
		{ label: 'HP', value: targetStats.hp, color: '#5fb38a', key: 'hp' },
		{ label: 'Mana', value: targetStats.mana, color: '#5aa6c4', key: 'mana' },
		{
			label: 'Phys DEF',
			value: targetStats.physicalDefense,
			color: '#c2724a',
			key: 'physicalDefense'
		},
		{ label: 'Magic DEF', value: targetStats.magicDefense, color: '#b25c8f', key: 'magicDefense' },
		{ label: 'Move SPD', value: targetStats.movementSpeed, color: '#c9a24a', key: 'movementSpeed' }
	]);

	function selectMainEmblem(slug: string) {
		loadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectPrimaryTalent(slug: string) {
		loadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTier1Talent(slug: string) {
		loadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTier2Talent(slug: string) {
		loadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTargetMainEmblem(slug: string) {
		targetLoadout.mainEmblem = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTargetPrimaryTalent(slug: string) {
		targetLoadout.primaryTalent = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTargetTier1Talent(slug: string) {
		targetLoadout.tier1Talent = data.emblems.find((e) => e.slug === slug) ?? null;
	}

	function selectTargetTier2Talent(slug: string) {
		targetLoadout.tier2Talent = data.emblems.find((e) => e.slug === slug) ?? null;
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
	}
</script>

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
			<div>
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="mt-1">
					<SearchSelect
						items={heroSelectItems}
						value={selectedHeroItem}
						placeholder="Select hero"
						onchange={onHeroSelect}
					/>
				</div>
			</div>

			{#if loadout.hero}
				<p class="flex items-center gap-2 text-sm" style="color:{roleColor(loadout.hero.role)}">
					<span
						class="inline-block h-2 w-2 rounded-full"
						style="background:{roleColor(loadout.hero.role)}"
					></span>
					{titleCase(loadout.hero.role)}
				</p>
			{/if}

			<div class="flex items-center gap-2">
				<input
					id="main-hero-skin"
					type="checkbox"
					bind:checked={loadout.hasSkin}
					disabled={!loadout.hero}
					class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<label
					for="main-hero-skin"
					class="cursor-pointer text-xs font-bold tracking-wide text-ink-faint uppercase select-none"
					class:opacity-50={!loadout.hero}
				>
					Skin
				</label>
			</div>

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

			{#if loadout.heroMod?.passive}
				{@const passive = loadout.heroMod.passive}
				{@const passiveSkill = loadout.hero?.skills.find((s) => s.skillType === 'passive')}
				{@const relatedSkill =
					passive.type === 'stacking-flat-damage'
						? loadout.hero?.skills.find((s) =>
								s.name.toLowerCase().includes(passive.skillName.split(':')[0].trim())
							)
						: null}
				{@const modIcon = relatedSkill?.imageUrl ?? passiveSkill?.imageUrl}
				<div class="rounded-lg border border-accent/30 bg-accent/5 p-3">
					<div class="flex items-start gap-2.5">
						{#if modIcon}
							<span class="size-10 shrink-0 overflow-hidden rounded-lg bg-surface-3">
								<img src={modIcon} alt={passive.label} class="h-full w-full object-cover" />
							</span>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<span class="text-xs font-semibold text-ink">{passive.label}</span>
								{#if passive.type === 'stacking-buff'}
									<span class="font-mono-stat text-xs text-accent"
										>+{round(loadout.modifierState.passiveStacks * passive.perStack * 100)}%</span
									>
								{:else if passive.type === 'stacking-flat-damage'}
									<span class="font-mono-stat text-xs text-amber-400"
										>+{round(loadout.modifierState.passiveStacks * passive.perStack)} dmg</span
									>
								{:else if passive.type === 'mana-stacking'}
									<span class="font-mono-stat text-xs text-blue-400"
										>+{round(loadout.modifierState.passiveStacks * passive.manaPerStack)} mana</span
									>
								{/if}
							</div>
							{#if passive.type === 'stacking-buff'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap dash menambah damage output {passive.perStack * 100}% selama {passive.duration}
									detik.
								</p>
							{:else if passive.type === 'stacking-flat-damage'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap stack menambah +{passive.perStack} Physical Damage pada Skill 1.
								</p>
							{:else if passive.type === 'mana-stacking'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap hit skill menambah +{passive.manaPerStack} Max Mana. Damage skill berskala dengan
									Max Mana.
								</p>
							{/if}
						</div>
					</div>
					{#if passive.type === 'stacking-buff'}
						<input
							type="range"
							min="0"
							max={passive.maxStacks}
							bind:value={loadout.modifierState.passiveStacks}
							class="mt-2 w-full accent-accent"
						/>
						<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
							{#each Array.from({ length: passive.maxStacks + 1 }, (_, i) => i) as s (s)}
								<span>{s}</span>
							{/each}
						</div>
					{:else}
						<div class="mt-2 flex items-center gap-2">
							<input
								type="number"
								min="0"
								max={passive.maxStacks}
								bind:value={loadout.modifierState.passiveStacks}
								class="w-full rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-ink tabular-nums placeholder:text-ink-faint focus:border-accent focus:outline-none"
								placeholder="0"
							/>
							<span class="shrink-0 text-[10px] text-ink-faint"
								>/ {passive.maxStacks.toLocaleString()}</span
							>
						</div>
					{/if}
				</div>
			{/if}

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'main', label: 'Main Emblem', items: mainEmblems }, { key: 'primary', label: 'Primary Talent', items: primaryTalents }, { key: 's1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 's2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<SearchSelect
							items={emblemSelectItems(group.items)}
							value={selected
								? { id: selected.slug, label: selected.name, imageUrl: selected.icon || undefined }
								: null}
							placeholder={group.label + '…'}
							onchange={(item) => handleEmblemSelect(item?.id ?? '', group.key)}
						/>
					{/each}
				</div>
			</div>

			<div>
				<div class="flex items-center justify-between">
					<span class="text-xs tracking-wide text-ink-faint uppercase"
						>Items ({loadout.items.length}/6)</span
					>
					<span class="font-mono-stat text-xs text-accent"
						>{loadout.totalCost.toLocaleString()} gold</span
					>
				</div>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2, 3, 4, 5] as i (i)}
						{@const item = loadout.items[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
							class:border-accent-40={item}
							class:border-line={!item}
							class:bg-surface-3={item}
							role="listitem"
							draggable={item ? 'true' : 'false'}
							ondragstart={() => item && onSlotDragStart(i)}
							ondragover={onDragOver}
							ondrop={(e) => onDropSlot(e, i)}
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
				<div class="max-h-52 overflow-y-auto">
					<div class="grid grid-cols-3 gap-1.5">
						{#each filteredItems as item (item.id)}
							<button
								type="button"
								draggable="true"
								ondragstart={() => onDragStart(item)}
								onclick={() => loadout.addItem(item)}
								class="flex flex-col items-center gap-1 rounded-lg border border-line bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-accent/40 hover:bg-surface-2"
							>
								<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
									{#if item.imageUrl}
										<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
									{/if}
								</span>
								<span class="w-full truncate text-ink">{item.name}</span>
							</button>
						{/each}
					</div>
				</div>
				{#if etcItems.length > 0}
					<div class="mt-3 border-t border-line pt-3">
						<span class="text-xs tracking-wide text-ink-faint uppercase">Optional (ETC)</span>
						<div class="mt-2 max-h-36 overflow-y-auto">
							<div class="grid grid-cols-3 gap-1.5">
								{#each etcItems as item (item.id)}
									<button
										type="button"
										draggable="true"
										ondragstart={() => onDragStart(item)}
										onclick={() => loadout.addEtcItem(item)}
										class="flex flex-col items-center gap-1 rounded-lg border border-amber-400/40 bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-amber-400 hover:bg-surface-2"
									>
										<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
											{#if item.imageUrl}
												<img
													src={item.imageUrl}
													alt={item.name}
													class="h-full w-full object-cover"
												/>
											{/if}
										</span>
										<span class="w-full truncate text-ink">{item.name}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- MIDDLE WIDGET: Stats Display -->
		<section
			class="flex flex-col items-center justify-start rounded-2xl border border-line bg-surface/60 p-6"
		>
			<div class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
				<div class="flex flex-col items-center">
					<div
						class="mb-3 size-24 overflow-hidden rounded-full border-2 border-accent/40 bg-accent/10"
					>
						{#if loadout.hero?.avatarUrl}
							<img
								src={loadout.hero.avatarUrl}
								alt={loadout.hero.name}
								class="h-full w-full object-cover"
							/>
						{/if}
					</div>
					<h2 class="font-display text-lg font-bold text-ink">
						{loadout.hero?.name ?? 'Pilih Hero'}
					</h2>
					<p class="text-xs text-ink-muted">Level {loadout.level}</p>
				</div>

				<div class="flex flex-col items-center">
					<div
						class="mb-3 size-24 overflow-hidden rounded-full border-2 border-red-400/40 bg-red-400/10"
					>
						{#if targetLoadout.hero?.avatarUrl}
							<img
								src={targetLoadout.hero.avatarUrl}
								alt={targetLoadout.hero.name}
								class="h-full w-full object-cover"
							/>
						{/if}
					</div>
					<h2 class="font-display text-lg font-bold text-ink">
						{targetLoadout.hero?.name ?? 'Pilih Target'}
					</h2>
					<p class="text-xs text-ink-muted">Level {targetLoadout.level}</p>
				</div>
			</div>

			<div class="mt-6 w-full">
				<div class="mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
					<Swords class="size-3.5" /> Offense
				</div>
				<div class="space-y-1">
					{#each offenseStats as row, i (row.label)}
						{@const targetRow = targetOffenseStats[i]}
						<div class="relative">
							<button
								type="button"
								onclick={() => toggleBreakdown(row.label)}
								class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
							>
								<span class="font-mono-stat text-left text-ink tabular-nums"
									>{round(row.value)}{row.suffix ?? ''}</span
								>
								<span class="text-center text-ink-muted">{row.label}</span>
								<span class="font-mono-stat text-right text-ink tabular-nums"
									>{round(targetRow.value)}{targetRow.suffix ?? ''}</span
								>
							</button>
							{#if openBreakdown === row.label}
								<div
									class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
								>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<span class="text-[10px] font-semibold text-ink-faint">Hero</span>
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
										<div>
											<span class="text-[10px] font-semibold text-ink-faint">Target</span>
											{#each getTargetStatBreakdown(row.key) as src (src.source)}
												<div class="flex justify-between text-[11px]">
													<span class="text-ink-faint">{src.source}</span>
													<span class="font-mono-stat text-ink tabular-nums"
														>{row.isPct ? round(src.value * 100) + '%' : round(src.value)}</span
													>
												</div>
											{/each}
											{#if getTargetStatBreakdown(row.key).length === 0}
												<span class="text-[11px] text-ink-faint">No sources</span>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-4 mb-2 flex items-center gap-1 text-xs font-semibold text-ink-faint">
					<Shield class="size-3.5" /> Defense
				</div>
				<div class="space-y-1">
					{#each defenseStats as row, i (row.label)}
						{@const targetRow = targetDefenseStats[i]}
						<div class="relative">
							<button
								type="button"
								onclick={() => toggleBreakdown(row.label)}
								class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-surface-2/50"
							>
								<span class="font-mono-stat text-left text-ink tabular-nums"
									>{round(row.value)}{row.suffix ?? ''}</span
								>
								<span class="text-center text-ink-muted">{row.label}</span>
								<span class="font-mono-stat text-right text-ink tabular-nums"
									>{round(targetRow.value)}{targetRow.suffix ?? ''}</span
								>
							</button>
							{#if openBreakdown === row.label}
								<div
									class="absolute left-0 z-30 mt-0.5 w-full rounded-lg border border-line bg-bg p-2 shadow-lg"
								>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<span class="text-[10px] font-semibold text-ink-faint">Hero</span>
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
										<div>
											<span class="text-[10px] font-semibold text-ink-faint">Target</span>
											{#each getTargetStatBreakdown(row.key) as src (src.source)}
												<div class="flex justify-between text-[11px]">
													<span class="text-ink-faint">{src.source}</span>
													<span class="font-mono-stat text-ink tabular-nums"
														>{row.isPct ? round(src.value * 100) + '%' : round(src.value)}</span
													>
												</div>
											{/each}
											{#if getTargetStatBreakdown(row.key).length === 0}
												<span class="text-[11px] text-ink-faint">No sources</span>
											{/if}
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="mt-6 w-full space-y-1 border-t border-line pt-4">
				<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-sm">
					<div>
						<p class="font-mono-stat text-ink">{round(loadout.basicAttackDamage)}</p>
					</div>
					<p class="text-xs text-ink-muted">Damage Basic Attack</p>
					<div>
						<p class="font-mono-stat text-ink">—</p>
					</div>
				</div>
				<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-sm">
					<div>
						<p class="font-mono-stat text-ink">{round(loadout.basicAttackCritDamage)}</p>
					</div>
					<p class="text-xs text-ink-muted">Damage Basic Attack ketika Crit</p>
					<div>
						<p class="font-mono-stat text-ink">—</p>
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
							{@const skillAreas = getSkillAreas(loadout.heroMod, skill.name)}
							{@const baseDmg = calculateSkillDamage(skill, currentLevel, stats, targetStats)}
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
												{#if !skillAreas}
													<span class="font-mono-stat shrink-0 text-xs text-accent"
														>{round(baseDmg)}</span
													>
												{/if}
											</div>
										</div>
										{#if skillAreas}
											<div class="mt-1.5 flex items-center gap-2">
												{#each computeMultiAreaDamage(baseDmg, skillAreas) as area (area.label)}
													<div
														class="rounded border border-accent/20 bg-accent/5 px-2 py-0.5 text-center"
													>
														<span class="block text-[9px] text-ink-faint">{area.label}</span>
														<span class="font-mono-stat text-xs text-accent"
															>{round(area.damage)}</span
														>
													</div>
												{/each}
												<span class="text-[9px] text-ink-faint italic"
													>*berlaku untuk satu musuh</span
												>
											</div>
										{/if}
										{#if skill.description}
											<p class="mt-1 text-xs leading-relaxed text-ink-muted">
												<!-- eslint-disable-next-line svelte/no-at-html-tags -->
												{@html replaceAttributePlaceholders(
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

			<div>
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Hero</span
				>
				<div class="mt-1">
					<SearchSelect
						items={heroSelectItems}
						value={selectedTargetHeroItem}
						placeholder="Select target"
						onchange={onTargetHeroSelect}
					/>
				</div>
			</div>

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

			<div class="flex items-center gap-2">
				<input
					id="target-hero-skin"
					type="checkbox"
					bind:checked={targetLoadout.hasSkin}
					disabled={!targetLoadout.hero}
					class="size-4 cursor-pointer rounded border-line bg-surface-3 text-accent accent-accent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<label
					for="target-hero-skin"
					class="cursor-pointer text-xs font-bold tracking-wide text-ink-faint uppercase select-none"
					class:opacity-50={!targetLoadout.hero}
				>
					Skin
				</label>
			</div>

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

			{#if targetLoadout.heroMod?.passive}
				{@const passive = targetLoadout.heroMod.passive}
				{@const passiveSkill = targetLoadout.hero?.skills.find((s) => s.skillType === 'passive')}
				{@const relatedSkill =
					passive.type === 'stacking-flat-damage'
						? targetLoadout.hero?.skills.find((s) =>
								s.name.toLowerCase().includes(passive.skillName.split(':')[0].trim())
							)
						: null}
				{@const modIcon = relatedSkill?.imageUrl ?? passiveSkill?.imageUrl}
				<div class="rounded-lg border border-accent/30 bg-accent/5 p-3">
					<div class="flex items-start gap-2.5">
						{#if modIcon}
							<span class="size-10 shrink-0 overflow-hidden rounded-lg bg-surface-3">
								<img src={modIcon} alt={passive.label} class="h-full w-full object-cover" />
							</span>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<span class="text-xs font-semibold text-ink">{passive.label}</span>
								{#if passive.type === 'stacking-buff'}
									<span class="font-mono-stat text-xs text-accent"
										>+{round(
											targetLoadout.modifierState.passiveStacks * passive.perStack * 100
										)}%</span
									>
								{:else if passive.type === 'stacking-flat-damage'}
									<span class="font-mono-stat text-xs text-amber-400"
										>+{round(targetLoadout.modifierState.passiveStacks * passive.perStack)} dmg</span
									>
								{:else if passive.type === 'mana-stacking'}
									<span class="font-mono-stat text-xs text-blue-400"
										>+{round(targetLoadout.modifierState.passiveStacks * passive.manaPerStack)} mana</span
									>
								{/if}
							</div>
							{#if passive.type === 'stacking-buff'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap dash menambah damage output {passive.perStack * 100}% selama {passive.duration}
									detik.
								</p>
							{:else if passive.type === 'stacking-flat-damage'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap stack menambah +{passive.perStack} Physical Damage pada Skill 1.
								</p>
							{:else if passive.type === 'mana-stacking'}
								<p class="mt-0.5 text-[10px] leading-relaxed text-ink-muted">
									Setiap hit skill menambah +{passive.manaPerStack} Max Mana. Damage skill berskala dengan
									Max Mana.
								</p>
							{/if}
						</div>
					</div>
					{#if passive.type === 'stacking-buff'}
						<input
							type="range"
							min="0"
							max={passive.maxStacks}
							bind:value={targetLoadout.modifierState.passiveStacks}
							class="mt-2 w-full accent-accent"
						/>
						<div class="mt-1 flex justify-between text-[10px] text-ink-faint">
							{#each Array.from({ length: passive.maxStacks + 1 }, (_, i) => i) as s (s)}
								<span>{s}</span>
							{/each}
						</div>
					{:else}
						<div class="mt-2 flex items-center gap-2">
							<input
								type="number"
								min="0"
								max={passive.maxStacks}
								bind:value={targetLoadout.modifierState.passiveStacks}
								class="w-full rounded-lg border border-line bg-bg px-3 py-1.5 text-sm text-ink tabular-nums placeholder:text-ink-faint focus:border-accent focus:outline-none"
								placeholder="0"
							/>
							<span class="shrink-0 text-[10px] text-ink-faint"
								>/ {passive.maxStacks.toLocaleString()}</span
							>
						</div>
					{/if}
				</div>
			{/if}

			<div class="border-t border-line pt-4">
				<span class="font-display text-xs font-bold tracking-wide text-ink-faint uppercase"
					>Emblem Set</span
				>
				<div class="mt-2 space-y-2">
					{#each [{ key: 'tmain', label: 'Main Emblem', items: mainEmblems }, { key: 'tprimary', label: 'Primary Talent', items: primaryTalents }, { key: 'ts1', label: 'Tier 1 Talent', items: commonTalentsS1 }, { key: 'ts2', label: 'Tier 2 Talent', items: commonTalentsS2 }] as group (group.key)}
						{@const selected = group.items.find(
							(e) => e.slug === getSelectedEmblem(group.key)?.slug
						)}
						<SearchSelect
							items={emblemSelectItems(group.items)}
							value={selected
								? { id: selected.slug, label: selected.name, imageUrl: selected.icon || undefined }
								: null}
							placeholder={group.label + '…'}
							onchange={(item) => handleEmblemSelect(item?.id ?? '', group.key)}
						/>
					{/each}
				</div>
			</div>

			<div class="border-t border-line pt-4">
				<div class="flex items-center justify-between">
					<span class="text-xs tracking-wide text-ink-faint uppercase"
						>Items ({targetLoadout.items.length}/6)</span
					>
					<span class="font-mono-stat text-xs text-accent"
						>{targetLoadout.totalCost.toLocaleString()} gold</span
					>
				</div>
				<div class="mt-2 grid grid-cols-3 gap-1.5" role="list">
					{#each [0, 1, 2, 3, 4, 5] as i (i)}
						{@const item = targetLoadout.items[i]}
						<div
							class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition"
							class:border-accent-40={item}
							class:border-line={!item}
							class:bg-surface-3={item}
							role="listitem"
							draggable={item ? 'true' : 'false'}
							ondragstart={() => item && onTargetSlotDragStart(i)}
							ondragover={onDragOver}
							ondrop={(e) => onTargetDropSlot(e, i)}
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
				<div class="max-h-52 overflow-y-auto">
					<div class="grid grid-cols-3 gap-1.5">
						{#each filteredTargetItems as item (item.id)}
							<button
								type="button"
								draggable="true"
								ondragstart={() => onTargetDragStart(item)}
								onclick={() => targetLoadout.addItem(item)}
								class="flex flex-col items-center gap-1 rounded-lg border border-line bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-accent/40 hover:bg-surface-2"
							>
								<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
									{#if item.imageUrl}
										<img src={item.imageUrl} alt={item.name} class="h-full w-full object-cover" />
									{/if}
								</span>
								<span class="w-full truncate text-ink">{item.name}</span>
							</button>
						{/each}
					</div>
				</div>
				{#if targetEtcItems.length > 0}
					<div class="mt-3 border-t border-line pt-3">
						<span class="text-xs tracking-wide text-ink-faint uppercase">Optional (ETC)</span>
						<div class="mt-2 max-h-36 overflow-y-auto">
							<div class="grid grid-cols-3 gap-1.5">
								{#each targetEtcItems as item (item.id)}
									<button
										type="button"
										draggable="true"
										ondragstart={() => onTargetDragStart(item)}
										onclick={() => targetLoadout.addEtcItem(item)}
										class="flex flex-col items-center gap-1 rounded-lg border border-amber-400/40 bg-bg/50 p-1.5 text-center text-[10px] transition hover:border-amber-400 hover:bg-surface-2"
									>
										<span class="size-10 shrink-0 overflow-hidden rounded bg-surface-3">
											{#if item.imageUrl}
												<img
													src={item.imageUrl}
													alt={item.name}
													class="h-full w-full object-cover"
												/>
											{/if}
										</span>
										<span class="w-full truncate text-ink">{item.name}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}
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
