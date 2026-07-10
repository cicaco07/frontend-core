<script lang="ts">
	import type { PageData } from './$types';
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { gqlRequest } from '$lib/api/graphql';
	import { HERO_STATS_QUERY } from '$lib/api/queries';
	import { mapHeroStat, type BackendHeroStat } from '$lib/api/mappers';
	import type { HeroStat } from '$lib/types';
	import {
		ArrowLeft,
		CalendarDays,
		CircleCheck,
		Coins,
		ExternalLink,
		MapPin,
		Radio,
		ShieldBan,
		Swords,
		Trophy
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const tournament = $derived(data.tournament);
	let selectedStageId = $state(untrack(() => data.initialStageId ?? ''));
	let heroStats = $state<HeroStat[]>(untrack(() => data.heroStats));
	let statsLoading = $state(false);
	let statsError = $state(false);
	let sortField = $state<keyof HeroStat>('picksAndBans');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	const selectedStage = $derived(data.stages.find((stage) => stage.id === selectedStageId));
	const sortedStats = $derived(
		[...heroStats].sort((a, b) => {
			const left = a[sortField];
			const right = b[sortField];
			if (typeof left === 'number' && typeof right === 'number') {
				return sortDirection === 'asc' ? left - right : right - left;
			}
			return (
				String(left ?? '').localeCompare(String(right ?? '')) * (sortDirection === 'asc' ? 1 : -1)
			);
		})
	);
	const totalPicks = $derived(heroStats.reduce((total, stat) => total + stat.picks, 0));
	const totalBans = $derived(heroStats.reduce((total, stat) => total + stat.bans, 0));
	const topPresenceHero = $derived(
		heroStats.reduce<HeroStat | undefined>(
			(highest, stat) => (!highest || stat.presenceRate > highest.presenceRate ? stat : highest),
			undefined
		)
	);

	const statusLabel = {
		upcoming: 'Upcoming',
		ongoing: 'Live',
		completed: 'Completed'
	} as const;

	const tierLabel = {
		international: 'International',
		national: 'National',
		regional: 'Regional'
	} as const;

	async function selectStage(stageId: string) {
		if (stageId === selectedStageId || statsLoading) return;
		selectedStageId = stageId;
		statsLoading = true;
		statsError = false;
		try {
			const result = await gqlRequest<
				{ heroStats: BackendHeroStat[] },
				{ tournamentId: string; stageId: string; limit: number }
			>(HERO_STATS_QUERY, { tournamentId: tournament.id, stageId, limit: 200 });
			heroStats = result.heroStats.map(mapHeroStat);
		} catch {
			heroStats = [];
			statsError = true;
		} finally {
			statsLoading = false;
		}
	}

	function toggleSort(field: keyof HeroStat) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'desc';
		}
	}

	function formatDate(value?: string): string {
		if (!value) return 'TBA';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return 'TBA';
		return new Intl.DateTimeFormat('en-US', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(date);
	}

	function formatDateRange(startDate?: string, endDate?: string): string {
		if (!startDate && !endDate) return 'Schedule TBA';
		if (!startDate) return `Until ${formatDate(endDate)}`;
		if (!endDate) return `Starts ${formatDate(startDate)}`;
		return `${formatDate(startDate)} — ${formatDate(endDate)}`;
	}

	function formatPercent(value: number): string {
		return `${value.toFixed(2)}%`;
	}

	function sortIndicator(field: keyof HeroStat): string {
		if (sortField !== field) return '';
		return sortDirection === 'asc' ? ' ↑' : ' ↓';
	}

	function openExternal(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>{tournament.name} | ML Theorycraft</title>
	<meta
		name="description"
		content={`Tournament details, stages, and Mobile Legends hero statistics for ${tournament.name}.`}
	/>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6">
	<a
		href={resolve('/tournaments')}
		class="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition hover:text-accent"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Back to tournaments
	</a>

	<header
		class="relative overflow-hidden rounded-3xl border border-line bg-surface/75 p-6 shadow-xl shadow-black/10 sm:p-8"
	>
		<div
			class="pointer-events-none absolute -top-24 -right-12 size-72 rounded-full bg-accent/10 blur-3xl"
		></div>
		<div class="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
			<div class="flex min-w-0 items-start gap-5">
				<span
					class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-3xl border border-line bg-surface-3 text-2xl font-bold text-accent sm:size-24"
				>
					{#if tournament.logoUrl}
						<img src={tournament.logoUrl} alt="" class="h-full w-full object-contain p-2" />
					{:else}
						{tournament.name.charAt(0)}
					{/if}
				</span>
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="rounded-full border border-good/35 bg-good/10 px-3 py-1 text-[10px] font-bold text-good uppercase"
						>
							{#if tournament.status === 'ongoing'}<span
									class="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current"
								></span>{/if}
							{statusLabel[tournament.status]}
						</span>
						<span
							class="rounded-full border border-accent-2/30 bg-accent-2/10 px-3 py-1 text-[10px] font-bold text-accent-2 uppercase"
						>
							{tierLabel[tournament.tier]} · Tier {tournament.tierLevel}
						</span>
					</div>
					<h1 class="font-display mt-3 text-3xl leading-tight font-bold text-ink sm:text-4xl">
						{tournament.name}
					</h1>
					<p class="mt-2 text-sm text-ink-muted">Competitive overview and hero draft statistics.</p>
				</div>
			</div>
			<button
				type="button"
				onclick={() => openExternal(tournament.liquipediaUrl)}
				class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-accent/35 px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent hover:text-bg"
			>
				Open Liquipedia <ExternalLink class="size-4" aria-hidden="true" />
			</button>
		</div>

		<dl class="relative mt-7 grid gap-3 border-t border-line pt-6 sm:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-2xl border border-line bg-bg/45 p-4">
				<CalendarDays class="size-5 text-accent" aria-hidden="true" />
				<dt class="mt-3 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Schedule</dt>
				<dd class="mt-1 text-sm font-semibold text-ink">
					{formatDateRange(tournament.startDate, tournament.endDate)}
				</dd>
			</div>
			<div class="rounded-2xl border border-line bg-bg/45 p-4">
				<MapPin class="size-5 text-accent" aria-hidden="true" />
				<dt class="mt-3 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Region</dt>
				<dd class="mt-1 text-sm font-semibold text-ink">{tournament.region || 'Global'}</dd>
			</div>
			<div class="rounded-2xl border border-line bg-bg/45 p-4">
				<Coins class="size-5 text-gold" aria-hidden="true" />
				<dt class="mt-3 text-[10px] font-bold tracking-wide text-ink-faint uppercase">
					Prize Pool
				</dt>
				<dd class="font-mono-stat mt-1 text-sm font-bold text-gold">
					{tournament.prizePool || 'TBA'}
				</dd>
			</div>
			<div class="rounded-2xl border border-line bg-bg/45 p-4">
				<Trophy class="size-5 text-accent-2" aria-hidden="true" />
				<dt class="mt-3 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Game</dt>
				<dd class="mt-1 text-sm font-semibold text-ink">Mobile Legends: Bang Bang</dd>
			</div>
		</dl>
	</header>

	<section class="rounded-3xl border border-line bg-surface/65 p-5 shadow-xl shadow-black/10">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<p class="font-display text-xs font-bold tracking-[0.2em] text-accent uppercase">
					Tournament Stages
				</p>
				<h2 class="font-display mt-2 text-2xl font-bold text-ink">Stage Selection</h2>
				<p class="mt-1 text-sm text-ink-muted">
					Pilih stage untuk memperbarui statistik hero di bawah.
				</p>
			</div>
			<span
				class="rounded-full border border-line bg-bg/55 px-4 py-2 text-xs font-bold text-ink-muted"
			>
				{data.stages.length}
				{data.stages.length === 1 ? 'stage' : 'stages'}
			</span>
		</div>

		{#if data.stages.length === 0}
			<div
				class="mt-5 rounded-2xl border border-dashed border-line-strong bg-bg/35 p-8 text-center"
			>
				<p class="font-semibold text-ink">Stage data belum tersedia</p>
				<p class="mt-1 text-sm text-ink-muted">
					Tournament ini belum memiliki hasil sinkronisasi per stage.
				</p>
			</div>
		{:else}
			<div class="mt-5 flex gap-3 overflow-x-auto pb-2">
				{#each data.stages as stage (stage.id)}
					<button
						type="button"
						onclick={() => selectStage(stage.id)}
						class="min-w-48 rounded-2xl border p-4 text-left transition {selectedStageId ===
						stage.id
							? 'border-accent bg-accent/10'
							: 'border-line bg-bg/40'}"
					>
						<span class="font-mono-stat text-xs font-bold text-accent">#{stage.order}</span>
						<span class="mt-2 block font-semibold text-ink">{stage.name}</span>
						<span class="mt-1 block text-xs text-ink-faint">View draft statistics</span>
					</button>
				{/each}
			</div>
		{/if}
	</section>

	<section
		class="space-y-5 rounded-3xl border border-line bg-surface/65 p-5 shadow-xl shadow-black/10"
	>
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<p class="font-display text-xs font-bold tracking-[0.2em] text-accent uppercase">
					Draft Analytics
				</p>
				<h2 class="font-display mt-2 text-2xl font-bold text-ink">Hero Statistics</h2>
				<p class="mt-1 text-sm text-ink-muted">
					{selectedStage?.name || 'No stage selected'} · sorted by picks and bans.
				</p>
			</div>
			<div class="grid grid-cols-3 gap-2">
				<div class="rounded-2xl border border-line bg-bg/45 px-4 py-3 text-center">
					<Swords class="mx-auto size-4 text-accent" aria-hidden="true" />
					<p class="font-mono-stat mt-1 font-bold text-ink">{totalPicks}</p>
					<p class="text-[9px] font-bold text-ink-faint uppercase">Picks</p>
				</div>
				<div class="rounded-2xl border border-line bg-bg/45 px-4 py-3 text-center">
					<ShieldBan class="mx-auto size-4 text-negative" aria-hidden="true" />
					<p class="font-mono-stat mt-1 font-bold text-ink">{totalBans}</p>
					<p class="text-[9px] font-bold text-ink-faint uppercase">Bans</p>
				</div>
				<div class="rounded-2xl border border-line bg-bg/45 px-4 py-3 text-center">
					<Radio class="mx-auto size-4 text-good" aria-hidden="true" />
					<p class="font-mono-stat mt-1 font-bold text-ink">
						{topPresenceHero ? formatPercent(topPresenceHero.presenceRate) : '0.00%'}
					</p>
					<p class="text-[9px] font-bold text-ink-faint uppercase">
						{topPresenceHero?.heroName || 'Highest presence'}
					</p>
				</div>
			</div>
		</div>

		{#if statsLoading}
			<div class="rounded-2xl border border-line bg-bg/35 p-12 text-center text-sm text-ink-muted">
				Loading hero statistics…
			</div>
		{:else if statsError}
			<div class="rounded-2xl border border-negative/25 bg-negative/5 p-10 text-center">
				<p class="font-semibold text-negative">Gagal memuat hero statistics</p>
				<p class="mt-1 text-sm text-ink-muted">Silakan pilih stage kembali untuk mencoba ulang.</p>
			</div>
		{:else if sortedStats.length === 0}
			<div class="rounded-2xl border border-dashed border-line-strong bg-bg/35 p-10 text-center">
				<CircleCheck class="mx-auto size-7 text-ink-faint" aria-hidden="true" />
				<p class="mt-3 font-semibold text-ink">Belum ada statistik hero</p>
				<p class="mt-1 text-sm text-ink-muted">
					Stage ini belum memiliki data draft yang tersinkronisasi.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-2xl border border-line">
				<table class="w-full min-w-[900px] border-collapse text-sm">
					<thead class="sticky top-0 z-10 bg-bg text-xs tracking-wide text-ink-muted uppercase">
						<tr>
							<th class="px-4 py-3 text-left">#</th>
							<th class="px-4 py-3 text-left"
								><button
									type="button"
									onclick={() => toggleSort('heroName')}
									class="inline-flex items-center gap-1 font-bold"
									>Hero{sortIndicator('heroName')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('picks')} class="font-bold"
									>Picks{sortIndicator('picks')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('bans')} class="font-bold"
									>Bans{sortIndicator('bans')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('picksAndBans')} class="font-bold"
									>P+B{sortIndicator('picksAndBans')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('wins')} class="font-bold"
									>W-L{sortIndicator('wins')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('winRate')} class="font-bold"
									>Win rate{sortIndicator('winRate')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('pickRate')} class="font-bold"
									>Pick rate{sortIndicator('pickRate')}</button
								></th
							>
							<th class="px-3 py-3 text-center"
								><button type="button" onclick={() => toggleSort('banRate')} class="font-bold"
									>Ban rate{sortIndicator('banRate')}</button
								></th
							>
							<th class="px-4 py-3 text-center"
								><button type="button" onclick={() => toggleSort('presenceRate')} class="font-bold"
									>Presence{sortIndicator('presenceRate')}</button
								></th
							>
						</tr>
					</thead>
					<tbody>
						{#each sortedStats as stat, index (stat.id)}
							<tr class="border-t border-line bg-surface/35 transition hover:bg-surface-3/45">
								<td class="font-mono-stat px-4 py-3 text-ink-faint">{index + 1}</td>
								<td class="px-4 py-3">
									<div class="flex items-center gap-3">
										<span
											class="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-bg/60 font-bold text-accent"
										>
											{stat.heroName.charAt(0)}
										</span>
										<div>
											<p class="font-semibold text-ink">{stat.heroName}</p>
											{#if stat.role}<p class="text-[10px] text-ink-faint">{stat.role}</p>{/if}
										</div>
									</div>
								</td>
								<td class="font-mono-stat px-3 py-3 text-center text-ink">{stat.picks}</td>
								<td class="font-mono-stat px-3 py-3 text-center text-negative">{stat.bans}</td>
								<td class="font-mono-stat px-3 py-3 text-center font-bold text-accent"
									>{stat.picksAndBans}</td
								>
								<td class="font-mono-stat px-3 py-3 text-center"
									><span class="text-good">{stat.wins}</span><span class="text-ink-faint">–</span
									><span class="text-negative">{stat.losses}</span></td
								>
								<td
									class="font-mono-stat px-3 py-3 text-center font-bold"
									class:text-good={stat.winRate >= 50}
									class:text-negative={stat.winRate < 50}>{formatPercent(stat.winRate)}</td
								>
								<td class="font-mono-stat px-3 py-3 text-center text-ink-muted"
									>{formatPercent(stat.pickRate)}</td
								>
								<td class="font-mono-stat px-3 py-3 text-center text-ink-muted"
									>{formatPercent(stat.banRate)}</td
								>
								<td class="px-4 py-3 text-center"
									><span
										class="font-mono-stat rounded-full bg-accent-2/10 px-2.5 py-1 font-bold text-accent-2"
										>{formatPercent(stat.presenceRate)}</span
									></td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
