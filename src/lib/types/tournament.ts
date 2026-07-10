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

export interface TournamentStage {
	id: string;
	name: string;
	slug: string;
	liquipediaUrl: string;
	order: number;
}

export interface HeroStat {
	id: string;
	stageId?: string;
	heroName: string;
	heroSlug: string;
	heroImageUrl?: string;
	role?: string;
	picks: number;
	bans: number;
	picksAndBans: number;
	wins: number;
	losses: number;
	winRate: number;
	pickRate: number;
	banRate: number;
	presenceRate: number;
	blueSidePicks: number;
	blueSideWins: number;
	redSidePicks: number;
	redSideWins: number;
}
