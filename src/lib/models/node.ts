import { history } from './history';
import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { Ok, Err, Result } from 'ts-results';
import { debateStyles, debateStyleMap } from './debateStyle';
import { settings } from './settings';
import { focusId, lastFocusIds } from './focus';
import {
	connections,
	setAddHostChannelHandler,
	type Connections,
	setAddGuestChannelHandler,
	type ConnectionId
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

export let pendingActions: PendingAction[] = [];
export type PendingAction = (nodes: Nodes) => void;
export function addPendingAction(action: PendingAction) {
	pendingActions.push(action);
}

export function resolveAllPending(nodes: Nodes) {
	const oldPendingActions = [...pendingActions];
	for (const action of oldPendingActions) {
		action(nodes);
	}
	pendingActions = [];
}

export type Root = { tag: 'root' };

export type Box = {
	tag: 'box';

	content: string;
	flowId: FlowId;

	placeholder?: string;
	empty?: boolean;
	crossed?: boolean;
};

export type Flow = {
	tag: 'flow';

	content: string;

	invert: boolean;
	columns: string[];
};

type SelfIdFor<T> = T extends Root
	? RootId
	: T extends Flow
	? FlowId
	: T extends Box
	? BoxId
	: never;
type ParentIdFor<T> = T extends Root
	? null
	: T extends Flow
	? RootId
	: T extends Box
	? BoxId | FlowId
	: never;
type ChildIdFor<T> = T extends Root
	? FlowId
	: T extends Flow
	? BoxId
	: T extends Box
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
	[key: SelfIdFor<Flow>]: Node<Flow>;
} & { [key: SelfIdFor<Box>]: Node<Box> };

export function newNodes(): Nodes {
	return {
		root: { value: { tag: 'root' }, level: -1, parent: null, children: [] }
	};
}

export const nodes: Writable<Nodes> = writable(newNodes());

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

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

let $focusId: FlowId | BoxId | null = null;
focusId.subscribe((newFocusId) => {
	if ($focusId != newFocusId) {
		nodes.update((nodes) => {
			resolveAllPending(nodes);
			return nodes;
		});
		$focusId = newFocusId;
	}
});

export type IdError = { tag: 'invalid'; id: AnyId };

export function getNode<T extends AnyId>(nodes: Nodes, id: T): Result<Nodes[T], IdError> {
	if (nodes[id] == undefined) {
		return Err({ tag: 'invalid', id });
	}
	return Ok(nodes[id]);
}

export type Action<Value extends Flow | Box> =
	| AddAction<Value>
	| DeleteAction<Value>
	| UpdateAction<Value>
	| MoveAction<Value>
	| IdentityAction;

export type ActionBundle = Action<Flow | Box>[];

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
// TODO prevent loading new file while sharing
// TODO Uncaught Error: Worksheet name AC: Calzones have bread cannot include any of the following characters: * ? : \ / [ ]
// TODO deal with addTab button height bug when replacing flow

// constrains index to be within length
function constrainIndex(index: number, length: number): number {
	return Math.max(0, Math.min(index, length));
}

