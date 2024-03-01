import { subscribeFlowsChange } from '$lib/models/store';
import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { getJson, loadNodes, downloadString } from './file';
import { nodes, type Nodes } from './node';

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
nodes.subscribe((value) => {
	$nodes = value;
});

let $savedNodesDatasMut: SavedNodesDatas;
savedNodesDatasMut.subscribe((value) => {
	$savedNodesDatasMut = value;
	localStorage.setItem('savedNodes', JSON.stringify(value));
});

let lastSaveTime: number = Date.now();
export function maybeSaveNodes() {
	if ($nodes.root.children.length == 0) return;
	// check if empty
	outer: {
		if (
			$nodes.root.children.length == 1
			// check if that flow has no title
		) {
			const flow = $nodes[$nodes.root.children[0]];
			// make sure flow has no title
			if (flow.value.content != '') break outer;
			// if it has no children, return
			if (flow.children.length == 0) return;

			// if it has exactly one child, make sure that child has no content and children and return
			if (flow.children.length > 1) break outer;
			const firstNode = $nodes[flow.children[0]];
			if (firstNode.value.content == '' && firstNode.children.length == 0) return;
		}
	}
	const now = Date.now();
	if (now - lastSaveTime < 5000) return;
	lastSaveTime = now;
	saveNodes($nodes);
}

subscribeFlowsChange(maybeSaveNodes);

export function getSavedNodesDatas(): SavedNodesDatas {
	const raw = localStorage.getItem('savedNodes');
	if (raw === null) {
		localStorage.setItem('savedNodes', JSON.stringify({}));
		return {};
	}
	return JSON.parse(raw);
}

export function loadSavedNodes(key: NodeKey, modifyOriginal = false) {
	const raw = localStorage.getItem(key);
	if (raw === null) return [];
	const newNodes: Nodes = loadNodes(raw);
	nodes.set(newNodes);
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
				content: nodes[flowId].value.content,
				invert: nodes[flowId].value.invert
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
