import { Workbook, type Buffer } from 'exceljs';
import { type BoxId, type FlowId, type Nodes, newFlowId, newBoxId, getNode } from './node';
import type { OldBox, OldFlows } from './oldType';
import { newNodes } from './store';
import { applyActionBundle } from './nodeAction';
import { settings, SETTINGS_VERSION, type SaveableSettings } from './settings';

const CURRENT_SAVE_VERSION: Version = 1 as const;

type Version = number;

type SaveableNodes = {
	nodes: Nodes;
	version: Version;
};
export function getJson(nodes: Nodes): string {
	const saveable: SaveableNodes = {
		nodes,
		version: CURRENT_SAVE_VERSION
	};
	return JSON.stringify(saveable);
}

export function loadNodes(data: {[key: string]: any}): Nodes {
	let version: Version = data?.version ?? 0;
	let upgraded = data;
	while (version < CURRENT_SAVE_VERSION) {
		if (upgrade[version]) {
			upgraded = upgrade[version](upgraded);
			version += 1;
		} else {
			throw new Error('Cannot upgrade save data');
		}
	}
	const ret: SaveableNodes = upgraded as SaveableNodes;
	return ret.nodes;
}

export function downloadJson(nodes: Nodes) {
	const data: string = getJson(nodes);
	downloadString(data, 'flow.json');
}

export function downloadSettingsJson() {
	let data = settings.convertSettingsToJson(true);
	downloadString(data, 'settings.json');
}

export function importSettingsJson(data: {[key: string]: any}) {
	if (!data["isSettings"]) {
		return;
	}

	if (data["version"] != SETTINGS_VERSION) {
		return; // Handle upgrading settings here if needed in the future
	}

	try {
		settings.parseJsonToSettings(data);
	}
	catch (e) {
		return;
	}
}

export function downloadString(data: string, filename: string) {
	const element: HTMLAnchorElement = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(data));
	element.setAttribute('download', filename);
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function childToData(
	nodes: Nodes,
	data: string[][],
	flowId: FlowId,
	boxId: BoxId | FlowId,
	x: number,
	y: number
) {
	let height = 0;
	for (const child of getNode(nodes, boxId).unwrap().children) {
		height += childToData(nodes, data, flowId, child, x + 1, y + height);
	}
	// acutally add it to data
	while (!data[y]) {
		// make list of empty strings of length flow.columns.length
		const row: string[] = Array.from(
			{ length: getNode(nodes, flowId).unwrap().value.columns.length },
			() => ''
		);
		data.push(row);
	}
	// exclude root
	if (x >= 0) {
		const node = getNode(nodes, boxId).unwrap();
		if (node.value.tag === "box" && node.value.isExtension) {
			data[y][x] = "→ Extended →";
		} else {
			data[y][x] = node.value.content;
		}
	}
	// return 1 height if no children
	return Math.max(1, height);
}

// TODO add extend arrows when content : empty : content cell
function fixXlsxWorkbookName(name: string) {
	for (const char of ['*', '?', ':', '\\', '/', '[', ']']) {
		name = name.replaceAll(char, '');
	}
	name = name.substring(0, 31);
	return name;
}

export function downloadXlsx(nodes: Nodes) {
	const wb: Workbook = new Workbook();

	let unnamedIterator = 1;
	for (const flowId of nodes.root.children) {
		const data: string[][] = [];

		childToData(nodes, data, flowId, flowId, -1, 0);

		let name: string = getNode(nodes, flowId).unwrap().value.content;

		if (!name) { // Allows unnamed books to be downloaded
			name = "Unnamed Flow " + unnamedIterator;
			unnamedIterator += 1;
		}

		name = fixXlsxWorkbookName(name);
		const ws = wb.addWorksheet(name);
		ws.columns = getNode(nodes, flowId)
			.unwrap()
			.value.columns.map(function (column: string) {
				return { header: column, width: 25 };
			});
		for (let y = 0; y < data.length; y++) {
			// make space for header with + 2
			const row = ws.getRow(y + 2);
			for (let x = 0; x < data[y].length; x++) {
				// light red
				let fill = 'FFFFCCCC';
				// darker red
				let border = 'FFFF9999';

				if (
					(x % 2 == 0 && !getNode(nodes, flowId).unwrap().value.invert) ||
					(x % 2 == 1 && getNode(nodes, flowId).unwrap().value.invert)
				) {
					// light blue
					fill = 'FFCCE5FF';
					// darker blue
					border = 'FF99CCFF';
				}
				const cell = row.getCell(x + 1);
				cell.value = data[y][x];

				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: fill }
				};
				cell.border = {
					top: { style: 'thin', color: { argb: border } },
					left: { style: 'thin', color: { argb: border } },
					bottom: { style: 'thin', color: { argb: border } },
					right: { style: 'thin', color: { argb: border } }
				};
				cell.alignment = { wrapText: true };
			}
		}
		// bold headers
		ws.getRow(1).font = { bold: true };
	}
	wb.xlsx
		.writeBuffer()
		.then(function (value: Buffer) {
			// build anchor tag and attach file (works in chrome)
			const a: HTMLAnchorElement = document.createElement('a');
			const data: Blob = new Blob([value], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			});

			const url: string = URL.createObjectURL(data);
			a.href = url;
			a.download = 'flow.xlsx';
			document.body.appendChild(a);
			a.click();
			setTimeout(function () {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0);
		})
		.catch(function (error) {
			console.log(error.message);
		});
}

const upgrade: {
	[key: number]: (saved: {[key: string]: any}) => SaveableNodes;
} = {
	0: upgrade_0_1
};

function upgrade_0_1(saved: {[key: string]: any}): SaveableNodes {
	const flows = saved as OldFlows;
	const nodes: Nodes = newNodes();
	for (let i = 0; i < flows.length; i++) {
		const flow = flows[i];
		const flowId = newFlowId();
		applyActionBundle(
			nodes,
			[
				{
					tag: 'add',
					parent: 'root',
					id: flowId,
					index: i,
					value: {
						tag: 'flow',
						content: flow.content,
						invert: flow.invert,
						columns: flow.columns
					}
				}
			],
			false
		);
		for (let j = 0; j < flow.children.length; j++) {
			const box = flow.children[j];
			upgrade_0_1_addBoxesRec(nodes, flowId, flowId, box, j);
		}
	}
	const ret: SaveableNodes = { nodes, version: 1 };
	return ret;
}

function upgrade_0_1_addBoxesRec(
	nodes: Nodes,
	flowId: FlowId,
	parentId: FlowId | BoxId,
	box: OldBox,
	index: number
) {
	const id = newBoxId();
	applyActionBundle(
		nodes,
		[
			{
				tag: 'add',
				parent: parentId,
				id,
				index,
				value: {
					tag: 'box',
					content: box.content,
					flowId,

					placeholder: box.placeholder,
					empty: box.empty,
					crossed: box.crossed
				}
			}
		],
		false
	);
	for (let i = 0; i < box.children.length; i++) {
		upgrade_0_1_addBoxesRec(nodes, flowId, id, box.children[i], i);
	}
}
