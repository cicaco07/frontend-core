<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();

	const nav = [
		{ href: '/heroes', label: 'Heroes' },
		{ href: '/builds', label: 'Builds' },
		{ href: '/tournaments', label: 'Tournaments' },
		{ href: '/calculator', label: 'Kalkulator Damage' }
	] as const;

	let theme = $state<'dark' | 'light'>('dark');

	if (browser) {
		const saved = localStorage.getItem('theme');
		if (saved === 'light') {
			theme = 'light';
		}
	}

	$effect(() => {
		if (browser) {
			document.documentElement.setAttribute('data-theme', theme);
		}
	});

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', theme);
	}

	let sidebarCollapsed = $state(false);
	let sidebarMobileOpen = $state(false);

	if (browser) {
		const saved = localStorage.getItem('sidebar-collapsed');
		if (saved === 'true') {
			sidebarCollapsed = true;
		}
	}

	$effect(() => {
		if (browser) {
			localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
		}
	});

	const isLanding = $derived($page.url.pathname === '/');

	let scrolled = $state(false);

	$effect(() => {
		if (!browser || !isLanding) return;
		function onScroll() {
			scrolled = window.scrollY > window.innerHeight * 0.1;
		}
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isLanding}
	<div class="relative min-h-screen bg-bg text-ink">
		<header
			class="fixed inset-x-0 top-0 z-50 transition-all duration-300 {scrolled
				? 'border-b border-line/50 bg-bg/80 backdrop-blur-lg'
				: ''}"
		>
			<nav class="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
				<a
					href={resolve('/')}
					class="font-display text-lg font-bold tracking-[0.18em] text-ink uppercase"
				>
					ML KALKULATOR
				</a>
				<ul class="hidden items-center gap-7 text-[13px] font-medium text-ink-muted md:flex">
					{#each nav as item (item.href)}
						<li>
							<a class="transition hover:text-accent" href={resolve(item.href)}>{item.label}</a>
						</li>
					{/each}
				</ul>
				<button
					type="button"
					onclick={toggleTheme}
					aria-label="Toggle theme"
					class="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-accent hover:text-accent"
				>
					{#if theme === 'dark'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
								clip-rule="evenodd"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
						</svg>
					{/if}
				</button>
			</nav>
		</header>
		<main>
			{@render children()}
		</main>
	</div>
{:else}
	<div class="min-h-screen bg-bg text-ink">
		<Sidebar
			bind:collapsed={sidebarCollapsed}
			bind:mobileOpen={sidebarMobileOpen}
			onMobileClose={() => (sidebarMobileOpen = false)}
			bind:theme
			onThemeToggle={toggleTheme}
		/>
		<main
			class="transition-all duration-300 ease-in-out"
			class:md:ml-[260px]={!sidebarCollapsed}
			class:md:ml-[64px]={sidebarCollapsed}
		>
			{@render children()}
		</main>
	</div>
{/if}
