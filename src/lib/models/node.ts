import { history } from './history';
import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Ok, Err, Result } from 'ts-results';
import { debateStyles, debateStyleMap } from './debateStyle';
import { settings } from './settings';
import { focusId, lastFocusIds } from './focus';
import {
	connection,
	setAddHostChannelHandler,
	type Connection,
	setAddGuestChannelHandler
} from './sharingConnection';
import { flowsChange } from './store';

export function newNodeId(): NodeId {
	return crypto.randomUUID() as NodeId;
}

export function newBoxId(): BoxId {
	return newNodeId() as BoxId;
}

export function newFlowId(): FlowId {
	return newNodeId() as FlowId;
}

export type Root = { tag: 'root' };

export type Box2 = {
	tag: 'box';

	content: string;
	flowId: FlowId;

	placeholder?: string;
	empty?: boolean;
	crossed?: boolean;
};

export type Flow2 = {
	tag: 'flow';

	content: string;

	invert: boolean;
	columns: string[];
};

type SelfIdFor<T> = T extends Root
	? RootId
	: T extends Flow2
	? FlowId
	: T extends Box2
	? BoxId
	: never;
type ParentIdFor<T> = T extends Root
	? null
	: T extends Flow2
	? RootId
	: T extends Box2
	? BoxId | FlowId
	: never;
type ChildIdFor<T> = T extends Root
	? FlowId
	: T extends Flow2
	? BoxId
	: T extends Box2
	? BoxId
	: never;

export type Node<Value> = {
	value: Value;

	level: number;
	parent: ParentIdFor<Value>;
	children: ChildIdFor<Value>[];
};

type NodeId = string & { readonly NodeId: unique symbol };

export type RootId = 'root';
export type BoxId = NodeId & { readonly BoxId: unique symbol };
export type FlowId = NodeId & { readonly FlowId: unique symbol };
export type AnyId = RootId | BoxId | FlowId;

export type Nodes = { root: Node<Root> } & {
	[key: SelfIdFor<Flow2>]: Node<Flow2>;
} & { [key: SelfIdFor<Box2>]: Node<Box2> };

export function newNodes(): Nodes {
	return {
		root: { value: { tag: 'root' }, level: -1, parent: null, children: [] }
	};
}

export const nodes: Writable<Nodes> = writable(newNodes());

const nodesAndFocusId = derived([nodes, focusId], function ([nodes, focusId]): [
	Nodes,
	FlowId | BoxId | null
] {
	return [nodes, focusId];
});
nodesAndFocusId.subscribe(([nodes, focusId]) => {
	if (focusId == null) return;
	const parentFlowIdRes = getParentFlowId(nodes, focusId);
	if (!parentFlowIdRes.ok) return;
	const parentFlowId = parentFlowIdRes.val;
	lastFocusIds.update((lastFocusIds) => {
		lastFocusIds[parentFlowId] = focusId;
		return lastFocusIds;
	});
});

export type IdError = { tag: 'invalid'; id: AnyId };

export function getNode<T extends AnyId>(nodes: Nodes, id: T): Result<Nodes[T], IdError> {
	if (nodes[id] == undefined) {
		return Err({ tag: 'invalid', id });
	}
	return Ok(nodes[id]);
}

export type Action<Value extends Flow2 | Box2> =
	| AddAction<Value>
	| DeleteAction<Value>
	| UpdateAction<Value>
	| MoveAction<Value>
	| IdentityAction;

export type ActionBundle = Action<Flow2 | Box2>[];

type AddAction<Value> = {
	tag: 'add';
	parent: ParentIdFor<Value>;
	id: SelfIdFor<Value>;
	index: number;
	value: Value;
};

type DeleteAction<Value> = {
	tag: 'delete';
	id: SelfIdFor<Value>;
};

type UpdateAction<Value> = {
	tag: 'update';
	id: SelfIdFor<Value>;
	newValue: Value;
};

