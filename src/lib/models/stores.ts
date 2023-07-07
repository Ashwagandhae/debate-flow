import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { Box, Flow } from './types';
import { settings } from '$lib/models/settings';

export const tutorialStep = writable(0);
export const activeMouse = writable(true);
export const flows: Writable<Flow[]> = writable([]);
export const selected = writable(0);
export const changesSaved = writable(false);
export const tooltipState = writable({
	open: false,
	claimed: false
});
const debateStyles: {
	[key: string]: {
		[key: string]: { columns: string[]; invert: boolean };
	};
} = {
	policy: {
		aff: {
			columns: ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
			invert: false
		},
		neg: {
			columns: ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
			invert: true
		}
	},
	publicForum: {
		aff: {
			columns: ['1AC', '1NC', '2AC', '2NC', 'AS', 'NS', 'AFF', 'NFF'],
			invert: false
		},
		neg: {
			columns: ['1NC', '1AC', '2NC', '2AC', 'AS', 'NS', 'AFF', 'NFF'],
			invert: true
		}
	},
	lincolnDouglas: {
		aff: {
			columns: ['AC', 'NC', '1AR', '1NR', '2AR'],
			invert: false
		},
		neg: {
			columns: ['NC', '1AR', '1NR', '2AR'],
			invert: true
		}
	}
};
const debateStyleIndex = ['policy', 'publicForum', 'lincolnDouglas'];

let $flows: Flow[];
flows.subscribe((value) => {
	$flows = value;
});

export function newBox(index: number, level: number, focus: boolean) {
	return <Box>{
		content: '',
		children: [],
		index: index,
		level: level,
		focus: focus
	};
}
export function newFlow(index: number, type: string): Flow {
	const currentDebateStyle =
		debateStyles[debateStyleIndex[settings.data.debateStyle.value as number]];
	// get new id
	let id = 0;
	for (let i = 0; i < $flows.length; i++) {
		if ($flows[i].id >= id) {
			id = $flows[i].id + 1;
		}
	}
	const flow: Flow & { history: null } = {
		content: '',
		level: 0,
		columns: currentDebateStyle[type].columns,
		invert: currentDebateStyle[type].invert,
		focus: true,
		index: index,
		lastFocus: [],
		children: [newBox(0, 1, false)],
		history: null,
		id: id
	};
	flow.history = new History(flow);
	return flow;
}

