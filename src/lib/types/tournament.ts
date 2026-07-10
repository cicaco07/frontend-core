export type TournamentTier = 'international' | 'national' | 'regional';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
	id: string;
	name: string;
	slug: string;
	tier: TournamentTier;
	tierLevel: number;
	game: string;
	region?: string;
	logoUrl?: string;
	prizePool?: string;
	startDate?: string;
	endDate?: string;
	liquipediaUrl: string;
	status: TournamentStatus;
}