type MoveAction<Value> = {
	tag: 'move';
	id: SelfIdFor<Value>;
	newIndex: number;
};
type IdentityAction = {
	tag: 'identity';
};

// constrains index to be within length
function constrainIndex(index: number, length: number): number {
	return Math.max(0, Math.min(index, length));
}

// applies action infallibly and returns inverse of actually applied action (if action fails, returns identity action)
function applyAction<Value extends Box2 | Flow2>(
	nodes: Nodes,
	action: Action<Value>
): Action<Value> {
	switch (action.tag) {
		case 'add': {
			const parentRes = getNode(nodes, action.parent);
			if (!parentRes.ok) return { tag: 'identity' };
			const parent = parentRes.val;

			const child: Node<Value> = {
				value: action.value,
				level: parent.level + 1,
				parent: action.parent,
				children: []
			};

			(<Node<Value>>nodes[action.id]) = child;

			(<SelfIdFor<Value>[]>parent.children).splice(
				constrainIndex(action.index, parent.children.length),
				0,
				action.id
			);
			return {
				tag: 'delete',
				id: action.id
			};
		}
		case 'delete': {
			const nodeRes = getNode(nodes, action.id);
			if (!nodeRes.ok) return { tag: 'identity' };
			const node = <Node<Value>>nodeRes.val;

			const parentRes = getNode(nodes, node.parent);
			if (!parentRes.ok) return { tag: 'identity' };
			const parent = parentRes.val;

			const index = (<SelfIdFor<Value>[]>parent.children).indexOf(action.id);
			if (index == -1) return { tag: 'identity' };
			(<SelfIdFor<Value>[]>parent.children).splice(index, 1);
			delete nodes[action.id];

			return {
				tag: 'add',
				parent: node.parent,
				id: action.id,
				index: index,
				value: node.value
			};
		}
		case 'update': {
			const nodeRes = getNode(nodes, action.id);
			if (!nodeRes.ok) return { tag: 'identity' };
			const node = nodeRes.val;

			const inverseAction: UpdateAction<Value> = {
				tag: 'update',
				id: action.id,
				newValue: structuredClone(<Value>node.value)
			};
			nodes[action.id].value = action.newValue;
			return inverseAction;
		}
		case 'move': {
			const nodeRes = getNode(nodes, action.id);
			if (!nodeRes.ok) return { tag: 'identity' };
			const node = <Node<Value>>nodeRes.val;

			const parentRes = getNode(nodes, node.parent);
			if (!parentRes.ok) return { tag: 'identity' };
			const parent = parentRes.val;

			const index = (<SelfIdFor<Value>[]>parent.children).indexOf(action.id);
			if (index == -1) return { tag: 'identity' };

			const inverseAction: MoveAction<Value> = {
				tag: 'move',
				id: action.id,
				newIndex: index
			};

			(<SelfIdFor<Value>[]>parent.children).splice(index, 1);
			(<SelfIdFor<Value>[]>parent.children).splice(
				constrainIndex(action.newIndex, parent.children.length),
				0,
				action.id
			);

			return inverseAction;
		}
		case 'identity':
			return action;
	}
}

export function applyActionBundle(
	nodes: Nodes,
	actions: ActionBundle,
	change = true
): ActionBundle {
	if (change) {
		flowsChange();
	}
	const inverseActionBundle: ActionBundle = [];
	for (const action of actions) {
		const inverseAction = applyAction(nodes, action);
		inverseActionBundle.push(inverseAction);
	}
	return inverseActionBundle.toReversed();
}

function toBundle(actions: Action<Flow2 | Box2> | ActionBundle): ActionBundle {
	if (Array.isArray(actions)) {
		return actions;
	} else {
		return [actions];
	}
}

export function applyActionBundleAndSend(nodes: Nodes, actionBundle: ActionBundle): ActionBundle {
	const inverseActionBundle = applyActionBundle(nodes, structuredClone(actionBundle));
	sendActionBundle(actionBundle, structuredClone(inverseActionBundle));
	return inverseActionBundle;
}

