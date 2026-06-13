import type { Hero, Item, Emblem, StatBlock } from '$lib/types';
import {
	sumStats,
	scaleStatsByLevel,
	basicAttackDps,
	averageBasicAttack,
	heroSkillDamage
} from '$lib/calc/formulas';
import { emptyStatBlock } from '$lib/types';

export class Loadout {
	hero = $state<Hero | null>(null);
	level = $state(1);
	items = $state<Item[]>([]);
	secondaryItems = $state<Item[]>([]);
	mainEmblem = $state<Emblem | null>(null);
	primaryTalent = $state<Emblem | null>(null);
	tier1Talent = $state<Emblem | null>(null);
	tier2Talent = $state<Emblem | null>(null);
	target = $state<StatBlock>(emptyStatBlock());

	heroStats = $derived(
		this.hero
			? scaleStatsByLevel(this.hero.baseStats, this.hero.statsPerLevel, this.level)
			: emptyStatBlock()
	);

	baseBonus: Partial<StatBlock> = { physicalAttack: 8 };

	itemStats = $derived(sumStats([...this.items, ...this.secondaryItems].map((i) => i.stats)));

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

	basicAttackDamage = $derived(averageBasicAttack(this.finalStats, this.target));

	dps = $derived(basicAttackDps(this.finalStats, this.target));

	skillDamage(skillId: string): number {
		if (!this.hero) return 0;
		const skill = this.hero.skills.find((s) => s.id === skillId);
		if (!skill) return 0;
		return heroSkillDamage(skill, this.finalStats, this.target, this.level);
	}

	addItem(item: Item) {
		if (this.items.length >= 6) return;
		this.items = [...this.items, item];
	}

	addSecondaryItem(item: Item) {
		if (this.secondaryItems.length >= 3) return;
		this.secondaryItems = [...this.secondaryItems, item];
	}

	removeItem(index: number) {
		this.items = this.items.filter((_, i) => i !== index);
	}

	removeSecondaryItem(index: number) {
		this.secondaryItems = this.secondaryItems.filter((_, i) => i !== index);
	}

	reset() {
		this.hero = null;
		this.level = 1;
		this.items = [];
		this.secondaryItems = [];
		this.mainEmblem = null;
		this.primaryTalent = null;
		this.tier1Talent = null;
		this.tier2Talent = null;
		this.target = emptyStatBlock();
	}
}

export const loadout = new Loadout();
