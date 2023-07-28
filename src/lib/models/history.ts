import type { Box, Flow } from './type';
import { boxFromPath, newBox } from './flow';
import { flowsChange, flows } from './store';

// TODO better deep clone
export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

let $flows: Flow[];
flows.subscribe((value) => {
	$flows = value;
});

type ActionLabel = 'add' | 'deleteBox' | 'edit' | 'addBox' | 'cross';
type Action = {
	type: ActionLabel;
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
	add(type: ActionLabel, path: number[], other?: any) {
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
		flowsChange();
	}
	addPending(type: ActionLabel, path: number[], other?: any) {
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
		flowsChange();
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
		if (action.type == 'add' || action.type == 'addBox' || action.type == 'deleteBox') {
			const parent: Flow | Box | null = boxFromPath(this.flow, action.path, 1);
			if (parent == null) {
				throw new Error(`parent of box at path ${action.path} is null`);
			}
			const childIndex: number = action.path[action.path.length - 1];
			const children: Box[] = [...parent.children];
			if (action.type == 'add' || action.type == 'addBox') {
				children.splice(childIndex, 1);
			} else if (action.type == 'deleteBox') {
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
		} else if (action.type == 'cross') {
			// assume Box isn't Flow
			const box: Box | null = boxFromPath(this.flow, action.path) as Box | null;
			if (box == null) {
				throw new Error(`box at path ${action.path} is null`);
			}
			box.crossed = !action.other.crossed;
		}
	}
	redoAction(action: Action) {
		console.log('redo', this.index, this.data);

		// do opposite of action
		if (action.type == 'add' || action.type == 'addBox' || action.type == 'deleteBox') {
			const parent: Flow | Box | null = boxFromPath(this.flow, action.path, 1);
			const childIndex: number = action.path[action.path.length - 1];
			if (parent == null) {
				throw new Error(`parent of box at path ${action.path} is null`);
			}
			const children: Box[] = [...parent.children];
			if (action.type == 'add') {
				children.splice(childIndex, 0, newBox(childIndex, parent.level + 1, false));
			} else if (action.type == 'addBox') {
				children.splice(childIndex, 0, deepClone(action.other.box));
			} else if (action.type == 'deleteBox') {
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
		} else if (action.type == 'cross') {
			// assume Box isn't Flow
			const box: Box | null = boxFromPath(this.flow, action.path) as Box | null;
			if (box == null) {
				throw new Error(`box at path ${action.path} is null`);
			}
			box.crossed = action.other.crossed;
		}
	}
	focus(path: number[] | null) {
		if (path == null) return;
		const box = boxFromPath<Flow, Box>(this.flow, path);
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
