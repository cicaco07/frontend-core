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
	emblem = $state<Emblem | null>(null);
	target = $state<StatBlock>(emptyStatBlock());

	heroStats = $derived(
		this.hero
			? scaleStatsByLevel(this.hero.baseStats, this.hero.statsPerLevel, this.level)
			: emptyStatBlock()
	);

	itemStats = $derived(sumStats(this.items.map((i) => i.stats)));

	emblemStats = $derived(
		this.emblem
			? sumStats([this.emblem.baseStats, ...this.emblem.talents.map((t) => t.stats)])
			: emptyStatBlock()
	);

	finalStats = $derived(sumStats([this.heroStats, this.itemStats, this.emblemStats]));

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

	removeItem(index: number) {
		this.items = this.items.filter((_, i) => i !== index);
	}

	reset() {
		this.hero = null;
		this.level = 1;
		this.items = [];
		this.emblem = null;
		this.target = emptyStatBlock();
	}
}

export const loadout = new Loadout();
