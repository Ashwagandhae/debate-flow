import { nodes, subscribeFlowsChange } from '$lib/models/store';
import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { getJson, loadNodes, downloadString } from './file';
import { getNode, isNodesWorthSaving, type Nodes } from './node';
import { replaceNodes } from './nodeDecorateAction';

let flowKey: NodeKey | null = null;
const savedNodesDatasMut: Writable<SavedNodesDatas> = writable(getSavedNodesDatas());
// export read-only version
export const savedNodesDatas = derived(savedNodesDatasMut, (value) => value);

export const MAX_SAVED_FLOWS = 20;

export type NodeKey = string;

export type SavedNodesData = {
	created: string;
	modified: string;
	flowInfos: { content: string; invert: boolean }[];
};

export type SavedNodesDatas = {
	[key: NodeKey]: SavedNodesData;
};

function newNodeKey(): NodeKey {
	const uuid = crypto.randomUUID();
	return `flow:${uuid}`;
}

let $nodes: Nodes;
nodes.subscribe((nodes) => {
	$nodes = nodes;
});

let $savedNodesDatasMut: SavedNodesDatas;
savedNodesDatasMut.subscribe((value) => {
	$savedNodesDatasMut = value;
	localStorage.setItem('savedFlows', JSON.stringify(value));
});

let lastSaveTime: number = Date.now();
export function maybeSaveNodes() {
	if (!isNodesWorthSaving($nodes)) return;
	const now = Date.now();
	if (now - lastSaveTime < 5000) return;
	lastSaveTime = now;
	saveNodes($nodes);
}

// used to indicate that a new flow was created, it's should be put in different save
export function unsetFlowKey() {
	flowKey = null;
}

subscribeFlowsChange(maybeSaveNodes);

export function getSavedNodesDatas(): SavedNodesDatas {
	const raw = localStorage.getItem('savedFlows');
	if (raw === null) {
		localStorage.setItem('savedFlows', JSON.stringify({}));
		return {};
	}
	return JSON.parse(raw);
}

export function loadSavedNodes(key: NodeKey, modifyOriginal = false) {
	const raw = localStorage.getItem(key);
	if (raw === null) return [];
	const newNodes: Nodes = loadNodes(raw);
	replaceNodes(newNodes);
	if (modifyOriginal) {
		flowKey = key;
	}
}

export function deleteNodes(key: NodeKey) {
	// update in case different tab
	savedNodesDatasMut.set(getSavedNodesDatas());

	localStorage.removeItem(key);
	if (Object.hasOwn($savedNodesDatasMut, key)) {
		delete $savedNodesDatasMut[key];
		savedNodesDatasMut.set($savedNodesDatasMut);
	}
}
export function saveNodes(nodes: Nodes) {
	// update in case different tab
	savedNodesDatasMut.set(getSavedNodesDatas());
	const data: string = getJson(nodes);
	if (flowKey === null) {
		const newKey = newNodeKey();
		flowKey = newKey;
	}
	localStorage.setItem(flowKey, data);
	// update saved nodes
	$savedNodesDatasMut[flowKey] = {
		created: $savedNodesDatasMut[flowKey]?.created ?? new Date().toISOString(),
		modified: new Date().toISOString(),
		flowInfos: nodes.root.children.map((flowId) => {
			return {
				content: getNode(nodes, flowId).unwrap().value.content,
				invert: getNode(nodes, flowId).unwrap().value.invert
			};
		})
	};
	// delete old nodes
	const keys = Object.keys($savedNodesDatasMut);
	if (keys.length > MAX_SAVED_FLOWS) {
		const oldestKey = keys.reduce((a, b) => {
			if ($savedNodesDatasMut[a].modified < $savedNodesDatasMut[b].modified) {
				return a;
			} else {
				return b;
			}
		});
		delete $savedNodesDatasMut[oldestKey];
		localStorage.removeItem(oldestKey);
	}
	savedNodesDatasMut.set($savedNodesDatasMut);
}

export function downloadSavedNodes(key: NodeKey) {
	const raw = localStorage.getItem(key);
	if (raw === null) return;
	const data = JSON.parse(raw);
	downloadString(JSON.stringify(data), 'flow.json');
}
