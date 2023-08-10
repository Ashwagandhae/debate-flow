import type { Flow, Box } from '$lib/models/type';
import { Workbook, type Buffer } from 'exceljs';
import { History } from './history';

export function getJson(flows: Flow[]): string {
	return JSON.stringify(flows, (key, value) => {
		if (key === 'history') {
			return undefined;
		}
		return value;
	});
}

export function downloadJson(flows: Flow[]) {
	const data: string = getJson(flows);
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

function childToData(data: string[][], flow: Flow, box: Box, x: number, y: number) {
	let height = 0;
	for (const child of box.children) {
		height += childToData(data, flow, child, x + 1, y + height);
	}
	// acutally add it to data
	while (!data[y]) {
		// make list of empty strings of length flow.columns.length
		const row: string[] = Array.from({ length: flow.columns.length }, () => '');
		data.push(row);
	}
	// exclude root
	if (x >= 0) {
		data[y][x] = box.content;
	}
	// return 1 height if no children
	return Math.max(1, height);
}

export function downloadXlsx(flows: Flow[]) {
	const wb: Workbook = new Workbook();
	for (const flow of flows) {
		const data: string[][] = [];

		childToData(data, flow, flow, -1, 0);

		let name: string = flow.content;
		if (name.length >= 31) {
			name = name.substring(0, 31);
		}
		const ws = wb.addWorksheet(name);
		ws.columns = flow.columns.map(function (column: string) {
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

				if ((x % 2 == 0 && !flow.invert) || (x % 2 == 1 && flow.invert)) {
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

export function loadFlows(data: string) {
	const rawFlows = JSON.parse(data);
	const newFlows = rawFlows.map((flow: Flow) => {
		flow.history = new History(flow);
		return flow;
	});
	return newFlows;
}
