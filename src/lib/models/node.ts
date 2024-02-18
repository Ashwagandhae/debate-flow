import type { History } from './history';

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

export function newNodeId(): NodeId {
	return crypto.randomUUID() as NodeId;
}

export function newBoxId(): BoxId {
	return newNodeId() as BoxId;
}

export function newFlowId(): FlowId {
	return newNodeId() as FlowId;
}

export type Root = object & { readonly Root: unique symbol };

export type Box2 = {
	content: string;

	placeholder?: string;
	empty?: boolean;
	crossed?: boolean;
};

export type Flow2 = {
	content: string;

	invert: boolean;
	columns: string[];
};

type Values = Root | Box2 | Flow2;

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

type TagFor<T> = T extends Root
	? 'root'
	: T extends Flow2
	? 'flow'
	: T extends Box2
	? 'box'
	: never;

export type Node<Value> = {
	tag: TagFor<Value>;
	value: Value;

	level: number;
	parent: ParentIdFor<Value>;
	children: ChildIdFor<Value>[];
};

type NodeId = string & { readonly NodeId: unique symbol };

type RootId = 'root';
type BoxId = NodeId & { readonly BoxId: unique symbol };
type FlowId = NodeId & { readonly FlowId: unique symbol };
export type AnyId = RootId | BoxId | FlowId;

type Nodes = {
	nodes: { root: Node<Root> } & {
		[key: SelfIdFor<Flow2>]: Node<Flow2>;
	} & { [key: SelfIdFor<Box2>]: Node<Box2> };
};

const nodes: Nodes = {
	nodes: {
		root: {
			value: {} as Root,
			tag: 'root',
			level: 0,
			parent: null,
			children: []
		}
	}
};

// export function newBox(index: number, level: number, focus: boolean, placeholder?: string): BoxId {
// 	const id = newBoxId();
// 	nodes.nodes[id] = {
// 		value: {
// 			tag: 'box',
// 			focus,
// 			content: '',
// 			placeholder
// 		},
// 		level,
// 		id,
// 		parent: null,
// 		children: []
// 	};
// 	return id;
// }

export function getNode<T extends AnyId>(nodes: Nodes, id: T): Nodes['nodes'][T] {
	return nodes.nodes[id];
}

type Action<Value extends Flow2 | Box2> =
	| AddAction<Value>
	| DeleteAction<Value>
	| UpdateAction<Value>
	| MoveAction<Value>;

type AddAction<Value> = {
	tag: 'add';
	parent: ParentIdFor<Value>;
	id: SelfIdFor<Value>;
	index: number;
	value: Value;
};

type DeleteAction<Value> = {
	tag: 'delete';
	parent: ParentIdFor<Value>;
	id: SelfIdFor<Value>;
	index: number;
	value: Value;
};

type UpdateAction<Value> = {
	tag: 'update';
	id: SelfIdFor<Value>;
	fromValue: Value;
	toValue: Value;
};

type MoveAction<Value> = {
	tag: 'move';
	parent: ParentIdFor<Value>;
	id: SelfIdFor<Value>;
	fromIndex: number;
	toIndex: number;
};

export function invertAction<Value extends Box2 | Flow2>(action: Action<Value>): Action<Value> {
	switch (action.tag) {
		case 'add':
			return {
				tag: 'delete',
				parent: action.parent,
				id: action.id,
				index: action.index,
				value: action.value
			};
		case 'delete':
			return {
				tag: 'add',
				parent: action.parent,
				id: action.id,
				index: action.index,
				value: action.value
			};
		case 'update':
			return {
				tag: 'update',
				id: action.id,
				fromValue: action.toValue,
				toValue: action.fromValue
			};
		case 'move':
			return {
				tag: 'move',
				parent: action.parent,
				id: action.id,
				fromIndex: action.toIndex,
				toIndex: action.fromIndex
			};
	}
}

export function applyAction<Value extends Box2 | Flow2>(nodes: Nodes, action: Action<Value>) {
	switch (action.tag) {
		case 'add': {
			const parent = getNode(nodes, action.parent);
			const child = getNode(nodes, action.id);
			if (parent.tag == 'flow' && child.tag == 'box') {
				parent.children.splice(action.index, 0, action.id);
			}
			child.parent = action.parent;
			break;
		}
	}
}

// let joe = getNode('joe' as FlowId);
