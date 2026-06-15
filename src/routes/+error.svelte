<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-4 text-center">
	<div class="relative mb-6 select-none">
		<span
			class="font-display block text-[12rem] leading-none font-black tracking-tighter text-accent/8 sm:text-[18rem] md:text-[22rem]"
		>
			{$page.status}
		</span>
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="flex flex-col items-center gap-4">
				<div
					class="flex h-20 w-20 items-center justify-center rounded-2xl border border-line bg-surface-2/80 backdrop-blur-sm"
				>
					{#if $page.status === 404}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-accent"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
							<path d="m9 9 4 4" />
							<path d="m13 9-4 4" />
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-10 w-10 text-negative"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
							/>
							<line x1="12" y1="9" x2="12" y2="13" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
					{/if}
				</div>
				<h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">
					{#if $page.status === 404}
						Halaman Tidak Ditemukan
					{:else}
						Terjadi Kesalahan
					{/if}
				</h1>
			</div>
		</div>
	</div>

	<p class="mb-10 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
		{#if $page.status === 404}
			Halaman yang kamu cari tidak ada atau sudah dipindahkan. Periksa kembali URL-nya atau kembali
			ke beranda.
		{:else}
			{$page.error?.message || 'Sesuatu yang tidak terduga terjadi. Silakan coba lagi nanti.'}
		{/if}
	</p>

	<div class="flex flex-wrap items-center justify-center gap-3">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
			Kembali ke Beranda
		</a>
		<a
			href={resolve('/heroes')}
			class="inline-flex items-center gap-2 rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:border-accent hover:text-accent"
		>
			Lihat Heroes
		</a>
	</div>

	<div class="mt-14 flex items-center gap-2 text-xs text-ink-faint">
		<span class="inline-block h-1.5 w-1.5 rounded-full bg-accent/50"></span>
		<span>Error {$page.status}</span>
	</div>
</div>
