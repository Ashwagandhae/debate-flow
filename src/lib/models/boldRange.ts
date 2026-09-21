// Inline bold ranges for a box's text.
// A range is a half-open interval [start, end) of character offsets that is bold.

export type BoldRange = [number, number];

// sort, drop empty/invalid, merge overlapping or touching
export function normalizeRanges(ranges: BoldRange[]): BoldRange[] {
	const clean = ranges.filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
	const out: BoldRange[] = [];
	for (const [a, b] of clean) {
		const last = out[out.length - 1];
		if (last && a <= last[1]) {
			last[1] = Math.max(last[1], b);
		} else {
			out.push([a, b]);
		}
	}
	return out;
}

function isFullyCovered(ranges: BoldRange[], start: number, end: number): boolean {
	return normalizeRanges(ranges).some(([a, b]) => a <= start && b >= end);
}

function subtract(ranges: BoldRange[], start: number, end: number): BoldRange[] {
	const out: BoldRange[] = [];
	for (const [a, b] of ranges) {
		if (a < start) out.push([a, Math.min(b, start)]);
		if (b > end) out.push([Math.max(a, end), b]);
	}
	return normalizeRanges(out);
}

// toggle bold over [start, end): if the whole selection is already bold, unbold it, else bold it
export function toggleRange(ranges: BoldRange[], start: number, end: number): BoldRange[] {
	if (start >= end) return normalizeRanges(ranges);
	if (isFullyCovered(ranges, start, end)) {
		return subtract(ranges, start, end);
	}
	return normalizeRanges([...ranges, [start, end]]);
}

// shift ranges after a single text edit, diffing old vs new content
export function shiftRanges(oldStr: string, newStr: string, ranges: BoldRange[]): BoldRange[] {
	if (ranges.length === 0) return ranges;
	if (oldStr === newStr) return ranges;

	const maxPrefix = Math.min(oldStr.length, newStr.length);
	let p = 0;
	while (p < maxPrefix && oldStr[p] === newStr[p]) p++;

	let s = 0;
	while (
		s < maxPrefix - p &&
		oldStr[oldStr.length - 1 - s] === newStr[newStr.length - 1 - s]
	) {
		s++;
	}

	const oldEnd = oldStr.length - s; // [p, oldEnd) of oldStr was replaced
	const delta = newStr.length - oldStr.length;

	const shift = (x: number): number => {
		if (x <= p) return x;
		if (x >= oldEnd) return x + delta;
		return p; // endpoint fell inside the edited region
	};

	return normalizeRanges(ranges.map(([a, b]) => [shift(a), shift(b)]));
}

// split content into contiguous {text, bold} segments for rendering
export function toSegments(
	content: string,
	ranges: BoldRange[],
	wholeBold: boolean
): { text: string; bold: boolean }[] {
	const len = content.length;
	if (len === 0) return [];
	const norm = normalizeRanges(ranges)
		.map(([a, b]): BoldRange => [Math.max(0, a), Math.min(len, b)])
		.filter(([a, b]) => b > a);

	const segs: { text: string; bold: boolean }[] = [];
	let i = 0;
	for (const [a, b] of norm) {
		if (a > i) segs.push({ text: content.slice(i, a), bold: wholeBold });
		segs.push({ text: content.slice(a, b), bold: true });
		i = b;
	}
	if (i < len) segs.push({ text: content.slice(i), bold: wholeBold });
	return segs;
}
