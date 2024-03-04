import {
	type ActionBundle,
	type BoxId,
	type FlowId,
	type Nodes,
	type RootId,
	resolveAllPending,
	applyActionBundleAndSend
} from '$lib/models/node';
import { focusId } from './focus';

let lastNonNullFocusId: FlowId | BoxId;
focusId.subscribe((value) => {
	if (value != null) {
		lastNonNullFocusId = value;
	}
});

type HistoryAction = {
	// defaults to lastNonNullFocusId if not set by setNextBeforeFocus
	beforeFocus: BoxId | FlowId;
	// defaults to beforeFocus if not set by setPrevAfterFocus
	afterFocus: BoxId | FlowId | null;
	actionBundle: ActionBundle;
};

export class HistoryHolder {
	histories: { root: History } & {
		[key: FlowId]: History;
	};
	lastAddedOwner: FlowId | RootId | null;
	constructor() {
		this.histories = {
			root: new History()
		};
		this.lastAddedOwner = null;
	}
	add(actionBundle: ActionBundle, owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) {
			this.histories[owner] = new History();
		}
		this.histories[owner].add(actionBundle);
		this.lastAddedOwner = owner;
	}
	undo(nodes: Nodes, owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) return;
		this.histories[owner].undo(nodes);
	}
	redo(nodes: Nodes, owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) return;
		this.histories[owner].redo(nodes);
	}
	canUndo(owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) return false;
		return this.histories[owner].canUndo();
	}
	canRedo(owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) return false;
		return this.histories[owner].canRedo();
	}
	setNextBeforeFocus(beforeFocus: BoxId | FlowId | null, owner: FlowId | RootId) {
		if (!Object.prototype.hasOwnProperty.call(this.histories, owner)) {
			this.histories[owner] = new History();
		}
		this.histories[owner].setNextBeforeFocus(beforeFocus);
	}
	setPrevAfterFocus(afterFocus: BoxId | FlowId | null, owner?: FlowId | RootId) {
		// try to use lastAddedOwner if owner is not set
		const validOwner = owner ?? this.lastAddedOwner;
		// if no owner is set, return
		if (validOwner == null) return;
		if (!Object.prototype.hasOwnProperty.call(this.histories, validOwner)) return;
		this.histories[validOwner].setPrevAfterFocus(afterFocus);
	}
}

export class History {
	index: number;
	actions: HistoryAction[];
	// nextBeforeFocus is the focusId before the next action
	nextBeforeFocus: BoxId | FlowId | null;
	constructor() {
		this.index = -1;
		this.actions = [];
		this.nextBeforeFocus = null;
	}
	setNextBeforeFocus(beforeFocus: BoxId | FlowId | null) {
		// only allow setting nextBeforeFocus once
		if (this.nextBeforeFocus != null) return;
		this.nextBeforeFocus = beforeFocus;
	}
	setPrevAfterFocus(afterFocus: BoxId | FlowId | null) {
		// only allow setting afterFocus once
		if (this.actions[this.index].afterFocus != null) return;
		this.actions[this.index].afterFocus = afterFocus;
	}
	add(actionBundle: ActionBundle) {
		const action = {
			beforeFocus: this.nextBeforeFocus ?? lastNonNullFocusId,
			afterFocus: null,
			actionBundle: actionBundle
		};
		// reset nextBeforeFocus
		this.nextBeforeFocus = null;
		// remove all actions after the current index
		this.actions = this.actions.slice(0, this.index + 1);
		this.actions.push(action);
		this.index = this.actions.length - 1;
	}
	undo(nodes: Nodes) {
		if (!this.canUndo()) return;

		const action = this.actions[this.index];
		action.actionBundle = applyActionBundleAndSend(nodes, action.actionBundle);
		focusId.set(action.beforeFocus);
		this.index -= 1;
	}
	redo(nodes: Nodes) {
		if (!this.canRedo()) return;

		this.index += 1;
		const action = this.actions[this.index];
		action.actionBundle = applyActionBundleAndSend(nodes, action.actionBundle);
		focusId.set(action.afterFocus ?? action.beforeFocus);
	}
	canUndo() {
		return this.index >= 0;
	}
	canRedo() {
		return this.index < this.actions.length - 1;
	}
}

export const history: HistoryHolder = new HistoryHolder();
