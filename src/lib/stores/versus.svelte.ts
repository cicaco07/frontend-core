import { Loadout } from './loadout.svelte';
import { compareVersus, skillBreakdown, type Combatant } from '$lib/calc/versus';
import type { DamageType } from '$lib/types';

function primaryDamageType(loadout: Loadout): DamageType {
	const { physicalAttack, magicPower } = loadout.finalStats;
	return magicPower > physicalAttack ? 'magic' : 'physical';
}

function toCombatant(loadout: Loadout): Combatant {
	return {
		name: loadout.hero?.name ?? 'Unset',
		level: loadout.level,
		stats: loadout.finalStats,
		skills: loadout.hero?.skills ?? [],
		primaryDamageType: primaryDamageType(loadout)
	};
}

export class Versus {
	a = new Loadout();
	b = new Loadout();

	combatantA = $derived(toCombatant(this.a));
	combatantB = $derived(toCombatant(this.b));

	result = $derived(compareVersus(this.combatantA, this.combatantB));

	breakdownAtoB = $derived(skillBreakdown(this.combatantA, this.combatantB));
	breakdownBtoA = $derived(skillBreakdown(this.combatantB, this.combatantA));

	ready = $derived(this.a.hero !== null && this.b.hero !== null);

	swap() {
		const tmp = this.a;
		this.a = this.b;
		this.b = tmp;
	}

	reset() {
		this.a.reset();
		this.b.reset();
	}
}

export const versus = new Versus();
