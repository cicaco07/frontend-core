import type { Hero, Item, Emblem, StatBlock } from '$lib/types';
import {
	sumStats,
	scaleStatsByLevel,
	basicAttackDps,
	averageBasicAttack,
	heroSkillDamage,
	computeDamage,
	attacksPerSecond
} from '$lib/calc/formulas';
import { emptyStatBlock } from '$lib/types';
import { getHeroMod, type HeroModConfig } from '$lib/calc/hero-modifiers';
import {
	applyPassiveAmp,
	computeManaFromStacks,
	emptyModifierState,
	type ModifierState
} from '$lib/calc/apply-modifiers';

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
	hasSkin = $state(false);

	heroMod = $derived<HeroModConfig | null>(this.hero ? getHeroMod(this.hero.slug) : null);

	heroStats = $derived(
		this.hero
			? scaleStatsByLevel(this.hero.baseStats, this.hero.statsPerLevel, this.level)
			: emptyStatBlock()
	);

	baseBonus = $derived.by<Partial<StatBlock>>(() => {
		if (!this.hasSkin || !this.hero) return {};
		const slug = this.hero.slug.toLowerCase();
		const exceptions: Record<string, Partial<StatBlock>> = {
			alice: { magicPower: 8 },
			chip: { hp: 100 },
			esme: { magicPower: 8 },
			esmeralda: { magicPower: 8 },
			freddrin: { hp: 100 },
			fredrinn: { hp: 100 },
			silvanna: { magicPower: 8 },
			selena: { magicPower: 8 },
			natan: { magicPower: 8 },
			kimmy: { magicPower: 8 },
			joy: { magicPower: 8 },
			gusion: { magicPower: 8 },
			guin: { magicPower: 8 },
			guinevere: { magicPower: 8 },
			julian: { magicPower: 8 },
			kaja: { magicPower: 8 },
			karina: { magicPower: 8 },
			lolita: { hp: 100 },
			marcel: { hp: 100 }
		};

		if (slug in exceptions) {
			return exceptions[slug];
		}

		const role = this.hero.role.toLowerCase();
		if (role === 'marksman' || role === 'fighter' || role === 'assassin') {
			return { physicalAttack: 8 };
		}
		if (role === 'tank') {
			return { hp: 100 };
		}
		if (role === 'mage' || role === 'support') {
			return { magicPower: 8 };
		}
		return {};
	});

	itemStats = $derived(sumStats(this.items.map((i) => i.stats)));

	emblemStats = $derived(
		sumStats([
			this.mainEmblem?.baseStats ?? {},
			this.primaryTalent?.baseStats ?? {},
			this.tier1Talent?.baseStats ?? {},
			this.tier2Talent?.baseStats ?? {}
		])
	);

	modifierBonus = $derived.by<Partial<StatBlock>>(() => {
		if (!this.heroMod?.passive) return {};
		const p = this.heroMod.passive;
		if (p.type === 'mana-stacking') {
			return { mana: computeManaFromStacks(p, this.modifierState.passiveStacks) };
		}
		return {};
	});

	finalStats = $derived(
		sumStats([this.heroStats, this.baseBonus, this.itemStats, this.emblemStats, this.modifierBonus])
	);

	totalCost = $derived(this.items.reduce((sum, i) => sum + i.cost, 0));

	basicAttackDamage = $derived.by(() => {
		const baseDmg = averageBasicAttack(this.finalStats, this.target);
		const ampDmg = applyPassiveAmp(baseDmg, this.heroMod, this.modifierState);

		if (this.heroMod?.passive?.type === 'basic-attack-hp-scaling') {
			const p = this.heroMod.passive;
			const stacks = Math.min(Math.max(0, this.modifierState.passiveStacks), p.maxStacks);
			if (stacks > 0) {
				const extraRaw = p.baseDamage + this.finalStats.hp * p.hpScalingRatio;
				const extraDmg = computeDamage({
					rawDamage: extraRaw,
					damageType: 'physical',
					attacker: this.finalStats,
					target: this.target
				});
				return ampDmg + extraDmg * stacks;
			}
		}
		return ampDmg;
	});

	basicAttackCritDamage = $derived.by(() => {
		const baseCrit = computeDamage({
			rawDamage: this.finalStats.physicalAttack,
			damageType: 'physical',
			attacker: this.finalStats,
			target: this.target
		}) * (2 + this.finalStats.critDamagePct);
		const ampCrit = applyPassiveAmp(baseCrit, this.heroMod, this.modifierState);

		if (this.heroMod?.passive?.type === 'basic-attack-hp-scaling') {
			const p = this.heroMod.passive;
			const stacks = Math.min(Math.max(0, this.modifierState.passiveStacks), p.maxStacks);
			if (stacks > 0) {
				const extraRaw = p.baseDamage + this.finalStats.hp * p.hpScalingRatio;
				const extraDmg = computeDamage({
					rawDamage: extraRaw,
					damageType: 'physical',
					attacker: this.finalStats,
					target: this.target
				});
				return ampCrit + extraDmg * stacks;
			}
		}
		return ampCrit;
	});

	dps = $derived.by(() => {
		const baseDps = basicAttackDps(this.finalStats, this.target);
		const ampDps = applyPassiveAmp(baseDps, this.heroMod, this.modifierState);

		if (this.heroMod?.passive?.type === 'basic-attack-hp-scaling') {
			const p = this.heroMod.passive;
			const stacks = Math.min(Math.max(0, this.modifierState.passiveStacks), p.maxStacks);
			if (stacks > 0) {
				const extraRaw = p.baseDamage + this.finalStats.hp * p.hpScalingRatio;
				const extraDmg = computeDamage({
					rawDamage: extraRaw,
					damageType: 'physical',
					attacker: this.finalStats,
					target: this.target
				});
				const extraDps = extraDmg * stacks * attacksPerSecond(this.finalStats);
				return ampDps + extraDps;
			}
		}
		return ampDps;
	});

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
		this.hasSkin = false;
	}
}

export const loadout = new Loadout();
