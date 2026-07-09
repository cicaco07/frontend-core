<script lang="ts">
	import { resolve } from '$app/paths';
	import heroImage from '$lib/../assets/landing/novaria.jpg';
	import heroMiya from '$lib/assets/landing/db/hero-miya.png';
	import heroBalmond from '$lib/assets/landing/db/hero-balmond.png';
	import heroSaber from '$lib/assets/landing/db/hero-saber.png';
	import heroAlice from '$lib/assets/landing/db/hero-alice.png';
	import itemAntiqueCuirass from '$lib/assets/landing/db/item-antique-cuirass.png';
	import itemArcaneBoots from '$lib/assets/landing/db/item-arcane-boots.png';
	import itemAresBelt from '$lib/assets/landing/db/item-ares-belt.png';
	import itemAthenaShield from '$lib/assets/landing/db/item-athena-s-shield.png';
	import itemAzureBlade from '$lib/assets/landing/db/item-azure-blade.png';
	import itemAllowThrow from '$lib/assets/landing/db/item-allow-throw.png';

	const heroPreview = [
		{ name: 'Miya', image: heroMiya },
		{ name: 'Balmond', image: heroBalmond },
		{ name: 'Saber', image: heroSaber },
		{ name: 'Alice', image: heroAlice }
	] as const;
	const itemPreview = [
		{ name: 'Antique Cuirass', image: itemAntiqueCuirass },
		{ name: 'Arcane Boots', image: itemArcaneBoots },
		{ name: 'Ares Belt', image: itemAresBelt },
		{ name: "Athena's Shield", image: itemAthenaShield },
		{ name: 'Azure Blade', image: itemAzureBlade },
		{ name: 'Allow Throw', image: itemAllowThrow }
	] as const;

	const features = [
		{
			title: 'Database Hero Lengkap & Build Terbaru',
			desc: 'Temukan statistik lengkap, role, lane, item, emblem, dan inspirasi build untuk 124+ hero.',
			href: '/heroes',
			cta: 'Lihat Semua Hero →'
		},
		{
			title: 'Kalkulator Damage Real-Time',
			desc: 'Simulasikan damage, ketahanan, skill level, item, emblem, dan target lawan dalam satu workspace.',
			href: '/calculator',
			cta: 'Coba Kalkulator →'
		},
		{
			title: 'Analisis Turnamen & Meta',
			desc: 'Pantau tren kompetitif, matchup populer, dan pola build dari scene Mobile Legends.',
			href: '/tournaments',
			cta: 'Lihat Turnamen →'
		}
	] as const;
</script>

