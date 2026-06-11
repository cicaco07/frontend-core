<script lang="ts">
	import { resolve } from '$app/paths';
	import heroImage from '$lib/../assets/landing/novaria.jpg';
	import miyaImage from '$lib/../assets/landing/Miya_upscayl_1x_upscayl-standard-4x.png';
</script>

<section class="relative min-h-screen overflow-hidden">
	<div class="absolute inset-0 z-0">
		<img src={heroImage} alt="" class="h-full w-full object-cover object-[75%_center]" />
		<div class="absolute inset-0 bg-linear-to-r from-bg via-bg/85 to-bg/15"></div>
	</div>

	<div class="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pt-14 sm:px-6">
		<div class="max-w-xl space-y-7">
			<p
				class="font-display inline-flex rounded-full border border-line bg-surface/80 px-4 py-1.5 text-xs font-bold tracking-[0.22em] text-accent uppercase"
			>
				MOBILE LEGENDS · KALKULATOR DAMAGE
			</p>
			<div class="space-y-5">
				<h1
					class="font-display max-w-[600px] text-5xl leading-[0.96] font-bold tracking-tight text-ink sm:text-7xl"
				>
					Bangun. Bandingkan. Menangkan.
				</h1>
				<p class="max-w-xl text-base leading-8 text-ink-muted">
					Rancang build optimal, hitung damage & ketahanan secara real-time, dan kuasai setiap
					matchup sebelum masuk ke land of dawn.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<a
					href={resolve('/calculator')}
					class="rounded-full bg-accent px-6 py-3 text-sm font-bold text-bg shadow-[0_16px_44px_rgb(255_134_91/0.24)] transition hover:-translate-y-0.5 hover:bg-gold"
				>
					Mulai Kalkulator
				</a>
				<a
					href={resolve('/heroes')}
					class="rounded-full border border-line-strong bg-surface/70 px-6 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
				>
					Jelajahi Heroes
				</a>
			</div>
		</div>
	</div>
</section>

<section class="relative min-h-screen overflow-hidden">
	<div class="mx-auto grid min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:grid-cols-2">
		<div class="space-y-6 py-20">
			<p
				class="font-display inline-flex rounded-full border border-role-marksman/30 bg-role-marksman/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-role-marksman uppercase"
			>
				Database
			</p>
			<h2 class="font-display text-4xl leading-tight font-bold text-ink sm:text-5xl">
				124+ Hero Lengkap
			</h2>
			<p class="max-w-md text-base leading-7 text-ink-muted">
				Base stats, skill scaling, role, lane, dan matchup untuk seluruh hero Mobile Legends. Saring
				berdasarkan role atau cari langsung.
			</p>
			<a
				href={resolve('/heroes')}
				class="inline-block rounded-full border border-role-marksman/40 bg-role-marksman/10 px-5 py-2.5 text-sm font-semibold text-role-marksman transition hover:bg-role-marksman hover:text-white"
			>
				Lihat Heroes →
			</a>
		</div>
		<div class="relative flex items-center justify-center py-12">
			<div class="relative w-full max-w-md">
				<div
					class="absolute inset-0 scale-95 -rotate-3 rounded-3xl bg-role-marksman/10 blur-2xl"
				></div>
				<img
					src={miyaImage}
					alt="Miya"
					class="relative w-full rounded-2xl object-cover shadow-2xl shadow-black/30"
				/>
			</div>
		</div>
	</div>
</section>

<section class="relative min-h-screen overflow-hidden">
	<div class="mx-auto grid min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:grid-cols-2">
		<div class="relative flex items-center justify-center py-12 lg:order-first">
			<div class="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-line">
				<div
					class="absolute inset-0 bg-linear-to-br from-accent-2/20 via-surface-3 to-accent-2/5"
				></div>
				<div
					class="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
				>
					<div class="flex gap-3">
						<span class="size-14 rounded-xl border border-line bg-surface-3"></span>
						<span class="size-14 rounded-xl border border-line bg-surface-3"></span>
						<span class="size-14 rounded-xl border border-line bg-surface-3"></span>
						<span class="size-14 rounded-xl border border-line bg-surface-3"></span>
						<span class="size-14 rounded-xl border border-line bg-surface-3"></span>
					</div>
					<span class="size-16 rounded-full border-2 border-dashed border-accent-2/40"></span>
					<div class="space-y-1.5">
						<div class="h-2 w-24 rounded bg-accent-2/20"></div>
						<div class="h-2 w-16 rounded bg-accent-2/10"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="space-y-6 py-20">
			<p
				class="font-display inline-flex rounded-full border border-accent-2/30 bg-accent-2/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-accent-2 uppercase"
			>
				Community
			</p>
			<h2 class="font-display text-4xl leading-tight font-bold text-ink sm:text-5xl">
				Build Terbaru
			</h2>
			<p class="max-w-md text-base leading-7 text-ink-muted">
				Browse build populer dari komunitas beserta item dan emblem yang digunakan. Temukan
				inspirasi untuk hero favoritmu.
			</p>
			<a
				href={resolve('/builds')}
				class="inline-block rounded-full border border-accent-2/40 bg-accent-2/10 px-5 py-2.5 text-sm font-semibold text-accent-2 transition hover:bg-accent-2 hover:text-white"
			>
				Lihat Builds →
			</a>
		</div>
	</div>
