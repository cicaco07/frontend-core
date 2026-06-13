import { emptyStatBlock, type Hero, type HeroRole, type StatBlock } from '$lib/types';
import type { Emblem, EmblemAttribute, Item, ItemCategory, ItemTier } from '$lib/types/equipment';

export interface BackendBaseStat {
	hp?: number;
	hp_growth?: number;
	hp_regen?: number;
	hp_regen_growth?: number;
	mana?: number;
	mana_growth?: number;
	mana_regen?: number;
	mana_regen_growth?: number;
	physical_attack?: number;
	physical_attack_growth?: number;
	magic_power?: number;
	magic_power_growth?: number;
	physical_defense?: number;
	physical_defense_growth?: number;
	magic_defense?: number;
	magic_defense_growth?: number;
	movement_speed?: number;
	attack_speed?: number;
	spell_vamp_ratio?: number;
	lifesteal?: number;
	crit_rate?: number;
	crit_damage?: number;
	physical_pen?: number;
	magical_pen?: number;
}

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
	baseStat?: BackendBaseStat | null;
	skills?: BackendSkill[] | null;
}

interface BackendSkillDetail {
	_id?: string;
	level?: number | null;
	attributes?: Record<string, number> | string[];
}

interface BackendSkill {
	_id: string;
	name: string;
	type: string;
	tag: string[];
	lite_description: string;
	full_description: string;
	attack_effect?: number | null;
	skill_icon?: string | null;
	skills_detail?: BackendSkillDetail[] | null;
}