function doActionBundle(
	nodes: Nodes,
	actions: Action<Flow2 | Box2> | ActionBundle,
	owner: FlowId | RootId
) {
	const inverseActionBundle = applyActionBundleAndSend(nodes, toBundle(structuredClone(actions)));
	history.add(inverseActionBundle, owner);
}

export function getParentFlowId(nodes: Nodes, id: BoxId | FlowId): Result<FlowId, IdError> {
	const nodeRes = getNode(nodes, id);
	if (!nodeRes.ok) return nodeRes;
	const node = nodeRes.val;
	switch (node.value.tag) {
		case 'box':
			return Ok(node.value.flowId);
		case 'flow':
			return Ok(<FlowId>id);
	}
}
export let pendingActions: PendingAction[] = [];
export type PendingAction = (nodes: Nodes) => void;
export function addPendingAction(action: PendingAction) {
	pendingActions.push(action);
}
export function resolveAllPending(nodes: Nodes) {
	for (const action of pendingActions) {
		action(nodes);
	}
	pendingActions = [];
}
export function newBoxAction(
	nodes: Nodes,
	parent: FlowId | BoxId,
	parentFlowId: FlowId,
	index: number,
	placeholder?: string
): AddAction<Box2> {
	const addAction: AddAction<Box2> = {
		tag: 'add',
		parent,
		id: newBoxId(),
		index: index,
		value: {
			tag: 'box',
			content: '',
			placeholder: placeholder,
			flowId: parentFlowId
		}
	};

	return addAction;
}
export function addNewBox(
	nodes: Nodes,
	parent: FlowId | BoxId,
	index: number,
	placeholder?: string
) {
	resolveAllPending(nodes);
	const flowId = getParentFlowId(nodes, parent).unwrap();
	doActionBundle(nodes, newBoxAction(nodes, parent, flowId, index, placeholder), flowId);
}

export function addNewFlow(
	nodes: Nodes,
	index: number,
	type: 'primary' | 'secondary',
	switchSpeakers = false
) {
	resolveAllPending(nodes);
	const currentDebateStyle =
		debateStyles[debateStyleMap[settings.data.debateStyle.value as number]];
	const style = currentDebateStyle[type];
	if (style == null) return null;
	const starterBoxes = style.starterBoxes;
	let columns;
	if (style.columnsSwitch != null && switchSpeakers) {
		columns = style.columnsSwitch;
	} else {
		columns = style.columns;
	}
	const id = newFlowId();
	const addAction: AddAction<Flow2> = {
		tag: 'add',
		parent: 'root',
		id,
		index,
		value: {
			tag: 'flow',
			content: '',
			invert: style.invert,
			columns
		}
	};
	const actionBundle: Action<Flow2 | Box2>[] = [addAction];
	if (starterBoxes != null) {
		starterBoxes.forEach((placeholder, index) => {
			actionBundle.push(newBoxAction(nodes, id, id, index, placeholder));
		});
	} else {
		actionBundle.push(newBoxAction(nodes, id, id, 0));
	}
	doActionBundle(nodes, actionBundle, 'root');
	return id;
}

export function updateBox(nodes: Nodes, id: BoxId, value: Box2) {
	resolveAllPending(nodes);
	updateWithoutResolve(nodes, id, value);
}

export function updateWithoutResolve<Value extends Flow2 | Box2>(
	nodes: Nodes,
	id: SelfIdFor<Value>,
	value: Value
) {
	const box = getNode(nodes, id).unwrap();
	if (box == null) return;
	const updateAction: UpdateAction<Value> = {
		tag: 'update',
		id: id,
		newValue: value
	};
	doActionBundle(nodes, updateAction, getParentFlowId(nodes, id).unwrap());
}

export function updateFlow(nodes: Nodes, id: FlowId, value: Flow2) {
	resolveAllPending(nodes);
	const flow = getNode(nodes, id).unwrap();
	if (flow == null) return;
	const updateAction: UpdateAction<Flow2> = {
		tag: 'update',
		id: id,
		newValue: value
	};
	doActionBundle(nodes, updateAction, id);
}

