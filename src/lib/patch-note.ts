import type { BackendPatchChange, PatchChange } from './types/patch-note';

export function mapPatchChange(change: BackendPatchChange): PatchChange {
	return {
		id: change._id,
		targetType: change.target_type,
		targetRef: change.target_ref ?? undefined,
		targetName: change.target_name,
		changeType: change.change_type,
		section: change.section,
		title: change.title ?? undefined,
		description: change.description,
		details: (change.details ?? []).map((detail) => ({
			field: detail.field,
			oldValue: detail.old_value ?? undefined,
			newValue: detail.new_value ?? undefined,
			rawText: detail.raw_text
		})),
		order: change.order,
		patchNote: {
			id: change.patch_note._id,
			name: change.patch_note.name,
			version: change.patch_note.version ?? undefined,
			status: change.patch_note.status,
			publishedAt: change.patch_note.published_at ?? undefined,
			startDate: change.patch_note.start_date ?? undefined
		}
	};
}

export function groupPatchChangesByTarget(changes: PatchChange[]): Map<string, PatchChange[]> {
	const grouped = new Map<string, PatchChange[]>();
	for (const change of changes) {
		const key = change.targetRef ?? change.targetName.trim().toLowerCase();
		grouped.set(key, [...(grouped.get(key) ?? []), change]);
	}
	return grouped;
}