export function boxFromPath(flow: Flow, path: number[], scope = 0): Flow | Box | null {
	if (path.length == 0 && scope >= 1) {
		// can't go up any further
		return null;
	}
	let ret: Flow | Box = flow;
	for (let i = 0; i < path.length - scope; i++) {
		ret = ret?.children[path[i]];
		if (ret == undefined) {
			return null;
		}
	}

	return ret;
}
type Action = {
	type: string;
	path: number[];
	lastFocus: number[] | null;
	nextFocus: number[] | null;
	pending: boolean;
	other: any;
};
export class History {
	index: number;
	data: Action[];
	lastFocus: number[] | null;
	flow: Flow;
	constructor(flow: Flow) {
		this.index = -1;
		this.data = [];
		this.lastFocus = null;
		this.flow = flow;
	}
	lastAction() {
		return this.data[this.index];
	}
	add(type: string, path: number[], other?: any) {
		changesSaved.set(false);
		this.resolveAllPending();
		const action: Action = {
			type: type,
			path: path,
			lastFocus: this.lastFocus == null ? null : [...this.lastFocus],
			nextFocus: null,
			other: other,
			pending: false
		};

		this.data = this.data.slice(0, this.index + 1);
		this.data.push(action);
		this.index = this.data.length - 1;
	}
	addPending(type: string, path: number[], other?: any) {
		changesSaved.set(false);
		this.data = this.data.slice(0, this.index + 1);
		this.data.push({
			type: type,
			path: path,
			lastFocus: null,
			nextFocus: null,
			other: other,
			pending: true
		});
		this.index = this.data.length - 1;
	}
	resolveAllPending() {
		let actionHappened = false;
		const tempData: (null | Action)[] = [...this.data];
		for (let i = 0; i < this.data.length; i++) {
			const pendingAction = this.data[i];
			if (pendingAction.pending) {
				const action: Action = {
					type: pendingAction.type,
					path: pendingAction.path,
					lastFocus: pendingAction.path,
					nextFocus: pendingAction.path,
					other: pendingAction.other,
					pending: false
				};
				let shouldAdd = true;
				if (action.type == 'edit') {
					action.other.lastContent = pendingAction.other.lastContent;
					action.other.nextContent = pendingAction.other.getNextContent();
					if (action.other.lastContent == action.other.nextContent) {
						shouldAdd = false;
					}
					pendingAction.other.createEditBreak();
				}
				if (shouldAdd) {
					actionHappened = true;
					tempData[i] = action;
				} else {
					tempData[i] = null;
					if (this.index >= i) {
						this.index -= 1;
					}
				}
			}
		}
		this.data = tempData.filter((el) => el != null) as Action[];
		if (actionHappened) {
			console.log('resolving all pending');
		}
	}
	addFocus(path: number[]) {
		this.lastFocus = path;
		if (this.lastAction()) {
			if (this.lastAction().nextFocus == undefined) {
				this.lastAction().nextFocus = path;
			}
		}
	}
	undoAction(action: Action) {
		console.log('undo', this.index, this.data);

		// do opposite of action
		if (action.type == 'add' || action.type == 'delete') {
			const parent: Flow | Box | null = boxFromPath(this.flow, action.path, 1);
			if (parent == null) {
				throw new Error(`parent of box at path ${action.path} is null`);
			}
			const childIndex: number = action.path[action.path.length - 1];
			const children: Box[] = [...parent.children];
			if (action.type == 'add') {
				children.splice(childIndex, 1);
			} else if (action.type == 'delete') {
				children.splice(childIndex, 0, action.other.box);
			}
			// fix index
			for (let i = childIndex; i < children.length; i++) {
				children[i].index = i;
			}
			parent.children = [...children];
		} else if (action.type == 'edit') {
			const box: Flow | Box | null = boxFromPath(this.flow, action.path);
			if (box == null) {
				throw new Error(`box at path ${action.path} is null`);
			}
			box.content = action.other.lastContent;
		}
	}
	redoAction(action: Action) {
		console.log('redo', this.index, this.data);

		// do opposite of action
		if (action.type == 'add' || action.type == 'delete') {
			const parent: Flow | Box | null = boxFromPath(this.flow, action.path, 1);
			const childIndex: number = action.path[action.path.length - 1];
			if (parent == null) {
				throw new Error(`parent of box at path ${action.path} is null`);
			}
			const children: Box[] = [...parent.children];
			if (action.type == 'add') {
				children.splice(childIndex, 0, newBox(childIndex, parent.level + 1, false));
			} else if (action.type == 'delete') {
				children.splice(childIndex, 1);
			}
			// fix index
			for (let i = childIndex; i < children.length; i++) {
				children[i].index = i;
			}
			parent.children = [...children];
		} else if (action.type == 'edit') {
			const box: Flow | Box | null = boxFromPath(this.flow, action.path);
			if (box == null) {
				throw new Error(`box at path ${action.path} is null`);
			}
			box.content = action.other.nextContent;
		}
	}
	focus(path: number[] | null) {
		if (path == null) return;
		const box = boxFromPath(this.flow, path);
		if (box != null) {
			box.focus = true;
		}
	}
	undo() {
		// resolve any pending changes if not in history
		this.resolveAllPending();
		if (this.index > -1) {
			const action = this.lastAction();
			this.undoAction(action);
			this.focus(action.lastFocus); // assume its not null because of index
			flows.set($flows);
			this.index -= 1;
		}
	}
	redo() {
		// resolve any pending changes if not in history
		this.resolveAllPending();
		if (this.index < this.data.length - 1) {
			this.index += 1;
			const action = this.lastAction();
			this.redoAction(action);
			this.focus(action.nextFocus); // assume its not null because of index
			flows.set($flows);
		}
	}
}