// return null if id is not a box
export function checkIdBox(nodes: Nodes, id: AnyId): BoxId | null {
	const nodeRes = getNode(nodes, id);
	if (!nodeRes.ok) return null;
	const node = nodeRes.val;
	if (node == null) return null;
	if (node.value && node.value.tag === 'box') return <BoxId>id;
	return null;
}

function deleteAction(nodes: Nodes, id: BoxId | FlowId): ActionBundle {
	const actionBundle: ActionBundle = [];

	const box = getNode(nodes, id).unwrap();
	if (box == null) return actionBundle;
	const parent = getNode(nodes, box.parent).unwrap();
	if (parent == null) return actionBundle;
	for (const child of box.children.toReversed()) {
		actionBundle.push(...deleteAction(nodes, child));
	}
	actionBundle.push({
		tag: 'delete',
		id: id
	});
	return actionBundle;
}
export function deleteBox(nodes: Nodes, id: BoxId) {
	resolveAllPending(nodes);
	const actionBundle = deleteAction(nodes, id);
	doActionBundle(nodes, actionBundle, getParentFlowId(nodes, id).unwrap());
}

export function deleteFlow(nodes: Nodes, id: FlowId) {
	resolveAllPending(nodes);
	const actionBundle = deleteAction(nodes, id);
	doActionBundle(nodes, actionBundle, 'root');
}

export function moveFlow(nodes: Nodes, id: FlowId, newIndex: number) {
	resolveAllPending(nodes);
	const moveAction: MoveAction<Flow2> = {
		tag: 'move',
		id: id,
		newIndex: newIndex
	};
	doActionBundle(nodes, moveAction, 'root');
}

export function getAdjacentBox(nodes: Nodes, id: BoxId, direction: 'up' | 'down'): BoxId | null {
	const box = nodes[id];
	const parent = nodes[box.parent];
	const index = parent.children.indexOf(id);
	let newIndex;
	if (direction === 'up') {
		newIndex = index - 1;
	} else {
		newIndex = index + 1;
	}
	if (newIndex < 0 || newIndex >= parent.children.length) {
		// make sure the parent is a box
		const parentId = checkIdBox(nodes, box.parent);
		if (parentId == null) return null;
		// we ran out of boxes in this parent, so we need to go to the next parent with children
		let adjacentParent = getAdjacentBox(nodes, parentId, direction);
		if (adjacentParent == null) return null;
		while (nodes[adjacentParent].children.length == 0) {
			adjacentParent = getAdjacentBox(nodes, adjacentParent, direction);
			if (adjacentParent == null) return null;
		}
		const node = nodes[adjacentParent];
		if (direction === 'up') {
			newIndex = node.children.length - 1;
		} else {
			newIndex = 0;
		}
		return node.children[newIndex];
	} else {
		return parent.children[newIndex];
	}
}

export function addNewEmpty(nodes: Nodes, flowId: FlowId, level: number): BoxId {
	resolveAllPending(nodes);
	const actions = [];
	let parentId: BoxId | FlowId = flowId;
	for (let i = 0; i < level; i++) {
		const newId = newBoxId();
		const addAction: AddAction<Box2> = {
			tag: 'add',
			parent: parentId,
			id: newId,
			index: 0,
			value: {
				tag: 'box',
				content: '',
				flowId,
				empty: true
			}
		};
		actions.push(addAction);
		parentId = newId;
	}
	const finalBoxAction = newBoxAction(nodes, parentId, flowId, 0);
	actions.push(finalBoxAction);
	doActionBundle(nodes, actions, flowId);
	return finalBoxAction.id;
}

export type ActionId = string & { readonly ActionId: unique symbol };

