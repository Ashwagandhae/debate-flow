import type { History } from '$lib/models/stores';

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
};

export type DebateStyle = {
	primary: {
		name: string;
		columns: string[];
		columnsSwitch?: string[];
		invert: boolean;
		starterBoxes?: string[];
	};
	secondary?: {
		name: string;
		columns: string[];
		columnsSwitch?: string[];
		invert: boolean;
		starterBoxes?: string[];
	};
};