</section>

<section class="relative min-h-screen overflow-hidden">
	<div class="mx-auto grid min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:grid-cols-2">
		<div class="space-y-6 py-20">
			<p
				class="font-display inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-accent uppercase"
			>
				Interactive
			</p>
			<h2 class="font-display text-4xl leading-tight font-bold text-ink sm:text-5xl">
				Kalkulator Damage
			</h2>
			<p class="max-w-md text-base leading-7 text-ink-muted">
				Hitung damage, DPS, dan output build secara real-time. Bandingkan dua build berdampingan
				untuk menemukan counter yang tepat.
			</p>
			<a
				href={resolve('/calculator')}
				class="inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-bg shadow-[0_8px_24px_rgb(255_134_91/0.2)] transition hover:-translate-y-0.5 hover:bg-gold"
			>
				Buka Kalkulator →
			</a>
		</div>
		<div class="relative flex items-center justify-center py-12">
			<div class="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-line">
				<div
					class="absolute inset-0 bg-linear-to-br from-accent/15 via-surface-3 to-accent/5"
				></div>
				<div class="relative flex h-full flex-col items-center justify-center gap-5 p-8">
					<div class="flex gap-3">
						<span class="size-12 rounded-xl border border-accent/30 bg-accent/10"></span>
						<span
							class="flex size-12 items-center justify-center rounded-xl border border-accent/50 bg-accent/20 text-xl text-accent"
							>×</span
						>
						<span class="size-12 rounded-xl border border-accent/30 bg-accent/10"></span>
					</div>
					<div class="text-center">
						<p class="font-display text-2xl font-bold text-accent">1 250.5</p>
						<p class="text-xs text-ink-muted">DPS Output</p>
					</div>
					<div class="flex gap-2">
						<span class="h-2 w-8 rounded bg-accent/30"></span>
						<span class="h-2 w-8 rounded bg-accent/15"></span>
						<span class="h-2 w-8 rounded bg-accent/30"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="relative min-h-screen overflow-hidden">
	<div class="mx-auto grid min-h-screen max-w-7xl items-center px-4 sm:px-6 lg:grid-cols-2">
		<div class="relative flex items-center justify-center py-12 lg:order-first">
			<div class="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-line">
				<div
					class="absolute inset-0 bg-linear-to-br from-secondary/15 via-surface-3 to-secondary/5"
				></div>
				<div class="relative flex h-full flex-col items-center justify-center gap-5 p-8">
					<div class="flex gap-4">
						<div class="text-center">
							<p class="font-display text-lg font-bold text-secondary">RRQ</p>
							<p class="text-xs text-ink-muted">3</p>
						</div>
						<span class="font-display text-sm text-ink-faint">vs</span>
						<div class="text-center">
							<p class="font-display text-lg font-bold text-secondary">ONIC</p>
							<p class="text-xs text-ink-muted">2</p>
						</div>
					</div>
					<div class="w-full space-y-2">
						<div class="h-2 w-full rounded bg-secondary/20"></div>
						<div class="h-2 w-3/4 rounded bg-secondary/10"></div>
						<div class="h-2 w-full rounded bg-secondary/20"></div>
						<div class="h-2 w-2/3 rounded bg-secondary/10"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="space-y-6 py-20">
			<p
				class="font-display inline-flex rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-secondary uppercase"
			>
				Esports
			</p>
			<h2 class="font-display text-4xl leading-tight font-bold text-ink sm:text-5xl">
				Pantau Turnamen
			</h2>
			<p class="max-w-md text-base leading-7 text-ink-muted">
				Turnamen berjalan, hasil pertandingan terbaru, dan statistik tim dari scene kompetitif
				Mobile Legends.
			</p>
			<a
				href={resolve('/tournaments')}
				class="inline-block rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:bg-secondary hover:text-white"
			>
				Lihat Tournaments →
			</a>
		</div>
	</div>
</section>