export type SendAction = {
	id: ActionId;
	actionBundle: ActionBundle;
};
export type HostMessage =
	| {
			kind: 'sync';
			nodes: Nodes;
	  }
	| {
			kind: 'action';
			action: SendAction;
	  }
	| {
			kind: 'actionRecieved';
			actionId: ActionId;
	  };

export type GuestMessage =
	| {
			kind: 'requestSync';
	  }
	| {
			kind: 'action';
			action: SendAction;
	  };

function newActionId(): ActionId {
	return crypto.randomUUID() as ActionId;
}

let $connection: Connection;
connection.subscribe((connection) => {
	$connection = connection;
});

const prediction: {
	actionsAwaitingConfirmation: { [key: ActionId]: ActionBundle };
	predictedInverse: ActionBundle[];
	confirmed: ActionBundle[];
} = {
	actionsAwaitingConfirmation: {},
	predictedInverse: [],
	confirmed: []
};

export function sendActionBundle(actionBundle: ActionBundle, inverseActionBundle: ActionBundle) {
	if ($connection.tag === 'hostConnected') {
		$connection.channel.send({
			kind: 'action',
			action: {
				id: newActionId(),
				actionBundle
			}
		});
	} else if ($connection.tag === 'guestConnected') {
		const id = newActionId();
		$connection.channel.send({
			kind: 'action',
			action: {
				id,
				actionBundle
			}
		});
		prediction.actionsAwaitingConfirmation[id] = actionBundle;
		prediction.predictedInverse.push(inverseActionBundle);
	}
}

interface Channel<SendMessage, RecieveMessage> {
	send(message: SendMessage): void;
	onOpen(fn: () => void): void;
	onClose(fn: () => void): void;
	onMessage(fn: (event: RecieveMessage) => void): void;
}

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

setAddHostChannelHandler(function (channel: Channel<HostMessage, GuestMessage>) {
	channel.onOpen(() => {
		channel.send({
			kind: 'sync',
			nodes: $nodes
		});
	});
	channel.onMessage((message) => {
		switch (message.kind) {
			case 'requestSync':
				channel.send({
					kind: 'sync',
					nodes: $nodes
				});
				break;
			case 'action':
				nodes.update((nodes) => {
					resolveAllPending(nodes);
					applyActionBundle(nodes, message.action.actionBundle);
					return nodes;
				});
				channel.send({
					kind: 'actionRecieved',
					actionId: message.action.id
				});
				break;
		}
	});
});
setAddGuestChannelHandler(function (channel: Channel<GuestMessage, HostMessage>) {
	channel.onMessage((message) => {
		switch (message.kind) {
			case 'sync':
				nodes.set(message.nodes);
				break;
			case 'action':
				nodes.update((nodes) => {
					resolveAllPending(nodes);
					prediction.confirmed.push(structuredClone(message.action.actionBundle));
					const actionInverse = applyActionBundle(nodes, message.action.actionBundle);
					prediction.predictedInverse.push(actionInverse);
					return nodes;
				});
				break;
			case 'actionRecieved':
				prediction.confirmed.push(prediction.actionsAwaitingConfirmation[message.actionId]);
				delete prediction.actionsAwaitingConfirmation[message.actionId];
				nodes.update((nodes) => {
					// check if it's possible that all awaiting actions have been confirmed
					if (Object.keys(prediction.actionsAwaitingConfirmation).length != 0) return nodes;
					// if there are no actions awaiting confirmation, resolve all pending actions, which might create new actions awaiting confirmation
					resolveAllPending(nodes);
					// check all awaiting actions have been confirmed
					if (Object.keys(prediction.actionsAwaitingConfirmation).length != 0) return nodes;

					// undo all predicted actions
					for (const actionBundle of prediction.predictedInverse.toReversed()) {
						applyActionBundle(nodes, actionBundle);
					}
					// do all confirmed actions
					for (const actionBundle of prediction.confirmed) {
						applyActionBundle(nodes, actionBundle);
					}

					// reset prediction
					prediction.predictedInverse = [];
					prediction.confirmed = [];

					return nodes;
				});
				break;
		}
	});
});