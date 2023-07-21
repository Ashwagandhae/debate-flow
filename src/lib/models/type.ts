import type { History } from '$lib/models/store';
import type { DebateStyleKey } from './debateStyle';

export type Flow = {
	content: string;
	level: number;
	columns: string[];
	invert: boolean;
	focus: boolean;
	index: number;
	lastFocus: number[];
	children: Box[];
	history: History;
	id: number;
};
export type Box = {
	content: string;
	children: Box[];
	index: number;
	level: number;
	focus: boolean;
	empty?: boolean;
	placeholder?: string;
	crossed?: boolean;
};

export type Doc = {
	name: string;
	created: Date;
	expire: Date;
	style: DebateStyleKey;
};
