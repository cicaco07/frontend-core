<script lang="ts">
	import { resolve } from '$app/paths';

	const features = [
		{
			title: 'Heroes',
			description: '124+ hero dengan base stats, skill, dan matchup lengkap.',
			href: '/heroes',
			label: 'Lihat Heroes →',
			accent: 'bg-role-marksman/16 text-role-marksman'
		},
		{
			title: 'Builds',
			description: 'Build terbaru dari komunitas, lengkap dengan item & emblem.',
			href: '/builds',
			label: 'Lihat Builds →',
			accent: 'bg-accent-2/16 text-accent-2'
		},
		{
			title: 'Tournaments',
			description: 'Pantau turnamen berjalan dan hasil pertandingan terbaru.',
			href: '/tournaments',
			label: 'Lihat Tournaments →',
			accent: 'bg-secondary/16 text-secondary'
		},
		{
			title: 'Theorycrafter',
			description: 'Hitung damage, DPS, dan versus matchup secara real-time.',
			href: '/theorycrafter',
			label: 'Buka Theorycrafter →',
			accent: 'bg-accent/16 text-accent'
		}
	] as const;
</script>

<section class="mx-auto flex min-h-[460px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:py-20">
	<div class="grid w-full gap-10 lg:grid-cols-[620px_1fr] lg:items-center">
		<div class="space-y-7">
			<p
				class="inline-flex rounded-full border border-line bg-surface/80 px-4 py-1.5 font-display text-xs font-bold tracking-[0.22em] text-accent uppercase"
			>
				MOBILE LEGENDS · THEORYCRAFTING
			</p>
			<div class="space-y-5">
				<h1 class="font-display max-w-[600px] text-5xl leading-[0.96] font-bold tracking-tight text-ink sm:text-7xl">
					Bangun. Bandingkan. Menangkan.
				</h1>
				<p class="max-w-xl text-base leading-8 text-ink-muted">
					Rancang build optimal, hitung damage & ketahanan secara real-time, dan kuasai setiap
					matchup sebelum masuk ke land of dawn.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a
					href={resolve('/theorycrafter')}
					class="rounded-full bg-accent px-6 py-3 text-sm font-bold text-bg shadow-[0_16px_44px_rgb(255_134_91/0.24)] transition hover:-translate-y-0.5 hover:bg-gold"
				>
					Mulai Theorycraft
				</a>
				<a
					href={resolve('/heroes')}
					class="rounded-full border border-line-strong bg-surface/70 px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
				>
					Jelajahi Heroes
				</a>
			</div>
		</div>

		<div class="relative min-h-[348px] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-2xl">
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgb(255_134_91/0.28),transparent_14rem),radial-gradient(circle_at_72%_70%,rgb(179_135_250/0.24),transparent_16rem)]"></div>
			<div class="absolute inset-6 rounded-[1.5rem] border border-line-strong/70 bg-bg/28"></div>
			<p class="font-display absolute left-8 top-8 text-xs tracking-[0.28em] text-ink-faint uppercase">
				hero artwork
			</p>
			<div class="absolute bottom-8 left-8 right-8">
				<div class="h-36 rounded-[1.25rem] border border-accent/30 bg-gradient-to-r from-accent/22 via-surface-2 to-accent-2/18 p-5">
					<p class="font-display text-2xl font-bold text-ink">LAYLA · MALefic Gun</p>
					<p class="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
						Preview damage output, item spikes, dan versus result dalam satu tactical canvas.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
	<div class="mb-7 space-y-2">
		<h2 class="font-display text-2xl font-bold text-ink">Jelajahi Fitur</h2>
		<p class="text-sm text-ink-muted">Pintasan menuju seluruh tools dan database yang tersedia.</p>
	</div>
	<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
		{#each features as feature (feature.href)}
			<a
				href={resolve(feature.href)}
				class="group min-h-[200px] rounded-2xl border border-line bg-surface/82 p-5 transition hover:-translate-y-1 hover:border-accent/60 hover:bg-surface-2"
			>
				<div class={`mb-5 flex size-11 items-center justify-center rounded-xl ${feature.accent}`}>
					<span class="font-display text-lg font-bold">{feature.title.slice(0, 1)}</span>
				</div>
				<h3 class="font-display text-xl font-bold text-ink">{feature.title}</h3>
				<p class="mt-3 max-w-[260px] text-sm leading-6 text-ink-muted">{feature.description}</p>
				<p class="mt-5 text-sm font-semibold text-accent transition group-hover:translate-x-1">
					{feature.label}
				</p>
			</a>
		{/each}
	</div>
</section>