// applies action infallibly and returns inverse of actually applied action (if action fails, returns identity action)
function applyAction<Value extends Box | Flow>(nodes: Nodes, action: Action<Value>): Action<Value> {
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

function toBundle(actions: Action<Flow | Box> | ActionBundle): ActionBundle {
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
	actions: Action<Flow | Box> | ActionBundle,
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

export function newBoxAction(
	nodes: Nodes,
	parent: FlowId | BoxId,
	parentFlowId: FlowId,
	index: number,
	placeholder?: string
): AddAction<Box> {
	const addAction: AddAction<Box> = {
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
	const addAction: AddAction<Flow> = {
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
	const actionBundle: Action<Flow | Box>[] = [addAction];
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

export function updateBox(nodes: Nodes, id: BoxId, value: Box) {
	resolveAllPending(nodes);
	updateWithoutResolve(nodes, id, value);
}

export function updateWithoutResolve<Value extends Flow | Box>(
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

export function updateFlow(nodes: Nodes, id: FlowId, value: Flow) {
	resolveAllPending(nodes);
	const flow = getNode(nodes, id).unwrap();
	if (flow == null) return;
	const updateAction: UpdateAction<Flow> = {
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
	const moveAction: MoveAction<Flow> = {
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
		const addAction: AddAction<Box> = {
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
			tag: 'sync';
			first: boolean;
			nodes: Nodes;
	  }
	| {
			tag: 'action';
			action: SendAction;
	  }
	| {
			tag: 'actionRecieved';
			actionId: ActionId;
	  }
	| {
			tag: 'name';
			name: string;
	  };

export type GuestMessage =
	| {
			tag: 'requestSync';
	  }
	| {
			tag: 'action';
			action: SendAction;
	  };

function newActionId(): ActionId {
	return crypto.randomUUID() as ActionId;
}

let $connections: Connections;
connections.subscribe((connections) => {
	$connections = connections;
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
	if ($connections.tag === 'host') {
		const id = newActionId();
		const message: HostMessage = {
			tag: 'action',
			action: {
				id,
				actionBundle
			}
		};
		for (const connectionId of Object.keys($connections.holder)) {
			$connections.holder[<ConnectionId>connectionId].channel.send(message);
		}
	} else if ($connections.tag === 'guest' && $connections.connection.tag === 'guestConnected') {
		const id = newActionId();
		$connections.connection.channel.send({
			tag: 'action',
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

setAddHostChannelHandler(function (channel: Channel<HostMessage, GuestMessage>, id: ConnectionId) {
	channel.onOpen(() => {
		channel.send({
			tag: 'sync',
			first: true,
			nodes: $nodes
		});
	});
	channel.onMessage((message) => {
		switch (message.tag) {
			case 'requestSync':
				channel.send({
					tag: 'sync',
					first: false,
					nodes: $nodes
				});
				break;
			case 'action': {
				if ($connections.tag != 'host') return;

				// unfocus before action, refocus after action
				const oldFocusId = $focusId;
				focusId.set(null);

				nodes.update((nodes) => {
					resolveAllPending(nodes);
					applyActionBundle(nodes, message.action.actionBundle);
					return nodes;
				});

				focusId.set(oldFocusId);

				for (const otherId of Object.keys($connections.holder)) {
					if (id == otherId) continue;
					$connections.holder[<ConnectionId>otherId].channel.send(message);
				}

				channel.send({
					tag: 'actionRecieved',
					actionId: message.action.id
				});
				break;
			}
		}
	});
});
setAddGuestChannelHandler(function (channel: Channel<GuestMessage, HostMessage>) {
	channel.onMessage((message) => {
		switch (message.tag) {
			case 'sync':
				nodes.set(message.nodes);
				flowsChange();
				break;
			case 'name':
				connections.update(function (connections) {
					if (connections.tag == 'guest' && connections.connection.tag == 'guestConnected') {
						connections.connection.name = message.name;
					}
					return connections;
				});
				break;
			case 'action': {
				// unfocus before action, refocus after action
				const oldFocusId = $focusId;
				focusId.set(null);
				nodes.update((nodes) => {
					resolveAllPending(nodes);
					prediction.confirmed.push(structuredClone(message.action.actionBundle));
					const actionInverse = applyActionBundle(nodes, message.action.actionBundle);
					prediction.predictedInverse.push(actionInverse);
					return nodes;
				});
				focusId.set(oldFocusId);
				break;
			}
			case 'actionRecieved': {
				prediction.confirmed.push(prediction.actionsAwaitingConfirmation[message.actionId]);
				delete prediction.actionsAwaitingConfirmation[message.actionId];
				// unfocus before action, refocus after action
				const oldFocusId = $focusId;
				focusId.set(null);
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
				focusId.set(oldFocusId);
				break;
			}
		}
	});
});
