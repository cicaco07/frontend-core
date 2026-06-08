<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const nav = [
		{ href: '/heroes', label: 'Heroes' },
		{ href: '/items', label: 'Items' },
		{ href: '/emblems', label: 'Emblems' },
		{ href: '/builds', label: 'Builds' },
		{ href: '/tournaments', label: 'Tournaments' },
		{ href: '/stats', label: 'Stats' },
		{ href: '/theorycrafter', label: 'Theorycrafter' }
	] as const;
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-slate-950 text-slate-100">
	<header class="border-b border-slate-800">
		<nav class="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
			<a href={resolve('/')} class="text-lg font-bold tracking-tight">ML Theorycraft</a>
			<ul class="flex flex-wrap gap-4 text-sm text-slate-300">
				{#each nav as item (item.href)}
					<li><a class="hover:text-white" href={resolve(item.href)}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