export interface BackendItem {
	_id: string;
	name: string;
	type: string;
	tag?: string | null;
	tier?: string | null;
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

const CATEGORIES = ['attack', 'magic', 'defense', 'movement', 'jungle', 'roam'] as const;
const TIERS: ItemTier[] = ['TIER_1', 'TIER_2', 'TIER_3'];

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function normalizeRole(role: string[] | string | undefined): HeroRole {
	const raw = Array.isArray(role) ? role[0] : role;
	if (!raw) return 'fighter';
	const slug = raw
		.toLowerCase()
		.trim()
		.replace(/[^a-z]/g, '');
	const ROLE_ALIASES: Record<string, HeroRole> = {
		tank: 'tank',
		fighter: 'fighter',
		warrior: 'fighter',
		assassin: 'assassin',
		mage: 'mage',
		magician: 'mage',
		marksman: 'marksman',
		marks: 'marksman',
		mm: 'marksman',
		adc: 'marksman',
		support: 'support',
		healer: 'support'
	};
	return ROLE_ALIASES[slug] ?? ROLE_ALIASES[raw.toLowerCase().trim()] ?? 'fighter';
}

function normalizeCategory(type: string | undefined, tag?: string | null): ItemCategory {
	const typeLower = (type ?? '').toLowerCase().trim();
	const tagLower = (tag ?? '').toLowerCase().trim();

	// Pertama, cek kecocokan eksak dengan type
	const exactTypeMatch = CATEGORIES.find((c) => c === typeLower);
	if (exactTypeMatch) return exactTypeMatch;

	// Kedua, cek kecocokan eksak dengan tag
	const exactTagMatch = CATEGORIES.find((c) => c === tagLower);
	if (exactTagMatch) return exactTagMatch;

	// Ketiga, cek apakah type mengandung kata kunci kategori
	const typeContainsMatch = CATEGORIES.find((c) => typeLower.includes(c));
	if (typeContainsMatch) return typeContainsMatch;

	// Keempat, cek apakah tag mengandung kata kunci kategori
	const tagContainsMatch = CATEGORIES.find((c) => tagLower.includes(c));
	if (tagContainsMatch) return tagContainsMatch;

	// Default ke 'attack' jika tidak ada kecocokan
	return 'attack';
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
	stats.attackSpeedPct = (input.attack_speed ?? 0) / 100;
	stats.spellVampPct = (input.spell_vamp_ratio ?? 0) / 100;
	stats.lifestealPct = (input.lifesteal ?? 0) / 100;
	stats.critChancePct = (input.crit_rate ?? 0) / 100;
	stats.critDamagePct = (input.crit_damage ?? 0) / 100;
	stats.physicalPenFlat = input.physical_pen ?? 0;
	stats.magicPenFlat = input.magical_pen ?? 0;
	return stats;
}

const GROWTH_FIELDS: Array<[keyof StatBlock, keyof BackendBaseStat]> = [
	['hp', 'hp_growth'],
	['hpRegen', 'hp_regen_growth'],
	['mana', 'mana_growth'],
	['manaRegen', 'mana_regen_growth'],
	['physicalAttack', 'physical_attack_growth'],
	['magicPower', 'magic_power_growth'],
	['physicalDefense', 'physical_defense_growth'],
	['magicDefense', 'magic_defense_growth']
];

export function mapBaseStatGrowth(input?: BackendBaseStat | null): Partial<StatBlock> {
	const stats: Partial<StatBlock> = {};
	if (!input) return stats;
	for (const [statKey, apiKey] of GROWTH_FIELDS) {
		const value = input[apiKey];
		if (value != null) stats[statKey] = value;
	}
	return stats;
}

const STAT_PATTERNS: Array<[keyof StatBlock, RegExp, boolean]> = [
	['physicalAttack', /physical\s+attack|\bpa\b|adaptive\s+attack/i, false],
	['magicPower', /magic\s+power|\bmp\b|adaptive\s+attack/i, false],
	['physicalDefense', /physical\s+defen[sc]e|armor|hybrid\s+defen[sc]e/i, false],
	['magicDefense', /magic\s+defen[sc]e|magic\s+resist|hybrid\s+defen[sc]e/i, false],
	['hp', /\bhp\b/i, false],
	['hpRegen', /hp\s+regen|hybrid\s+regen/i, false],
	['mana', /\bmana\b/i, false],
	['movementSpeed', /movement\s+speed/i, false],
	['attackSpeedPct', /attack\s+speed/i, true],
	['critChancePct', /crit(?:ical)?\s+chance/i, true],
	['critDamagePct', /crit(?:ical)?\s+damage/i, true],
	['cooldownReductionPct', /cooldown|\bcdr\b/i, true],
	['lifestealPct', /lifesteal/i, true],
	['spellVampPct', /spell\s+vamp/i, true],
	['physicalPenFlat', /physical\s+pen|adaptive\s+pen/i, false],
	['magicPenFlat', /magic\s+pen/i, false]
];

export function parseStatStrings(attributes: string[] = []): Partial<StatBlock> {
	const stats: Partial<StatBlock> = {};
	for (const attribute of attributes) {
		const valueMatch = attribute.match(/[-+]?\d+(?:\.\d+)?/);
		if (!valueMatch) continue;
		const numeric = Number(valueMatch[0]);
		if (Number.isNaN(numeric)) continue;

		const isPctValue = attribute.includes('%');

		if (/physical\s+pen|adaptive\s+pen/i.test(attribute)) {
			if (isPctValue) {
				stats.physicalPenPct = numeric / 100;
			} else {
				stats.physicalPenFlat = numeric;
			}
			continue;
		}
		if (/magic\s+pen/i.test(attribute)) {
			if (isPctValue) {
				stats.magicPenPct = numeric / 100;
			} else {
				stats.magicPenFlat = numeric;
			}
			continue;
		}

		const pattern = STAT_PATTERNS.find(([, regex]) => regex.test(attribute));
		if (!pattern) continue;
		const [key, , pct] = pattern;
		stats[key] = pct || isPctValue ? numeric / 100 : numeric;
	}
	return stats;
}

function parseSkillDetailAttributes(
	attrs: Record<string, number> | string[] | undefined
): { label: string; value: string }[] {
	if (!attrs) return [];
	if (Array.isArray(attrs)) {
		return attrs.map((attr) => {
			const parts = attr.split(/\s+/);
			const value = parts.pop() || '';
			const label = parts.join(' ');
			return { label, value };
		});
	}
	return Object.entries(attrs).map(([key, val]) => ({
		label: key,
		value: String(val)
	}));
}

export function mapHero(hero: BackendHero): Hero {
	return {
		id: hero._id,
		slug: slugify(hero.name),
		name: hero.name,
		role: normalizeRole(hero.type),
		lanes: Array.isArray(hero.role) ? hero.role : hero.role ? [hero.role] : [],
		imageUrl: hero.image || hero.avatar,
		avatarUrl: hero.avatar || hero.image,
		baseStats: mapBaseStat(hero.baseStat),
		statsPerLevel: mapBaseStatGrowth(hero.baseStat),
		skills: (hero.skills ?? []).map((skill) => ({
			id: skill._id,
			name: skill.name,
			damageType: skill.type.toLowerCase().includes('magic') ? 'magic' : 'physical',
			baseDamage: [skill.attack_effect ?? 0],
			scaling: [],
			skillType: skill.tag?.includes('ultimate') ? 'ultimate' : undefined,
			description: skill.full_description || skill.lite_description,
			imageUrl: skill.skill_icon || undefined,
			levelData: (skill.skills_detail ?? []).map((detail) => ({
				level: detail.level ?? 0,
				attributes: parseSkillDetailAttributes(detail.attributes)
			}))
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
		type: item.type ?? '',
		category: normalizeCategory(item.type, item.tag),
		tier: TIERS.find((t) => t === item.tier) ?? 'ETC',
		cost: item.price,
		imageUrl: item.image,
		stats: parseStatStrings(item.attributes),
		passiveName: item.story ?? item.tips ?? undefined,
		passiveDescription: item.description?.join(' ') ?? item.tips ?? undefined
	};
}

function humanize(key: string): string {
	return key
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractAttributes(raw: unknown): EmblemAttribute[] {
	const result: EmblemAttribute[] = [];
	if (!raw) return result;

	let entries: unknown[];
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			entries = Array.isArray(parsed) ? parsed : [parsed];
		} catch {
			result.push({ label: raw, value: '' });
			return result;
		}
	} else {
		entries = Array.isArray(raw) ? raw : [raw];
	}

	for (const entry of entries) {
		if (typeof entry === 'string') {
			result.push({ label: entry, value: '' });
		} else if (typeof entry === 'number') {
			result.push({ label: '', value: `+${entry}` });
		} else if (typeof entry === 'object' && entry !== null) {
			for (const [key, val] of Object.entries(entry)) {
				if (key === 'icon') continue;
				const label = humanize(key);
				if (typeof val === 'number') {
					result.push({ label, value: `+${val}` });
				} else if (typeof val === 'string') {
					result.push({ label, value: val });
				} else if (typeof val === 'boolean') {
					result.push({ label, value: String(val) });
				} else if (Array.isArray(val)) {
					for (const item of val) {
						if (typeof item === 'string') result.push({ label, value: item });
						else if (typeof item === 'number') result.push({ label, value: `+${item}` });
						else if (typeof item === 'object' && item !== null) {
							for (const [k2, v2] of Object.entries(item)) {
								if (typeof v2 === 'number') result.push({ label: humanize(k2), value: `+${v2}` });
								else if (typeof v2 === 'string') result.push({ label: humanize(k2), value: v2 });
							}
						}
					}
				} else if (typeof val === 'object' && val !== null) {
					for (const [k2, v2] of Object.entries(val)) {
						if (typeof v2 === 'number') result.push({ label: humanize(k2), value: `+${v2}` });
						else if (typeof v2 === 'string') result.push({ label: humanize(k2), value: v2 });
					}
				}
			}
		}
	}
	return result;
}

export function mapEmblem(emblem: BackendEmblem): Emblem {
	const attrs = extractAttributes(emblem.attributes);
	const parseable = attrs.filter((a) => /\d/.test(a.value)).map((a) => `${a.label} ${a.value}`);
	const stats = parseStatStrings(parseable);
	return {
		id: emblem._id,
		slug: slugify(emblem.name),
		name: emblem.name,
		type: emblem.type,
		icon: emblem.icon || '',
		benefit: emblem.benefit ?? undefined,
		description: emblem.description ?? undefined,
		cooldown: emblem.cooldown ?? undefined,
		baseStats: stats,
		attributes: attrs,
		talents: [
			{
				id: `${emblem._id}-benefit`,
				name: emblem.benefit ? emblem.name : emblem.type,
				description: emblem.benefit || emblem.description || '',
				stats: {}
			}
		]
	};
}
