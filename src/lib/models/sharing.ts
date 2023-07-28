import { writable } from 'svelte/store';
import type {
	SheetsMessage,
	InitMessage,
	WriteCellMessage,
	SheetsResponse,
	InitResponse,
	ReadCellResponse
} from './shareType';
import type { Box, Flow } from './type';
import { flows, subscribeflowsChange, selected, appMinimized, isSharing } from './store';
import { History } from './history';
import { boxFromPath } from './flow';
import { tick } from 'svelte';

let $flows: Flow[];
flows.subscribe((value) => {
	$flows = value;
});

let $selected: number;
selected.subscribe((value) => {
	$selected = value;
});

let $isSharing: boolean;
isSharing.subscribe((value) => {
	$isSharing = value;
});

function checkEvent(event: MessageEvent): boolean {
	if (event.origin === 'https://docs.google.com') {
		return true;
	}
	return false;
}

function sendMessage(message: SheetsMessage) {
	return new Promise((resolve, reject) => {
		const handler = (event: MessageEvent) => {
			if (!checkEvent(event)) {
				reject(new Error("Invalid event origin; make sure you're calling from a Google Sheet"));
			}
			const response = event.data as SheetsResponse;
			if (response.message === message.message) {
				resolve(response);
			}
			window.removeEventListener('message', handler);
		};
		window.addEventListener('message', handler);
		window.parent.postMessage(message, '*');
	});
}

export const isSheetsEmbedded = window.self !== window.top;
export async function maybeStartSharing() {
	if (!isSheetsEmbedded) return;
	try {
		const response = (await sendMessage({
			message: 'flower:init',
			data: null
		} as InitMessage)) as InitResponse;
		if (!response.data.ready) {
			return;
		}
		if (!response.data.url.startsWith('https://docs.google.com/spreadsheets/d')) {
			alert('Error starting sharing: invalid URL. Make sure you have a google sheet open.');
			return;
		}
		startSharing(response.data.version);
	} catch (e) {
		alert('Error starting sharing: ' + (e as Error).message);
		return;
	}
}

let syncInterval: NodeJS.Timeout | null = null;
let flowsHasChanged = false;
function startSharing(version: InitResponse['data']['version']) {
	if (version != '0.0.1') return;

	isSharing.set(true);
	console.log('start sharing', version);
	restartSyncInterval();
}
subscribeflowsChange(() => {
	flowsHasChanged = true;
});
export function restartSyncInterval() {
	if (syncInterval != null) {
		clearInterval(syncInterval);
	}
	syncFlows();
	syncInterval = setInterval(syncFlows, 5000);
}

async function syncFlows() {
	// if changed, write to the sheet
	if (flowsHasChanged) {
		await writeFlows();
		flowsHasChanged = false;
	}
	// else try to read from sheet and update
	else {
		const transferData = getTransferData();
		const ret = await readFlows();
		// if invalid, just write to the sheet
		if (ret == null) {
			console.log('sheet data invalid, overwriting');
			await writeFlows();
		} else {
			await mergeFlows(ret, transferData);
		}
	}
}

let needsRefocus: HTMLElement | null = null;
async function writeFlows() {
	const str = marshalFlows($flows);
	const blocks = stringToTextBlocks(str);
	const messageData: WriteCellMessage['data'] = [];
	for (let i = 0; i < blocks.length; i++) {
		messageData.push({
			row: i,
			col: 0,
			value: textBlockToString(blocks[i])
		});
	}
	needsRefocus = document.activeElement as HTMLElement;
	await sendMessage({
		message: 'flower:writeCell',
		data: messageData
	});
}

window.addEventListener('focusout', () => {
	if ($isSharing && needsRefocus) {
		console.log('refocus', needsRefocus);
		setTimeout(function () {
			window.focus();
			needsRefocus?.focus();
			needsRefocus = null;
		}, 0);
	}
});

async function readFlows(): Promise<string | null> {
	// reader that starts at 0,0 and goes down by 1
	const reader = cellReaderGenerator(0, 0, 0, 1);
	return await parseTextBlocksToString(reader);
}

