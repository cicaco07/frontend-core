import type { Hero, Item, Emblem, StatBlock } from '$lib/types';
import {
	sumStats,
	scaleStatsByLevel,
	basicAttackDps,
	averageBasicAttack,
	heroSkillDamage
} from '$lib/calc/formulas';
import { emptyStatBlock } from '$lib/types';
import { getHeroMod, type HeroModConfig } from '$lib/calc/hero-modifiers';
import { applyPassiveAmp, emptyModifierState, type ModifierState } from '$lib/calc/apply-modifiers';

export class Loadout {
	hero = $state<Hero | null>(null);
	level = $state(1);
	items = $state<Item[]>([]);
	mainEmblem = $state<Emblem | null>(null);
	primaryTalent = $state<Emblem | null>(null);
	tier1Talent = $state<Emblem | null>(null);
	tier2Talent = $state<Emblem | null>(null);
	target = $state<StatBlock>(emptyStatBlock());
	modifierState = $state<ModifierState>(emptyModifierState());

	heroMod = $derived<HeroModConfig | null>(this.hero ? getHeroMod(this.hero.slug) : null);

	heroStats = $derived(
		this.hero
			? scaleStatsByLevel(this.hero.baseStats, this.hero.statsPerLevel, this.level)
			: emptyStatBlock()
	);

	baseBonus: Partial<StatBlock> = { physicalAttack: 8 };

	itemStats = $derived(sumStats(this.items.map((i) => i.stats)));

	emblemStats = $derived(
		sumStats([
			this.mainEmblem?.baseStats ?? {},
			this.primaryTalent?.baseStats ?? {},
			this.tier1Talent?.baseStats ?? {},
			this.tier2Talent?.baseStats ?? {}
		])
	);

	finalStats = $derived(
		sumStats([this.heroStats, this.baseBonus, this.itemStats, this.emblemStats])
	);

	totalCost = $derived(this.items.reduce((sum, i) => sum + i.cost, 0));

	basicAttackDamage = $derived(
		applyPassiveAmp(
			averageBasicAttack(this.finalStats, this.target),
			this.heroMod,
			this.modifierState
		)
	);

	dps = $derived(
		applyPassiveAmp(basicAttackDps(this.finalStats, this.target), this.heroMod, this.modifierState)
	);

	skillDamage(skillId: string): number {
		if (!this.hero) return 0;
		const skill = this.hero.skills.find((s) => s.id === skillId);
		if (!skill) return 0;
		return heroSkillDamage(skill, this.finalStats, this.target, this.level);
	}

	addItem(item: Item) {
		if (this.items.length >= 6) return;
		if (item.tier === 'ETC') return;
		this.items = [...this.items, item];
	}

	addEtcItem(item: Item) {
		if (this.items.length >= 6) return;
		this.items = [...this.items, item];
	}

	removeItem(index: number) {
		this.items = this.items.filter((_, i) => i !== index);
	}

	moveItem(from: number, to: number) {
		if (from === to) return;
		if (from < 0 || from >= this.items.length) return;
		if (to < 0 || to >= this.items.length) return;
		const arr = [...this.items];
		const [moved] = arr.splice(from, 1);
		arr.splice(to, 0, moved);
		this.items = arr;
	}

	reset() {
		this.hero = null;
		this.level = 1;
		this.items = [];
		this.mainEmblem = null;
		this.primaryTalent = null;
		this.tier1Talent = null;
		this.tier2Talent = null;
		this.target = emptyStatBlock();
		this.modifierState = emptyModifierState();
	}
}

export const loadout = new Loadout();
