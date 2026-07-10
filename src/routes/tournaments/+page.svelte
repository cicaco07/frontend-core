<script lang="ts">
	import type { PageData } from './$types';
	import type { TournamentStatus, TournamentTier } from '$lib/types';
	import {
		CalendarDays,
		CircleCheck,
		Clock3,
		Coins,
		ExternalLink,
		MapPin,
		Radio,
		Search,
		Trophy
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let tierFilter = $state<TournamentTier | null>(null);
	let statusFilter = $state<TournamentStatus | null>(null);

	const tiers: TournamentTier[] = ['international', 'national', 'regional'];
	const statuses: TournamentStatus[] = ['upcoming', 'ongoing', 'completed'];

	const filteredTournaments = $derived(
		data.tournaments.filter((tournament) => {
			const search = query.trim().toLowerCase();
			const matchesSearch =
				search === '' ||
				tournament.name.toLowerCase().includes(search) ||
				tournament.region?.toLowerCase().includes(search);

			return (
				matchesSearch &&
				(tierFilter === null || tournament.tier === tierFilter) &&
				(statusFilter === null || tournament.status === statusFilter)
			);
		})
	);

	const ongoingCount = $derived(
		data.tournaments.filter((tournament) => tournament.status === 'ongoing').length
	);
	const upcomingCount = $derived(
		data.tournaments.filter((tournament) => tournament.status === 'upcoming').length
	);
	const internationalCount = $derived(
		data.tournaments.filter((tournament) => tournament.tier === 'international').length
	);
	const hasFilters = $derived(query.trim() !== '' || tierFilter !== null || statusFilter !== null);

	const tierLabel: Record<TournamentTier, string> = {
		international: 'International',
		national: 'National',
		regional: 'Regional'
	};

	const statusLabel: Record<TournamentStatus, string> = {
		upcoming: 'Upcoming',
		ongoing: 'Live',
		completed: 'Completed'
	};

	const statusClass: Record<TournamentStatus, string> = {
		upcoming: 'border-warning/35 bg-warning/10 text-warning',
		ongoing: 'border-good/35 bg-good/10 text-good',
		completed: 'border-line-strong bg-surface-3 text-ink-muted'
	};

	function resetFilters() {
		query = '';
		tierFilter = null;
		statusFilter = null;
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

	function openLiquipedia(url: string) {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
</script>

<svelte:head>
	<title>Tournaments | ML Theorycraft</title>
	<meta
		name="description"
		content="Browse Mobile Legends tournaments by competitive tier, region, schedule, and status."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6">
	<header
		class="relative overflow-hidden rounded-3xl border border-line bg-surface/75 p-6 shadow-xl shadow-black/10 sm:p-8"
	>
		<div
			class="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-accent/10 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute -bottom-24 left-1/3 size-56 rounded-full bg-accent-2/10 blur-3xl"
		></div>

		<div class="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
			<div class="max-w-xl flex-1">
				<div class="flex items-center gap-2 text-accent">
					<Trophy class="size-4" aria-hidden="true" />
					<p class="font-display text-xs font-bold tracking-[0.22em] uppercase">
						Competitive Scene
					</p>
				</div>
				<h1 class="font-display mt-3 text-3xl font-bold text-ink sm:text-4xl">Tournament Hub</h1>
				<p class="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
					Jelajahi turnamen Mobile Legends dari level regional hingga internasional, lengkap dengan
					status, jadwal, wilayah, dan prize pool.
				</p>
			</div>

			<div class="grid w-full grid-cols-3 gap-2 sm:gap-3 lg:w-auto">
				<div
					class="min-w-20 rounded-2xl border border-line bg-bg/55 px-3 py-3 text-center lg:min-w-24"
				>
					<p class="font-mono-stat text-xl font-bold text-good">{ongoingCount}</p>
					<p class="mt-1 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Live</p>
				</div>
				<div
					class="min-w-20 rounded-2xl border border-line bg-bg/55 px-3 py-3 text-center lg:min-w-24"
				>
					<p class="font-mono-stat text-xl font-bold text-warning">{upcomingCount}</p>
					<p class="mt-1 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Upcoming</p>
				</div>
				<div
					class="min-w-20 rounded-2xl border border-line bg-bg/55 px-3 py-3 text-center lg:min-w-24"
				>
					<p class="font-mono-stat text-xl font-bold text-accent-2">{internationalCount}</p>
					<p class="mt-1 text-[10px] font-bold tracking-wide text-ink-faint uppercase">Global</p>
				</div>
			</div>
		</div>
	</header>

	<section
		class="space-y-5 rounded-3xl border border-line bg-surface/55 p-4 sm:p-5"
		aria-label="Tournament filters"
	>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<label class="relative block w-full sm:max-w-md">
				<span class="sr-only">Search tournaments</span>
				<Search
					class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-faint"
					aria-hidden="true"
				/>
				<input
					type="search"
					placeholder="Cari tournament atau region…"
					bind:value={query}
					class="w-full rounded-full border border-line bg-bg/70 py-2.5 pr-4 pl-11 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
				/>
			</label>
			<div class="flex items-center justify-between gap-3 sm:justify-end">
				<p class="text-sm text-ink-muted">
					{filteredTournaments.length} of {data.tournaments.length}
					{data.tournaments.length === 1 ? 'tournament' : 'tournaments'}
				</p>
				{#if hasFilters}
					<button
						type="button"
						onclick={resetFilters}
						class="rounded-full border border-negative/40 px-4 py-2 text-xs font-bold text-negative transition hover:bg-negative/10"
					>
						Reset
					</button>
				{/if}
			</div>
		</div>

		<div class="grid gap-4 border-t border-line pt-4 lg:grid-cols-2">
			<fieldset>
				<legend class="mb-2 text-[10px] font-bold tracking-[0.18em] text-ink-faint uppercase"
					>Tier</legend
				>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => (tierFilter = null)}
						class="rounded-full border px-3 py-2 text-xs font-bold transition"
						class:border-accent={tierFilter === null}
						class:bg-accent={tierFilter === null}
						class:text-bg={tierFilter === null}
						class:border-line={tierFilter !== null}
						class:text-ink-muted={tierFilter !== null}>All tiers</button
					>
					{#each tiers as tier (tier)}
						<button
							type="button"
							onclick={() => (tierFilter = tierFilter === tier ? null : tier)}
							class="rounded-full border px-3 py-2 text-xs font-bold transition"
							class:border-accent={tierFilter === tier}
							class:bg-accent={tierFilter === tier}
							class:text-bg={tierFilter === tier}
							class:border-line={tierFilter !== tier}
							class:text-ink-muted={tierFilter !== tier}>{tierLabel[tier]}</button
						>
					{/each}
				</div>
			</fieldset>

			<fieldset>
				<legend class="mb-2 text-[10px] font-bold tracking-[0.18em] text-ink-faint uppercase"
					>Status</legend
				>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() => (statusFilter = null)}
						class="rounded-full border px-3 py-2 text-xs font-bold transition"
						class:border-accent={statusFilter === null}
						class:bg-accent={statusFilter === null}
						class:text-bg={statusFilter === null}
						class:border-line={statusFilter !== null}
						class:text-ink-muted={statusFilter !== null}>All statuses</button
					>
					{#each statuses as status (status)}
						<button
							type="button"
							onclick={() => (statusFilter = statusFilter === status ? null : status)}
							class="rounded-full border px-3 py-2 text-xs font-bold transition"
							class:border-accent={statusFilter === status}
							class:bg-accent={statusFilter === status}
							class:text-bg={statusFilter === status}
							class:border-line={statusFilter !== status}
							class:text-ink-muted={statusFilter !== status}>{statusLabel[status]}</button
						>
					{/each}
				</div>
			</fieldset>
		</div>
	</section>

	{#if data.tournaments.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-12 text-center">
			<span class="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-3 text-ink-faint">
				<Trophy class="size-7" aria-hidden="true" />
			</span>
			<h2 class="font-display mt-4 text-xl font-bold text-ink">No tournaments loaded yet</h2>
			<p class="mt-2 text-sm text-ink-muted">
				Connect the backend API or add tournament data to display it here.
			</p>
		</div>
	{:else if filteredTournaments.length === 0}
		<div class="rounded-3xl border border-line bg-surface/70 p-12 text-center">
			<Search class="mx-auto size-8 text-ink-faint" aria-hidden="true" />
			<h2 class="font-display mt-4 text-xl font-bold text-ink">Tournament tidak ditemukan</h2>
			<p class="mt-2 text-sm text-ink-muted">Coba kata kunci lain atau reset filter yang aktif.</p>
		</div>
	{:else}
		<div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each filteredTournaments as tournament (tournament.id)}
				<article
					class="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface/75 shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:border-accent/35"
				>
					<div class="flex items-start gap-4 border-b border-line bg-bg/35 p-5">
						<span
							class="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-surface-3 text-xl font-bold text-accent"
						>
							{#if tournament.logoUrl}
								<img
									src={tournament.logoUrl}
									alt=""
									class="h-full w-full object-contain p-1"
									loading="lazy"
								/>
							{:else}
								{tournament.name.charAt(0)}
							{/if}
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<span
									class="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase {statusClass[
										tournament.status
									]}"
								>
									{#if tournament.status === 'ongoing'}<span
											class="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-current"
										></span>{/if}
									{statusLabel[tournament.status]}
								</span>
								<span
									class="rounded-full border border-accent-2/30 bg-accent-2/10 px-2.5 py-1 text-[10px] font-bold text-accent-2 uppercase"
								>
									{tierLabel[tournament.tier]}
								</span>
							</div>
							<h2 class="font-display mt-3 text-lg leading-snug font-bold text-ink">
								{tournament.name}
							</h2>
						</div>
					</div>

					<div class="flex flex-1 flex-col p-5">
						<dl class="space-y-3 text-sm">
							<div class="flex items-start gap-3">
								<CalendarDays class="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
								<div>
									<dt class="text-[10px] font-bold tracking-wide text-ink-faint uppercase">
										Schedule
									</dt>
									<dd class="mt-0.5 text-ink-muted">
										{formatDateRange(tournament.startDate, tournament.endDate)}
									</dd>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<MapPin class="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
								<div>
									<dt class="text-[10px] font-bold tracking-wide text-ink-faint uppercase">
										Region
									</dt>
									<dd class="mt-0.5 text-ink-muted">{tournament.region || 'Global'}</dd>
								</div>
							</div>
							<div class="flex items-start gap-3">
								<Coins class="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
								<div>
									<dt class="text-[10px] font-bold tracking-wide text-ink-faint uppercase">
										Prize Pool
									</dt>
									<dd class="font-mono-stat mt-0.5 font-semibold text-gold">
										{tournament.prizePool || 'TBA'}
									</dd>
								</div>
							</div>
						</dl>

						<div class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
							<div class="inline-flex items-center gap-2 text-xs text-ink-faint">
								{#if tournament.status === 'ongoing'}
									<Radio class="size-4 text-good" aria-hidden="true" /> Live event
								{:else if tournament.status === 'upcoming'}
									<Clock3 class="size-4 text-warning" aria-hidden="true" /> Coming soon
								{:else}
									<CircleCheck class="size-4 text-ink-faint" aria-hidden="true" /> Event ended
								{/if}
							</div>
							<button
								type="button"
								onclick={() => openLiquipedia(tournament.liquipediaUrl)}
								class="inline-flex items-center gap-1.5 rounded-full border border-accent/35 px-3 py-2 text-xs font-bold text-accent transition hover:bg-accent hover:text-bg"
							>
								Liquipedia <ExternalLink class="size-3.5" aria-hidden="true" />
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