function marshalFlows(flows: Flow[]): string {
	const data: string = JSON.stringify(flows, (key, value) => {
		if (key === 'history' || key === 'lastFocus') {
			return undefined;
		}
		if (key === 'focus') {
			return false;
		}
		return value;
	});
	return data;
}

type UnmarshaledFlow = Omit<Flow, 'history' | 'lastFocus'> & {
	history?: History;
	lastFocus?: number[];
};
function unmarshalFlows(data: string): UnmarshaledFlow[] {
	return JSON.parse(data);
}

export let isMergingFlows = false;
async function mergeFlows(data: string, transferData: TransferData) {
	const unmarshaledFlows = unmarshalFlows(data);
	let newSelectedIndex: number | null = null;
	for (let i = 0; i < unmarshaledFlows.length; i++) {
		const flow = unmarshaledFlows[i];
		const lastFocus: number[] | undefined = transferData.flowMap[flow.id]?.lastFocus;
		// transfer previous lastFocus to flow
		if (lastFocus != undefined) {
			let box = boxFromPath<UnmarshaledFlow, Box>(flow, lastFocus);
			if (box != null) {
				flow.lastFocus = [...lastFocus];
			} else {
				// if invalid just focus top
				flow.lastFocus = [];
				box = flow;
			}
			// focus it
			if (transferData.flowMap[flow.id].lastFocusActive) {
				box.focus = true;
			}
		} else {
			flow.lastFocus = [];
		}
		// transfer selection (in case flows were reorganized)
		if (flow.id == transferData.selectedId) {
			newSelectedIndex = i;
		}
		// don't deal with history, just delete it
		flow.history = new History(flow as Flow);
	}
	const newFlows: Flow[] = unmarshaledFlows as Flow[];
	// if newSelectedIndex not assigned, get closest to $selected
	if (newSelectedIndex == null) {
		newSelectedIndex = Math.max(0, Math.min($selected, newFlows.length - 1));
	}

	isMergingFlows = true;
	selected.set(newSelectedIndex);
	flows.set(newFlows);
	await tick();
	isMergingFlows = false;
}

// returns data from current $flows that can be applied to updated flows
type TransferData = {
	flowMap: { [id: number]: { lastFocus: number[]; lastFocusActive: boolean } };
	selectedId: number | undefined;
};
function getTransferData(): TransferData {
	const flowMap: TransferData['flowMap'] = {};
	for (const flow of $flows) {
		flowMap[flow.id] = {
			lastFocus: flow.lastFocus,
			lastFocusActive: flow.lastFocus == null ? false : boxFromPath(flow, flow.lastFocus) != null
		};
	}
	return {
		selectedId: $flows?.[$selected]?.id,
		flowMap
	};
}

const maxTextBlockBody = 49000; // its actually 50000 but we need some room for the header

enum TextBlockHeadType {
	Single = 'single',
	Start = 'start',
	Continue = 'continue',
	End = 'end'
}

type TextBlockHead = {
	type: TextBlockHeadType;
	uuid: string;
};

type TextBlock = {
	head: TextBlockHead;
	body: string;
};

// text block format:
// flower:{uuid}:{type}:{body}

function parseTextBlock(str: string): TextBlock | null {
	if (!str.startsWith('flower:')) {
		console.log('wrong prefix');
		return null;
	}
	const parts = str.split(':');
	if (parts.length < 4) {
		console.log('too few parts');
		return null;
	}
	const uuid = parts[1];
	if (uuid.length != 36) {
		console.log('bad uid');
		return null;
	}
	const type = parts[2];
	if (!Object.values(TextBlockHeadType).includes(type as TextBlockHeadType)) {
		console.log('bad head type');
		return null;
	}
	const head: TextBlockHead = {
		type: type as TextBlockHeadType,
		uuid
	};
	const body = parts.slice(3).join(':');
	return {
		head,
		body
	};
}

type CellReaderGenerator = AsyncGenerator<string, void, undefined>;

