import { describe, expect, it } from 'vitest';
import { groupPatchChangesByTarget } from './patch-note';
import type { PatchChange } from './types/patch-note';

const change = (id: string, targetRef?: string, targetName = 'Saber'): PatchChange => ({
	id,
	targetType: 'HERO',
	targetRef,
	targetName,
	changeType: 'BUFF',
	section: 'Skill 1',
	description: 'Damage increased.',
	details: [],
	order: 0,
	patchNote: {
		id: `patch-${id}`,
		name: 'Patch',
		status: 'PUBLISHED',
		publishedAt: '2026-07-01T00:00:00.000Z'
	}
});

describe('groupPatchChangesByTarget', () => {
	it('groups linked targets by id and unlinked targets by normalized name', () => {
		const grouped = groupPatchChangesByTarget([
			change('1', 'hero-id'),
			change('2', 'hero-id'),
			change('3', undefined, 'Blade of Despair')
		]);

		expect(grouped.get('hero-id')?.map((item) => item.id)).toEqual(['1', '2']);
		expect(grouped.get('blade of despair')?.map((item) => item.id)).toEqual(['3']);
	});
});
