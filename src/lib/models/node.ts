import { derived } from 'svelte/store';
import { type Option, Some, None } from 'ts-results';
import { focusId, lastFocusIds } from './focus';

import { nodes } from './store';
import { resolvePendingAction } from './nodePendingAction';

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
	if (!parentFlowIdRes.some) return;
	const parentFlowId = parentFlowIdRes.val;
	lastFocusIds.update((lastFocusIds) => {
		lastFocusIds[parentFlowId] = focusId;
		return lastFocusIds;
	});
});

let $focusId: FlowId | BoxId | null = null;
focusId.subscribe((newFocusId) => {
	if ($focusId != newFocusId) {
		resolvePendingAction($nodes);
		$focusId = newFocusId;
	}
});

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

export type Box = {
	tag: 'box';

	content: string;
	flowId: FlowId;

	placeholder?: string;
	empty?: boolean;
	crossed?: boolean;
	bold?: boolean;
	isExtension?: boolean;
};

export type Flow = {
	tag: 'flow';

	content: string;

	invert: boolean;
	columns: string[];
};

export type SelfIdFor<T> = T extends Root
	? RootId
	: T extends Flow
	? FlowId
	: T extends Box
	? BoxId
	: never;
export type ParentIdFor<T> = T extends Root
	? null
	: T extends Flow
	? RootId
	: T extends Box
	? BoxId | FlowId
	: never;
export type ChildIdFor<T> = T extends Root
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

export type NodeId = string & { readonly NodeId: unique symbol };

export type RootId = 'root';
export type BoxId = NodeId & { readonly BoxId: unique symbol };
export type FlowId = NodeId & { readonly FlowId: unique symbol };
export type AnyId = RootId | BoxId | FlowId;

export type Nodes = { root: Node<Root> } & {
	[key: SelfIdFor<Flow>]: Node<Flow> | undefined;
} & { [key: SelfIdFor<Box>]: Node<Box> | undefined };

export type IdError = { tag: 'invalid'; id: AnyId };

export function getNode<T extends AnyId>(nodes: Nodes, id: T): Option<NonNullable<Nodes[T]>> {
	const res: Nodes[T] = nodes[id];
	if (res == undefined) return None;
	return Some(res);
}

export function getParentFlowId(nodes: Nodes, id: BoxId | FlowId): Option<FlowId> {
	const nodeRes = getNode(nodes, id);
	if (!nodeRes.some) return nodeRes;
	const node = nodeRes.val;
	switch (node.value.tag) {
		case 'box':
			return Some(node.value.flowId);
		case 'flow':
			return Some(<FlowId>id);
	}
}

// return null if id is not a box
export function checkIdBox(nodes: Nodes, id: AnyId): BoxId | null {
	const nodeRes = getNode(nodes, id);
	if (!nodeRes.some) return null;
	const node = nodeRes.val;
	if (node == null) return null;
	if (node.value && node.value.tag === 'box') return <BoxId>id;
	return null;
}

export function isNodesWorthSaving(nodes: Nodes, ignoreFirstEmptyFlow = false): boolean {
	if (nodes.root.children.length == 0) return false;
	// check if empty
	if (nodes.root.children.length == 1 && ignoreFirstEmptyFlow) {
		const flow = getNode(nodes, nodes.root.children[0]).unwrap();
		// make sure flow has no title
		if (flow.value.content != '') return true;
		// if it has no children, return
		if (flow.children.length == 0) return false;

		// if it has exactly one child, make sure that child has no content and children and return
		if (flow.children.length > 1) return true;
		const firstNode = getNode(nodes, flow.children[0]).unwrap();
		if (firstNode.value.content == '' && firstNode.children.length == 0) return false;
		return true;
	} else {
		return true;
	}
}

export function getAdjacentBox(nodes: Nodes, id: BoxId, direction: 'up' | 'down'): BoxId | null {
	const box = nodes[id];
	if (box == null) return null;
	const parent = nodes[box.parent];
	if (parent == null) return null;
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

		let node = nodes[adjacentParent];
		if (node == null) return null;
		while (node.children.length == 0) {
			adjacentParent = getAdjacentBox(nodes, adjacentParent, direction);
			if (adjacentParent == null) return null;
			node = nodes[adjacentParent];
			if (node == null) return null;
		}
		node = nodes[adjacentParent];
		if (node == null) return null;
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
