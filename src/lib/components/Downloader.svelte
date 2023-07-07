<script lang="ts">
	import { flows } from '$lib/models/stores';
	import Button from './Button.svelte';
	import { Workbook, type Buffer } from 'exceljs';
	import type { Flow, Box } from '../models/types';
	import { changesSaved } from '$lib/models/stores';

	export let closePopup: () => void;

	function download() {
		$changesSaved = true;
		let data: string = JSON.stringify($flows, (key, value) => {
			if (key === 'history') {
				return undefined;
			}
			return value;
		});
		let element: HTMLAnchorElement = document.createElement('a');
		element.setAttribute('href', 'data:text/json;charset=utf-8, ' + encodeURIComponent(data));
		element.setAttribute('download', 'flow.json');
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		closePopup();
	}
	function downloadXLSX() {
		$changesSaved = true;
		let wb: Workbook = new Workbook();
		for (let flow of $flows) {
			let data: string[][] = [];

			function childToData(box: Box, x: number, y: number) {
				let height = 0;
				for (let child of box.children) {
					height += childToData(child, x + 1, y + height);
				}
				// acutally add it to data
				while (!data[y]) {
					// make list of empty strings of length flow.columns.length
					let row: string[] = Array.from({ length: flow.columns.length }, () => '');
					data.push(row);
				}
				// exclude root
				if (x >= 0) {
					data[y][x] = box.content;
				}
				// return 1 height if no children
				return Math.max(1, height);
			}
			childToData(flow, -1, 0);

			let name: string = flow.content;
			if (name.length >= 31) {
				name = name.substring(0, 31);
			}
			let ws = wb.addWorksheet(name);
			ws.columns = flow.columns.map(function (column: string) {
				return { header: column, width: 25 };
			});
			for (let y = 0; y < data.length; y++) {
				// make space for header with + 2
				let row = ws.getRow(y + 2);
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
					let cell = row.getCell(x + 1);
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
				let a: HTMLAnchorElement = document.createElement('a');
				let data: Blob = new Blob([value], {
					type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				});

				let url: string = URL.createObjectURL(data);
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
		closePopup();
	}
</script>

<div class="top">
	<section class="json">
		<Button
			icon="download"
			text="download as JSON"
			tooltip="saves JSON file on your computer"
			tooltipLayout="top"
			on:click={download}
			disabled={$flows.length == 0}
			disabledReason={'nothing to download'}
		/>
		<ul>
			<li>Can reopen file in this editor</li>
			<li>More data is saved (last focused cell etc.)</li>
		</ul>
	</section>
	<section class="xlsx">
		<Button
			icon="download"
			text="download as XLSX"
			tooltip="saves XLSX file on your computer"
			tooltipLayout="top"
			on:click={downloadXLSX}
			disabled={$flows.length == 0}
			disabledReason={'nothing to download'}
		/>
		<ul>
			<li>Anyone can view it</li>
		</ul>
	</section>
</div>

<style>
	.top {
		width: clamp(400px, 30vw, 600px);
		height: min-content;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	ul {
		line-height: 1.6em;
		margin: 0;
		padding-left: var(--padding-big);
		color: var(--color-subtle);
	}

	section {
		width: 100%;
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
	}
	.json {
		background: var(--background-secondary);
	}
</style>
