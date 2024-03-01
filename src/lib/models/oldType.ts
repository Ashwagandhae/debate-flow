export type OldFlows = OldFlow[];

export type OldFlow = {
	content: string;
	level: number;
	columns: string[];
	invert: boolean;
	focus: boolean;
	index: number;
	lastFocus: number[];
	children: OldBox[];
	history: OldHistory;
	id: number;
};
export type OldBox = {
	content: string;
	children: OldBox[];
	index: number;
	level: number;
	focus: boolean;
	empty?: boolean;
	placeholder?: string;
	crossed?: boolean;
};

type OldActionLabel = 'add' | 'deleteBox' | 'edit' | 'addBox' | 'cross';
type OldAction = {
	type: OldActionLabel;
	path: number[];
	lastFocus: number[] | null;
	nextFocus: number[] | null;
	pending: boolean;
	other: any;
};

export class OldHistory {
	index: number;
	data: OldAction[];
	lastFocus: number[] | null;
	flow: OldFlow;
	constructor(flow: OldFlow) {
		this.index = -1;
		this.data = [];
		this.lastFocus = null;
		this.flow = flow;
	}
}
