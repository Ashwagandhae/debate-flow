import type { DebateStyleFlow } from './debateStyle';
import {
	getNode,
	getParentFlowId,
	newBoxId,
	newFlowId,
	type Box,
	type BoxId,
	type Flow,
	type FlowId,
	type Nodes,
	type RootId,
	type SelfIdFor
} from './node';
import {
	doActionBundle,
	type Action,
	type ActionBundle,
	type ActionOrBundle,
	type AddAction,
	type MoveAction,
	type UpdateAction
} from './nodeAction';
import { resolvePendingAction } from './nodePendingAction';
import { nodes } from './store';

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

// TODO prevent loading new file while sharing
// TODO Uncaught Error: Worksheet name AC: Calzones have bread cannot include any of the following characters: * ? : \ / [ ]
// TODO deal with addTab button height bug when replacing flow

function decorate<
	Input extends unknown[],
	Ret,
	Output extends { action: ActionOrBundle; owner: FlowId | RootId; ret?: Ret }
>(fn: (nodes: Nodes, ...args: Input) => Output): (...args: Input) => Output['ret'] {
	return function (...args: Input) {
		resolvePendingAction($nodes);
		const output = fn($nodes, ...args);
		doActionBundle(output.action, output.owner);
		return output.ret;
	};
}

export function newBoxAction(
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

export const addNewBox = decorate(function (
	nodes: Nodes,
	parent: FlowId | BoxId,
	index: number,
	placeholder?: string
) {
	const flowId = getParentFlowId(nodes, parent).unwrap();
	return {
		action: newBoxAction(parent, flowId, index, placeholder),
		owner: flowId
	};
});

export const addNewFlow = decorate(function (
	nodes: Nodes,
	index: number,
	style: DebateStyleFlow,
	switchSpeakers = false
) {
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
			actionBundle.push(newBoxAction(id, id, index, placeholder));
		});
	} else {
		actionBundle.push(newBoxAction(id, id, 0));
	}
	return {
		action: actionBundle,
		owner: 'root',
		ret: id
	};
});

export const toggleBoxFormat = decorate(function (
	nodes: Nodes,
	id: BoxId,
	format: 'bold' | 'crossed'
) {
	const box = getNode(nodes, id).unwrap();
	return {
		action: newUpdateAction(id, { ...box.value, [format]: !box.value[format] }),
		owner: getParentFlowId(nodes, id).unwrap()
	};
});

export function newUpdateAction<Value extends Flow | Box>(
	id: SelfIdFor<Value>,
	value: Value
): UpdateAction<Value> {
	return {
		tag: 'update',
		id: id,
		newValue: value
	};
}

function newDeleteAction(nodes: Nodes, id: BoxId | FlowId): ActionBundle {
	const actionBundle: ActionBundle = [];

	const box = getNode(nodes, id).unwrap();
	if (box == null) return actionBundle;
	const parent = getNode(nodes, box.parent).unwrap();
	if (parent == null) return actionBundle;
	for (const child of box.children.toReversed()) {
		actionBundle.push(...newDeleteAction(nodes, child));
	}
	actionBundle.push({
		tag: 'delete',
		id: id
	});
	return actionBundle;
}
export const deleteBox = decorate(function (nodes: Nodes, id: BoxId) {
	const actionBundle = newDeleteAction(nodes, id);
	return { action: actionBundle, owner: getParentFlowId(nodes, id).unwrap() };
});

export const deleteFlow = decorate(function (nodes: Nodes, id: FlowId) {
	const actionBundle = newDeleteAction(nodes, id);
	return { action: actionBundle, owner: 'root' };
});

export const moveFlow = decorate(function (nodes: Nodes, id: FlowId, newIndex: number) {
	const moveAction: MoveAction<Flow> = {
		tag: 'move',
		id: id,
		newIndex: newIndex
	};
	return { action: moveAction, owner: 'root' };
});

export const addNewEmpty = decorate(function (nodes: Nodes, flowId: FlowId, level: number) {
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
	const finalBoxAction = newBoxAction(parentId, flowId, 0);
	actions.push(finalBoxAction);
	return {
		action: actions,
		ret: finalBoxAction.id,
		owner: flowId
	};
});

export const replaceNodes = decorate(function (nodes: Nodes, newNodes: Nodes) {
	return {
		action: {
			tag: 'replace',
			newNodes: structuredClone(newNodes)
		},
		owner: 'root'
	};
});
