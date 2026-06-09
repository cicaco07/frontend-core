<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import {
		Swords,
		Wrench,
		Trophy,
		Package,
		Shield,
		BarChart3,
		Calculator,
		ChevronLeft,
		ChevronRight,
		Menu,
		Sun,
		Moon
	} from 'lucide-svelte';

	let {
		collapsed = $bindable(false),
		mobileOpen = $bindable(false),
		onMobileClose = () => {},
		theme = $bindable<'dark' | 'light'>('dark'),
		onThemeToggle = () => {}
	}: {
		collapsed?: boolean;
		mobileOpen?: boolean;
		onMobileClose?: () => void;
		theme?: 'dark' | 'light';
		onThemeToggle?: () => void;
	} = $props();

	const nav = [
		{ href: '/heroes', label: 'Heroes', icon: Swords },
		{ href: '/builds', label: 'Builds', icon: Wrench },
		{ href: '/tournaments', label: 'Tournaments', icon: Trophy },
		{ href: '/items', label: 'Items', icon: Package },
		{ href: '/emblems', label: 'Emblems', icon: Shield },
		{ href: '/stats', label: 'Stats', icon: BarChart3 },
		{ href: '/theorycrafter', label: 'Theorycrafter', icon: Calculator }
	] as const;

	function isActive(href: string): boolean {
		return $page.url.pathname.startsWith(href);
	}
</script>

<button
	type="button"
	onclick={() => (mobileOpen = !mobileOpen)}
	class="btn fixed top-4 left-4 z-50 btn-square btn-ghost md:hidden"
	aria-label="Toggle navigation"
>
	<Menu class="size-5" />
</button>
{#if mobileOpen}
	<button
		type="button"
		onclick={onMobileClose}
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		aria-label="Close navigation"
	></button>
	<aside
		class="fixed top-0 left-0 z-50 flex h-full w-[260px] flex-col border-r border-line bg-surface shadow-2xl md:hidden"
	>
		<div class="flex h-16 items-center border-b border-line px-5">
			<a
				href={resolve('/')}
				class="font-display text-base font-bold tracking-[0.18em] text-ink uppercase"
			>
				ML THEORYCRAFT
			</a>
		</div>
		<nav class="flex-1 space-y-1 overflow-y-auto p-3">
			{#each nav as { href, label, icon: Icon } (href)}
				<a
					href={resolve(href)}
					class="btn flex w-full items-center justify-start gap-3 text-sm font-medium btn-ghost {isActive(
						href
					)
						? 'bg-accent/10 text-accent'
						: ''}"
					onclick={onMobileClose}
				>
					<Icon class="size-5 shrink-0" />
					{label}
				</a>
			{/each}
		</nav>
		<div class="border-t border-line p-3">
			<button
				type="button"
				onclick={onThemeToggle}
				class="btn flex w-full items-center justify-start gap-3 text-sm font-medium btn-ghost"
			>
				{#if theme === 'dark'}
					<Sun class="size-5 shrink-0" />
				{:else}
					<Moon class="size-5 shrink-0" />
				{/if}
				Theme
			</button>
		</div>
	</aside>
{/if}
<aside
	class="fixed top-0 left-0 z-40 hidden h-full flex-col overflow-hidden border-r border-line bg-surface transition-all duration-300 ease-in-out md:flex"
	class:w-[260px]={!collapsed}
	class:w-[64px]={collapsed}
>
	<div
		class="flex h-16 shrink-0 items-center border-b border-line {collapsed
			? 'justify-center px-0'
			: 'px-5'}"
	>
		<a
			href={resolve('/')}
			class="font-display font-bold tracking-[0.18em] text-ink uppercase"
			class:text-lg={!collapsed}
			class:text-xs={collapsed}
		>
			{collapsed ? 'ML' : 'ML THEORYCRAFT'}
		</a>
	</div>
	<nav class="flex-1 space-y-1 overflow-y-auto p-2">
		{#each nav as { href, label, icon: Icon } (href)}
			<a
				href={resolve(href)}
				class={[
					'btn flex w-full items-center text-sm font-medium btn-ghost transition-colors',
					collapsed ? 'justify-center px-0' : 'justify-start gap-3 px-3',
					isActive(href) ? 'bg-accent/10 text-accent' : ''
				].join(' ')}
				title={collapsed ? label : undefined}
			>
				<Icon class="size-5 shrink-0" />
				{#if !collapsed}
					<span>{label}</span>
				{/if}
			</a>
		{/each}
	</nav>
	<div class="border-t border-line p-2">
		<button
			type="button"
			onclick={() => (collapsed = !collapsed)}
			class="btn btn-ghost btn-square size-10 flex items-center justify-center mx-auto"
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			{#if collapsed}
				<ChevronRight class="size-4" />
			{:else}
				<ChevronLeft class="size-4" />
			{/if}
		</button>
	</div>
	<div class="border-t border-line p-2">
		<button
			type="button"
			onclick={onThemeToggle}
			class="btn flex w-full items-center text-sm font-medium btn-ghost {collapsed
				? 'justify-center px-0'
				: 'justify-start gap-3 px-3'}"
		>
			{#if theme === 'dark'}
				<Sun class="size-5 shrink-0" />
			{:else}
				<Moon class="size-5 shrink-0" />
			{/if}
			{#if !collapsed}
				<span>Theme</span>
			{/if}
		</button>
	</div>
</aside>