async function* cellReaderGenerator(
	col: number,
	row: number,
	colDelta: number,
	rowDelta: number
): CellReaderGenerator {
	let curCol = col;
	let curRow = row;
	while (true) {
		const response = (await sendMessage({
			message: 'flower:readCell',
			data: [
				{
					row: curRow,
					col: curCol
				}
			]
		})) as ReadCellResponse;
		yield response.data[0].value;
		curCol += colDelta;
		curRow += rowDelta;
	}
}

async function parseTextBlocks(
	strIter: AsyncGenerator<string, void, undefined>
): Promise<TextBlock[] | null> {
	const blocks: TextBlock[] = [];
	let uuid: undefined | string = undefined;
	// SingleState: 'start' -> Single -> 'end'
	//                        -> Start -> 'continue' -> End -> 'end'
	//		                                           -> Continue -> 'continue'
	//
	let SingleState: 'start' | 'continue' = 'start';
	for await (const str of strIter) {
		const block = parseTextBlock(str);
		// check if block is valid
		if (block == null) {
			console.log('invalid block');
			return null;
		}
		if (uuid == null) {
			uuid = block.head.uuid;
		} else if (uuid != block.head.uuid) {
			console.log('uid mismatch');
			return null;
		}
		// check if block is valid for current state
		if (SingleState == 'start') {
			switch (block.head.type) {
				case TextBlockHeadType.Single:
					blocks.push(block);
					return blocks;
				case TextBlockHeadType.Start:
					blocks.push(block);
					SingleState = 'continue';
					break;
				default:
					console.log('invalid start block type', block.head.type, block);
					return null;
			}
		} else if (SingleState == 'continue') {
			switch (block.head.type) {
				case TextBlockHeadType.Continue:
					blocks.push(block);
					break;
				case TextBlockHeadType.End:
					blocks.push(block);
					return blocks;
				default:
					console.log('invalid continue block type', block.head.type, block);
					return null;
			}
		}
	}
	return blocks;
}

async function parseTextBlocksToString(
	strIter: AsyncGenerator<string, void, undefined>
): Promise<string | null> {
	const blocks = await parseTextBlocks(strIter);
	if (blocks == null) {
		return null;
	}
	let str = '';
	for (const block of blocks) {
		str += block.body;
	}
	return str;
}

function stringToTextBlocks(str: string): TextBlock[] {
	const chunks = chunkString(str, maxTextBlockBody);
	const blocks: TextBlock[] = [];
	const uuid = crypto.randomUUID();
	if (chunks.length == 1) {
		blocks.push({
			head: {
				type: TextBlockHeadType.Single,
				uuid
			},
			body: chunks[0]
		});
	} else {
		blocks.push({
			head: {
				type: TextBlockHeadType.Start,
				uuid
			},
			body: chunks[0]
		});
		for (let i = 1; i < chunks.length - 1; i++) {
			blocks.push({
				head: {
					type: TextBlockHeadType.Continue,
					uuid
				},
				body: chunks[i]
			});
		}
		blocks.push({
			head: {
				type: TextBlockHeadType.End,
				uuid
			},
			body: chunks[chunks.length - 1]
		});
	}
	return blocks;
}

// Convert a string to a list of strings with length less than maxChunkSize
function chunkString(str: string, maxChunkSize: number): string[] {
	const chunks: string[] = [];
	let curChunk = '';
	let curChunkSize = 0;
	for (const char of str) {
		if (curChunkSize >= maxChunkSize) {
			chunks.push(curChunk);
			curChunk = '';
			curChunkSize = 0;
		}
		curChunk += char;
		curChunkSize += 1;
	}
	chunks.push(curChunk);
	return chunks;
}

function textBlockToString(textBlock: TextBlock): string {
	return `flower:${textBlock.head.uuid}:${textBlock.head.type}:${textBlock.body}`;
}

export async function minimizeApp() {
	await sendMessage({
		message: 'flower:resizeMove',
		data: {
			width: '100px',
			height: '100px',
			top: 'calc(100vh - 100px - 8px)',
			left: '8px'
		}
	});
	appMinimized.set(true);
}

export async function unminimizeApp() {
	await sendMessage({
		message: 'flower:resizeMove',
		data: {
			width: '100vw',
			height: '100vh',
			top: '0px',
			left: '0px'
		}
	});
	appMinimized.set(false);
}
