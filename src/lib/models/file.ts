import { Workbook, type Buffer } from 'exceljs';
import {
	newNodes,
	type BoxId,
	type FlowId,
	type Nodes,
	applyActionBundle,
	newFlowId,
	newBoxId
} from './node';
import type { OldBox, OldFlows } from './oldType';

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

export function loadNodes(data: string): Nodes {
	const saved = JSON.parse(data);
	let version: Version = saved?.version ?? 0;
	let upgraded = saved;
	while (version < CURRENT_SAVE_VERSION) {
		if (upgrade[version]) {
			console.log(`upgrading save data from version ${version} to version ${version + 1}`);
			upgraded = upgrade[version](upgraded);
			version += 1;
		} else {
			throw new Error('Cannot upgrade save data');
		}
	}
	const ret: SaveableNodes = upgraded;
	return ret.nodes;
}

export function downloadJson(nodes: Nodes) {
	const data: string = getJson(nodes);
	downloadString(data, 'flow.json');
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
	for (const child of nodes[boxId].children) {
		height += childToData(nodes, data, flowId, child, x + 1, y + height);
	}
	// acutally add it to data
	while (!data[y]) {
		// make list of empty strings of length flow.columns.length
		const row: string[] = Array.from({ length: nodes[flowId].value.columns.length }, () => '');
		data.push(row);
	}
	// exclude root
	if (x >= 0) {
		data[y][x] = nodes[boxId].value.content;
	}
	// return 1 height if no children
	return Math.max(1, height);
}

export function downloadXlsx(nodes: Nodes) {
	const wb: Workbook = new Workbook();
	for (const flowId of nodes.root.children) {
		const data: string[][] = [];

		childToData(nodes, data, flowId, flowId, -1, 0);

		let name: string = nodes[flowId].value.content;
		if (name.length >= 31) {
			name = name.substring(0, 31);
		}
		const ws = wb.addWorksheet(name);
		ws.columns = nodes[flowId].value.columns.map(function (column: string) {
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
					(x % 2 == 0 && !nodes[flowId].value.invert) ||
					(x % 2 == 1 && nodes[flowId].value.invert)
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
	[key: number]: (saved: unknown) => unknown;
} = {
	0: upgrade_0_1
};

function upgrade_0_1(saved: unknown): unknown {
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
