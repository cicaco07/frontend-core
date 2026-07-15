export type PatchTargetType = 'HERO' | 'ITEM' | 'BATTLEFIELD' | 'SYSTEM' | 'GAME_MODE';
export type PatchChangeType = 'BUFF' | 'NERF' | 'ADJUSTED' | 'REWORK' | 'NEW' | 'REMOVED' | 'OTHER';

export interface PatchChangeDetail {
	field: string;
	oldValue?: string;
	newValue?: string;
	rawText: string;
}

export interface PatchChangePatchNote {
	id: string;
	name: string;
	version?: string;
	status: string;
	publishedAt?: string;
	startDate?: string;
}

export interface PatchChange {
	id: string;
	targetType: PatchTargetType;
	targetRef?: string;
	targetName: string;
	changeType: PatchChangeType;
	section: string;
	title?: string;
	description: string;
	details: PatchChangeDetail[];
	order: number;
	patchNote: PatchChangePatchNote;
}

export interface BackendPatchChange {
	_id: string;
	target_type: PatchTargetType;
	target_ref?: string | null;
	target_name: string;
	change_type: PatchChangeType;
	section: string;
	title?: string | null;
	description: string;
	details?: Array<{
		field: string;
		old_value?: string | null;
		new_value?: string | null;
		raw_text: string;
	}> | null;
	order: number;
	patch_note: {
		_id: string;
		name: string;
		version?: string | null;
		status: string;
		published_at?: string | null;
		start_date?: string | null;
	};
}
