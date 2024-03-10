import {
	getNode,
	type Box,
	type BoxId,
	type Flow,
	type FlowId,
	type Node,
	type Nodes,
	type ParentIdFor,
	type RootId,
	type SelfIdFor
} from './node';
import { sendActionBundle } from './sharingChannel';
import { flowsChange, frozen, nodes } from './store';
import { history } from './history';
import { syncUi } from './nodeSyncUi';

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

let $frozen: boolean;
frozen.subscribe((frozen) => {
	$frozen = frozen;
});

export type Action<Value extends Flow | Box> =
	| AddAction<Value>
	| DeleteAction<Value>
	| UpdateAction<Value>
	| MoveAction<Value>
	| ReplaceAction
	| IdentityAction;

export type ActionBundle = Action<Flow | Box>[];

export type ActionOrBundle = Action<Flow | Box> | ActionBundle;

export type AddAction<Value> = {
	tag: 'add';
	parent: ParentIdFor<Value>;
	id: SelfIdFor<Value>;
	index: number;
	value: Value;
};

export type DeleteAction<Value> = {
	tag: 'delete';
	id: SelfIdFor<Value>;
};

export type UpdateAction<Value> = {
	tag: 'update';
	id: SelfIdFor<Value>;
	newValue: Value;
};

export type MoveAction<Value> = {
	tag: 'move';
	id: SelfIdFor<Value>;
	newIndex: number;
};

export type ReplaceAction = {
	tag: 'replace';
	newNodes: Nodes;
};
export type IdentityAction = {
	tag: 'identity';
};

// constrains index to be within length
export function constrainIndex(index: number, length: number): number {
	return Math.max(0, Math.min(index, length));
}

// applies action infallibly and returns inverse of actually applied action (if action fails, returns identity action)
export function applyAction<Value extends Box | Flow>(
	nodes: Nodes,
	action: Action<Value>
): Action<Value> {
	switch (action.tag) {
		case 'add': {
			const parentRes = getNode(nodes, action.parent);
			if (!parentRes.some) return { tag: 'identity' };
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
			if (!nodeRes.some) return { tag: 'identity' };
			const node = <Node<Value>>nodeRes.val;

			const parentRes = getNode(nodes, node.parent);
			if (!parentRes.some) return { tag: 'identity' };
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
			if (!nodeRes.some) return { tag: 'identity' };
			const node = nodeRes.val;

			const inverseAction: UpdateAction<Value> = {
				tag: 'update',
				id: action.id,
				newValue: structuredClone(<Value>node.value)
			};
			node.value = action.newValue;
			return inverseAction;
		}
		case 'move': {
			const nodeRes = getNode(nodes, action.id);
			if (!nodeRes.some) return { tag: 'identity' };
			const node = <Node<Value>>nodeRes.val;

			const parentRes = getNode(nodes, node.parent);
			if (!parentRes.some) return { tag: 'identity' };
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
		case 'replace': {
			const inverseAction: ReplaceAction = {
				tag: 'replace',
				newNodes: structuredClone(nodes)
			};
			for (const id of Object.keys(nodes)) {
				delete nodes[<keyof Nodes>id];
			}
			for (const id of Object.keys(action.newNodes)) {
				// it's not actually all boxId, just to make typescript happy
				nodes[<BoxId>id] = action.newNodes[<BoxId>id];
			}
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

export function applyActionBundleAndSyncUi(actionBundle: ActionBundle): ActionBundle {
	const inverseActionBundle = applyActionBundle($nodes, actionBundle);
	syncUi($nodes);
	return inverseActionBundle;
}

export function applyActionBundleBatchAndSyncUi(
	nodes: Nodes,
	actionBundleBatch: ActionBundle[]
): ActionBundle[] {
	const inverseActionBundleBatch: ActionBundle[] = [];
	for (const actionBundle of actionBundleBatch) {
		const inverseActionBundle = applyActionBundle(nodes, actionBundle, false);
		inverseActionBundleBatch.push(inverseActionBundle);
	}
	syncUi(nodes);
	return inverseActionBundleBatch.toReversed();
}

export function toBundle(actions: ActionOrBundle): ActionBundle {
	if (Array.isArray(actions)) {
		return actions;
	} else {
		return [actions];
	}
}

export function applyActionBundleAndSend(actionBundle: ActionBundle): ActionBundle | null {
	if ($frozen) {
		alert('You cannot make changes while waiting for sync');
		return null;
	}
	const inverseActionBundle = applyActionBundleAndSyncUi(structuredClone(actionBundle));
	sendActionBundle(actionBundle, structuredClone(inverseActionBundle));
	return inverseActionBundle;
}

export function doActionBundle(actions: Action<Flow | Box> | ActionBundle, owner: FlowId | RootId) {
	const inverseActionBundle = applyActionBundleAndSend(toBundle(structuredClone(actions)));
	if (inverseActionBundle == null) return;
	history.add(inverseActionBundle, owner);
}
