import type { HeroRole } from '$lib/types';
import type { ItemCategory } from '$lib/types/equipment';

export const HERO_ROLES: HeroRole[] = [
	'tank',
	'fighter',
	'assassin',
	'mage',
	'marksman',
	'support'
];

const ROLE_COLOR: Record<HeroRole, string> = {
	tank: '#6d8aad',
	fighter: '#c2724a',
	assassin: '#b25c8f',
	mage: '#5aa6c4',
	marksman: '#c9a24a',
	support: '#5fb38a'
};

export function roleColor(role: HeroRole): string {
	return ROLE_COLOR[role];
}

export const ITEM_CATEGORIES: ItemCategory[] = [
	'attack',
	'magic',
	'defense',
	'movement',
	'jungle',
	'roam'
];

const CATEGORY_COLOR: Record<ItemCategory, string> = {
	attack: '#ffb340',
	magic: '#36d6e7',
	defense: '#5fb38a',
	movement: '#9aa6bd',
	jungle: '#c2724a',
	roam: '#b25c8f'
};

export function categoryColor(category: ItemCategory): string {
	return CATEGORY_COLOR[category];
}

export function titleCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
