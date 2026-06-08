<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const nav = [
		{ href: '/heroes', label: 'Heroes' },
		{ href: '/builds', label: 'Builds' },
		{ href: '/tournaments', label: 'Tournaments' },
		{ href: '/theorycrafter', label: 'Theorycrafter' }
	] as const;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-bg text-ink">
	<header class="sticky top-0 z-50 border-b border-line bg-bg/82 backdrop-blur-xl">
		<nav class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
			<a
				href={resolve('/')}
				class="font-display text-lg font-bold tracking-[0.18em] text-ink uppercase"
			>
				ML THEORYCRAFT
			</a>
			<ul class="hidden items-center gap-7 text-[13px] font-medium text-ink-muted md:flex">
				{#each nav as item (item.href)}
					<li>
						<a class="transition hover:text-accent" href={resolve(item.href)}>{item.label}</a>
					</li>
				{/each}
			</ul>
			<a
				href={resolve('/theorycrafter')}
				class="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-bg"
			>
				Mulai
			</a>
		</nav>
	</header>
	<main>
		{@render children()}
	</main>
</div>