<section class="relative isolate flex min-h-screen items-center overflow-hidden px-4 pt-24 pb-16 sm:px-6 lg:pt-20">
	<img src={heroImage} alt="" class="absolute inset-0 -z-20 h-full w-full object-cover object-[75%_center] opacity-45" />
	<div class="absolute inset-0 -z-10 bg-linear-to-r from-bg via-bg/90 to-bg/45"></div>
	<div class="absolute top-28 right-4 -z-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl"></div>

	<div class="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="space-y-7">
			<p class="font-display inline-flex rounded-full border border-accent/30 bg-surface/75 px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-accent uppercase backdrop-blur">
				Mobile Legends · Damage Calculator
			</p>
			<div class="space-y-5">
				<h1 class="font-display max-w-2xl text-5xl leading-[0.94] font-black tracking-tight text-ink uppercase sm:text-7xl lg:text-8xl">
					Bangun.<br />Bandingkan.<br />Menangkan.
				</h1>
				<p class="max-w-xl text-base leading-8 text-ink-muted sm:text-lg">
					Rancang build optimal, hitung damage & ketahanan secara real-time, dan kuasai
					setiap matchup sebelum masuk ke Land of Dawn.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a href={resolve('/calculator')} class="rounded-full bg-accent px-6 py-3 text-sm font-bold text-bg shadow-[0_18px_48px_rgb(255_134_91/0.28)] transition hover:-translate-y-0.5 hover:bg-gold">
					Mulai Kalkulator
				</a>
				<a href={resolve('/heroes')} class="rounded-full border border-accent/45 bg-surface/55 px-6 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:border-accent hover:text-accent">
					Jelajahi Heroes
				</a>
			</div>
		</div>

		<div class="relative mx-auto w-full max-w-2xl lg:rotate-2">
			<div class="absolute inset-0 rounded-[2rem] bg-accent/20 blur-2xl"></div>
			<div class="relative overflow-hidden rounded-[2rem] border border-line-strong/60 bg-surface/78 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl">
				<div class="mb-4 flex items-center justify-between">
					<div>
						<p class="font-display text-lg font-bold text-ink">Kalkulator Damage</p>
						<p class="text-xs text-ink-muted">Lancelot vs Alpha</p>
					</div>
					<span class="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Live Sim</span>
				</div>

				<div class="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
					<div class="rounded-2xl border border-line bg-bg/60 p-4">
						<img src={heroSaber} alt="Lancelot preview" class="mx-auto size-20 rounded-full border border-accent/30 object-cover" />
						<p class="mt-3 text-center font-bold text-ink">Lancelot</p>
						<p class="text-center text-xs text-ink-muted">Hero</p>
						<div class="mt-4 grid grid-cols-3 gap-2">
							{#each itemPreview as item (item.name)}
								<span class="aspect-square overflow-hidden rounded-xl border border-line bg-surface-3 shadow-inner" title={item.name}>
									<img src={item.image} alt={item.name} class="h-full w-full object-cover" loading="lazy" />
								</span>
							{/each}
						</div>
					</div>
					<div class="flex items-center justify-center"><span class="rounded-full border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-black text-accent">VS</span></div>
					<div class="rounded-2xl border border-line bg-bg/60 p-4">
						<img src={heroBalmond} alt="Alpha preview" class="mx-auto size-20 rounded-full border border-magic/30 object-cover" />
						<p class="mt-3 text-center font-bold text-ink">Alpha</p>
						<p class="text-center text-xs text-ink-muted">Target</p>
						<div class="mt-4 grid grid-cols-3 gap-2">
							{#each itemPreview.toReversed() as item (item.name)}
								<span class="aspect-square overflow-hidden rounded-xl border border-line bg-surface-3 shadow-inner" title={item.name}>
									<img src={item.image} alt={item.name} class="h-full w-full object-cover" loading="lazy" />
								</span>
							{/each}
						</div>
					</div>
				</div>

				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div class="rounded-2xl border border-line bg-bg/60 p-4">
						<p class="text-xs font-bold text-ink-muted uppercase">Total Item Stats (Hero)</p>
						<div class="mt-3 space-y-2 text-sm"><p class="flex justify-between"><span>Physical ATK</span><b class="text-good">+65</b></p><p class="flex justify-between"><span>CD Reduction</span><b class="text-good">+15%</b></p></div>
					</div>
					<div class="rounded-2xl border border-line bg-bg/60 p-4">
						<p class="text-xs font-bold text-ink-muted uppercase">Damage Output</p>
						<p class="font-mono-stat mt-2 text-3xl font-black text-accent">1,250.5</p>
						<p class="text-xs text-ink-muted">estimated DPS</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="px-4 py-16 sm:px-6">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
			<div>
				<p class="font-display text-xs font-bold tracking-[0.2em] text-accent uppercase">Fitur Utama</p>
				<h2 class="font-display mt-2 text-3xl font-bold text-ink sm:text-4xl">Theorycraft dalam satu dashboard</h2>
			</div>
			<a href={resolve('/builds')} class="text-sm font-semibold text-accent hover:text-gold">Lihat Builds →</a>
		</div>

		<div class="grid gap-5 lg:grid-cols-3">
			{#each features as feature, i (feature.title)}
				<article class="group overflow-hidden rounded-3xl border border-line bg-surface/75 p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-accent/40">
					<div class="mb-5 rounded-2xl border border-line bg-bg/60 p-4">
						{#if i === 0}
							<div class="grid grid-cols-3 gap-2">
								{#each heroPreview.slice(0, 3) as hero (hero.name)}
									<div class="rounded-xl bg-surface-3 p-2 text-center">
										<img src={hero.image} alt={hero.name} class="mx-auto mb-2 size-14 rounded-xl object-cover" loading="lazy" />
										<p class="truncate text-xs font-semibold">{hero.name}</p>
									</div>
								{/each}
							</div>
						{:else if i === 1}
							<div class="flex items-center justify-between gap-4">
								<img src={heroAlice} alt="Hero damage preview" class="size-16 rounded-2xl object-cover" loading="lazy" />
								<div class="flex gap-2">
									{#each itemPreview.slice(0, 3) as item (item.name)}
										<img src={item.image} alt={item.name} class="size-9 rounded-lg object-cover" loading="lazy" />
									{/each}
								</div>
								<div><p class="text-xs text-ink-muted">Skill Damage</p><p class="font-mono-stat text-4xl font-black text-accent">461.4</p></div>
							</div>
						{:else}
							<div class="flex items-center justify-center gap-4 py-5"><b class="text-secondary">RRQ</b><span class="rounded-full bg-secondary/15 px-3 py-1 text-xs text-secondary">VS</span><b class="text-secondary">ONIC</b></div>
						{/if}
					</div>
					<h3 class="font-display text-xl font-bold text-ink">{feature.title}</h3>
					<p class="mt-3 min-h-20 text-sm leading-7 text-ink-muted">{feature.desc}</p>
					<a href={resolve(feature.href)} class="mt-4 inline-flex text-sm font-bold text-accent transition group-hover:text-gold">{feature.cta}</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<footer class="border-t border-line px-4 py-8 sm:px-6">
	<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-ink-muted">
		<div class="flex gap-5"><a href={resolve('/')} class="hover:text-accent">Privacy Policy</a><a href={resolve('/')} class="hover:text-accent">Terms of Service</a><a href={resolve('/')} class="hover:text-accent">Contact</a></div>
		<p>© 2024 ML Theorycraft. All rights reserved.</p>
	</div>
</footer>
