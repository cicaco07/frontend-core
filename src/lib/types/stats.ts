export type DamageType = 'physical' | 'magic' | 'true';

export type HeroRole = 'tank' | 'fighter' | 'assassin' | 'mage' | 'marksman' | 'support';

// Fields ending in `Pct` are ratios (0.4 = 40%); all others are flat values.
export interface StatBlock {
	hp: number;
	hpRegen: number;
	mana: number;
	manaRegen: number;

	physicalAttack: number;
	magicPower: number;

	physicalDefense: number;
	magicDefense: number;

	attackSpeedPct: number; // ratio over base, 0.25 = +25%
	critChancePct: number; // 0..1
	critDamagePct: number; // bonus over the default 2.0x, e.g. 0.4 = +40%

	cooldownReductionPct: number; // 0..1
	lifestealPct: number; // 0..1
	spellVampPct: number; // 0..1

	movementSpeed: number;

	// Penetration: flat is subtracted before pct is applied.
	physicalPenFlat: number;
	physicalPenPct: number; // 0..1
	magicPenFlat: number;
	magicPenPct: number; // 0..1
}

/** A zeroed StatBlock — the additive identity for stat summation. */
export function emptyStatBlock(): StatBlock {
	return {
		hp: 0,
		hpRegen: 0,
		mana: 0,
		manaRegen: 0,
		physicalAttack: 0,
		magicPower: 0,
		physicalDefense: 0,
		magicDefense: 0,
		attackSpeedPct: 0,
		critChancePct: 0,
		critDamagePct: 0,
		cooldownReductionPct: 0,
		lifestealPct: 0,
		spellVampPct: 0,
		movementSpeed: 0,
		physicalPenFlat: 0,
		physicalPenPct: 0,
		magicPenFlat: 0,
		magicPenPct: 0
	};
}
