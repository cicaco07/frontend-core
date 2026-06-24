import type { SkillLevelData } from '$lib/types';

/**
 * Returns a hex color based on a stat attribute label.
 */
export function attrValueColor(label: string): string {
	const l = label.toLowerCase().replace(/_/g, ' ');
	if (l.includes('physical') || l.includes('attack') || l.includes('base damage'))
		return '#ffb86b';
	if (l.includes('magic') || l.includes('mana')) return '#a78bfa';
	if (l.includes('true') || l.includes('pure')) return '#f4f7ff';
	if (l.includes('hp') || l.includes('health') || l.includes('regen')) return '#5fb38a';
	if (l.includes('defense') || l.includes('armour') || l.includes('armor')) return '#c2724a';
	if (l.includes('speed') || l.includes('movement')) return '#c9a24a';
	if (l.includes('cooldown') || l.includes('cd')) return '#89e0eb';
	return '#e2e8f0';
}

/**
 * Wraps a value in a colored span based on its attribute label.
 */
export function colorizeValue(value: string, label: string): string {
	const color = attrValueColor(label);
	const escaped = value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return `<span style="color:${color};font-weight:700">${escaped}</span>`;
}

/**
 * Processes text by applying a function to content outside HTML tags.
 */
export function processOutsideTags(text: string, fn: (segment: string) => string): string {
	return text.replace(/(<[^>]*>)|([^<]+)/g, (full, tag: string, content: string) => {
		if (tag) return tag;
		return fn(content);
	});
}

/**
 * Highlights numbers (including + prefix and % suffix) in text.
 */
export function highlightNumbers(text: string): string {
	return processOutsideTags(text, (segment) =>
		segment.replace(
			/(\+?\d+\.?\d*%?)/g,
			(match) => `<span style="color:#ffb86b;font-weight:700">${match}</span>`
		)
	);
}

/**
 * Colorizes known stat keywords (Physical Attack, Magic Power, HP, etc.) in text.
 */
export function colorizeKeywords(text: string): string {
	const keywords: { pattern: RegExp; color: string }[] = [
		{ pattern: /Physical Attack|Physical Damage/gi, color: '#ffb86b' },
		{ pattern: /Magic Power|Magic Damage|Magical Damage/gi, color: '#a78bfa' },
		{ pattern: /True Damage/gi, color: '#f4f7ff' },
		{ pattern: /HP|Health Points/gi, color: '#5fb38a' },
		{ pattern: /Physical Defense|Magic Defense|Armor/gi, color: '#c2724a' },
		{ pattern: /Movement Speed/gi, color: '#c9a24a' },
		{ pattern: /Cooldown/gi, color: '#89e0eb' }
	];
	return processOutsideTags(text, (segment) => {
		let result = segment;
		for (const kw of keywords) {
			result = result.replace(
				kw.pattern,
				(match) => `<span style="color:${kw.color};font-weight:600">${match}</span>`
			);
		}
		return result;
	});
}

/**
 * Replaces `{{attributeName}}` placeholders in skill descriptions with
 * the actual attribute value from levelData, with color formatting.
 */
export function replaceAttributePlaceholders(
	text: string,
	levelData: SkillLevelData[] | undefined,
	level: number
): string {
	if (!levelData || levelData.length === 0) return colorizeKeywords(highlightNumbers(text));
	const targetLevel = levelData.find((l) => l.level === level) ?? levelData[0];
	if (!targetLevel) return colorizeKeywords(highlightNumbers(text));
	const replaced = text.replace(/\{\{(\w+)\}\}/g, (_match, attrName: string) => {
		const normalized = attrName.toLowerCase().replace(/_/g, ' ');
		const entry = targetLevel.attributes.find(
			(a) => a.label.toLowerCase().replace(/_/g, ' ') === normalized
		);
		return entry ? colorizeValue(entry.value, entry.label) : `{{${attrName}}}`;
	});
	return colorizeKeywords(highlightNumbers(replaced));
}
