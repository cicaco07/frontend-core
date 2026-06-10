import { describe, it, expect, afterEach } from 'vitest';
// Importing the layout stylesheet injects the theme variables into the test document.
import './layout.css';

function baseBackgroundFor(theme: 'dark' | 'light' | null): string {
	if (theme === null) {
		document.documentElement.removeAttribute('data-theme');
	} else {
		document.documentElement.setAttribute('data-theme', theme);
	}
	// `:root` sets `background: var(--color-bg)`, so the computed background-color
	// fully resolves the active theme's base surface color.
	return getComputedStyle(document.documentElement).backgroundColor;
}

afterEach(() => {
	document.documentElement.removeAttribute('data-theme');
});

describe('theme selection drives visible colors (Property 1)', () => {
	it('light theme produces a different base color than dark theme', () => {
		const dark = baseBackgroundFor('dark');
		const light = baseBackgroundFor('light');
		// On unfixed code both are the same hardcoded dark value -> this fails,
		// confirming Bug 2. After the fix they must differ.
		expect(light).not.toBe(dark);
	});

	it('default (no data-theme) retains the dark base color (preservation)', () => {
		const explicitDark = baseBackgroundFor('dark');
		const defaultValue = baseBackgroundFor(null);
		expect(defaultValue).toBe(explicitDark);
	});
});
