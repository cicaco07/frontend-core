import { emptyStatBlock, type Hero, type HeroRole, type StatBlock } from '$lib/types';
import type { Emblem, Item, ItemCategory } from '$lib/types/equipment';

type BackendBaseStat = Partial<Record<string, number>>;

export interface BackendHero {
	_id: string;
	name: string;
	alias: string;
	avatar: string;
	image: string;
	role: string[];
	type: string[];
	difficulty: number;
	short_description: string;
	base_stats?: BackendBaseStat[] | null;
	skills?: BackendSkill[] | null;
}

interface BackendSkill {
	_id: string;
	name: string;
	type: string;
	tag: string[];
	lite_description: string;
	full_description: string;
	attack_effect?: number | null;
	skills_detail?: Array<{ attributes?: unknown; level?: number | null }> | null;
}

export interface BackendItem {
	_id: string;
	name: string;
	type: string;
	tag?: string | null;
	price: number;
	image: string;
	attributes: string[];
	description?: string[] | null;
	story?: string | null;
	tips?: string | null;
}

export interface BackendEmblem {
	_id: string;
	name: string;
	type: string;
	icon: string;
	description?: string | null;
	benefit?: string | null;
	cooldown?: string | null;
	attributes?: unknown;
}

const ROLES = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'] as const;
const CATEGORIES = ['attack', 'magic', 'defense', 'movement', 'jungle', 'roam'] as const;

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function normalizeRole(role: string[] | string | undefined): HeroRole {
	const raw = Array.isArray(role) ? role[0] : role;
	const normalized = raw?.toLowerCase();
	return ROLES.find((item) => item === normalized) ?? 'fighter';
}

function normalizeCategory(type: string | undefined, tag?: string | null): ItemCategory {
	const raw = `${type ?? ''} ${tag ?? ''}`.toLowerCase();
	return CATEGORIES.find((category) => raw.includes(category)) ?? 'attack';
}

export function mapBaseStat(input?: BackendBaseStat | null): StatBlock {
	const stats = emptyStatBlock();
	if (!input) return stats;

	stats.hp = input.hp ?? 0;
	stats.hpRegen = input.hp_regen ?? 0;
	stats.mana = input.mana ?? 0;
	stats.manaRegen = input.mana_regen ?? 0;
	stats.physicalAttack = input.physical_attack ?? 0;
	stats.magicPower = input.magic_power ?? 0;
	stats.physicalDefense = input.physical_defense ?? 0;
	stats.magicDefense = input.magic_defense ?? 0;
	stats.movementSpeed = input.movement_speed ?? 0;
	stats.attackSpeedPct = (input.attack_speed_ratio ?? input.attack_speed ?? 0) / 100;
	stats.spellVampPct = (input.spell_vamp_ratio ?? 0) / 100;
	return stats;
}

const STAT_PATTERNS: Array<[keyof StatBlock, RegExp, boolean]> = [
	['physicalAttack', /physical\s+attack|\bpa\b/i, false],
	['magicPower', /magic\s+power|\bmp\b/i, false],
	['physicalDefense', /physical\s+defen[sc]e|armor/i, false],
	['magicDefense', /magic\s+defen[sc]e|magic\s+resist/i, false],
	['hp', /\bhp\b/i, false],
	['mana', /\bmana\b/i, false],
	['movementSpeed', /movement\s+speed/i, false],
	['attackSpeedPct', /attack\s+speed/i, true],
	['critChancePct', /crit(?:ical)?\s+chance/i, true],
	['critDamagePct', /crit(?:ical)?\s+damage/i, true],
	['cooldownReductionPct', /cooldown|\bcdr\b/i, true],
	['lifestealPct', /lifesteal/i, true],
	['spellVampPct', /spell\s+vamp/i, true],
	['physicalPenFlat', /physical\s+pen/i, false],
	['magicPenFlat', /magic\s+pen/i, false]
];

export function parseStatStrings(attributes: string[] = []): Partial<StatBlock> {
	const stats: Partial<StatBlock> = {};
	for (const attribute of attributes) {
		const valueMatch = attribute.match(/[-+]?\d+(?:\.\d+)?/);
		if (!valueMatch) continue;
		const numeric = Number(valueMatch[0]);
		const pattern = STAT_PATTERNS.find(([, regex]) => regex.test(attribute));
		if (!pattern || Number.isNaN(numeric)) continue;
		const [key, , pct] = pattern;
		stats[key] = pct || attribute.includes('%') ? numeric / 100 : numeric;
	}
	return stats;
}

export function mapHero(hero: BackendHero): Hero {
	const base = hero.base_stats?.[0] ?? null;
	return {
		id: hero._id,
		slug: slugify(hero.alias || hero.name),
		name: hero.name,
		role: normalizeRole(hero.role),
		imageUrl: hero.avatar || hero.image,
		baseStats: mapBaseStat(base),
		statsPerLevel: {},
		skills: (hero.skills ?? []).map((skill) => ({
			id: skill._id,
			name: skill.name,
			damageType: skill.type.toLowerCase().includes('magic') ? 'magic' : 'physical',
			baseDamage: [skill.attack_effect ?? 0],
			scaling: [],
			skillType: skill.tag?.includes('ultimate') ? 'ultimate' : undefined,
			description: skill.full_description || skill.lite_description
		})),
		title: hero.alias,
		lore: hero.short_description,
		specialities: hero.type.map((value) => slugify(value)).filter(Boolean) as Hero['specialities'],
		difficulty: Math.min(3, Math.max(1, Math.round(hero.difficulty))) as Hero['difficulty']
	};
}

export function mapItem(item: BackendItem): Item {
	return {
		id: item._id,
		slug: slugify(item.name),
		name: item.name,
		category: normalizeCategory(item.type, item.tag),
		cost: item.price,
		imageUrl: item.image,
		stats: parseStatStrings(item.attributes),
		passiveName: item.story ?? item.tips ?? undefined,
		passiveDescription: item.description?.join(' ') ?? item.tips ?? undefined
	};
}

export function mapEmblem(emblem: BackendEmblem): Emblem {
	const stats =
		typeof emblem.attributes === 'object' && Array.isArray(emblem.attributes)
			? parseStatStrings(emblem.attributes)
			: {};
	return {
		id: emblem._id,
		slug: slugify(emblem.name),
		name: emblem.name,
		baseStats: stats,
		talents: [
			{
				id: `${emblem._id}-benefit`,
				name: emblem.type,
				description: emblem.benefit || emblem.description || 'No talent description available.',
				stats: {}
			}
		]
	};
}
