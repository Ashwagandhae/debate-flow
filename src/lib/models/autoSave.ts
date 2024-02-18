import type { Flow } from './type';
import { flows, subscribeFlowsChange, isSheetSharing } from '$lib/models/store';
import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { getJson, loadFlows, downloadString } from './file';

let flowKey: FlowKey | null = null;
const savedFlowsDatasMut: Writable<SavedFlowsDatas> = writable(getSavedFlowsDatas());
// export read-only version
export const savedFlowsDatas = derived(savedFlowsDatasMut, (value) => value);

export const MAX_SAVED_FLOWS = 20;

export type FlowKey = string;

export type SavedFlowsData = {
	created: string;
	modified: string;
	flowInfos: { content: string; invert: boolean }[];
};

export type SavedFlowsDatas = {
	[key: FlowKey]: SavedFlowsData;
};

function newFlowKey(): FlowKey {
	const uuid = crypto.randomUUID();
	return `flow:${uuid}`;
}

let $flows: Flow[];
flows.subscribe((value) => {
	$flows = value;
});

let $isSheetSharing: boolean;
isSheetSharing.subscribe((value) => {
	$isSheetSharing = value;
});

let $savedFlowsDatasMut: SavedFlowsDatas;
savedFlowsDatasMut.subscribe((value) => {
	$savedFlowsDatasMut = value;
	localStorage.setItem('savedFlows', JSON.stringify(value));
});

let lastSaveTime: number = Date.now();
export function maybeSaveFlows() {
	if ($flows.length == 0) return;
	if ($isSheetSharing) return;
	// check if empty
	if (
		$flows.length == 1 &&
		$flows[0].content.length == 0 &&
		$flows[0].children.length == 1 &&
		$flows[0].children[0].content.length == 0
	) {
		return;
	}
	const now = Date.now();
	if (now - lastSaveTime < 5000) return;
	lastSaveTime = now;
	saveFlows($flows);
}

subscribeFlowsChange(maybeSaveFlows);

export function getSavedFlowsDatas(): SavedFlowsDatas {
	const raw = localStorage.getItem('savedFlows');
	if (raw === null) {
		localStorage.setItem('savedFlows', JSON.stringify({}));
		return {};
	}
	return JSON.parse(raw);
}

export function loadSavedFlows(key: FlowKey, modifyOriginal = false) {
	const raw = localStorage.getItem(key);
	if (raw === null) return [];
	const newFlows: Flow[] = loadFlows(raw);
	flows.set(newFlows);
	if (modifyOriginal) {
		flowKey = key;
	}
}

export function deleteFlows(key: FlowKey) {
	// update in case different tab
	savedFlowsDatasMut.set(getSavedFlowsDatas());

	localStorage.removeItem(key);
	if (Object.hasOwn($savedFlowsDatasMut, key)) {
		delete $savedFlowsDatasMut[key];
		savedFlowsDatasMut.set($savedFlowsDatasMut);
	}
}
export function saveFlows(flows: Flow[]) {
	// update in case different tab
	savedFlowsDatasMut.set(getSavedFlowsDatas());

	const data: string = getJson(flows);
	if (flowKey === null) {
		const newKey = newFlowKey();
		flowKey = newKey;
	}
	localStorage.setItem(flowKey, data);
	// update saved flows
	$savedFlowsDatasMut[flowKey] = {
		created: $savedFlowsDatasMut[flowKey]?.created ?? new Date().toISOString(),
		modified: new Date().toISOString(),
		flowInfos: flows.map((flow) => {
			return {
				content: flow.content,
				invert: flow.invert
			};
		})
	};
	// delete old flows
	const keys = Object.keys($savedFlowsDatasMut);
	if (keys.length > MAX_SAVED_FLOWS) {
		const oldestKey = keys.reduce((a, b) => {
			if ($savedFlowsDatasMut[a].modified < $savedFlowsDatasMut[b].modified) {
				return a;
			} else {
				return b;
			}
		});
		delete $savedFlowsDatasMut[oldestKey];
		localStorage.removeItem(oldestKey);
	}

	savedFlowsDatasMut.set($savedFlowsDatasMut);
}

export function downloadSavedFlows(key: FlowKey) {
	const raw = localStorage.getItem(key);
	if (raw === null) return;
	const data = JSON.parse(raw);
	downloadString(JSON.stringify(data), 'flow.json');
}
