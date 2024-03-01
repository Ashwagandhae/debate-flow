<script lang="ts">
	import Flow from '$lib/components/Flow.svelte';
	import Title from '$lib/components/Title.svelte';
	import BoxControl from '$lib/components/BoxControl.svelte';
	import ButtonBar from '$lib/components/ButtonBar.svelte';
	import DownloadUpload from '$lib/components/DownloadUpload.svelte';
	import Error from '$lib/components/Error.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import SortableList from '$lib/components/SortableList.svelte';
	import AddTab from '$lib/components/AddTab.svelte';
	import Share from '$lib/components/Share.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import { dev } from '$app/environment';
	import { openPopup } from '$lib/models/popup';
	// TODO: add link sharing instead of paste sharing
	// TODO add popup that informs users of changes
	// TODO add link to legacy version
	import type { FlowId, Nodes } from '$lib/models/node';
	import { onDestroy, onMount } from 'svelte';
	import { activeMouse, flowsChange, subscribeFlowsChange } from '$lib/models/store';
	import { createKeyDownHandler } from '$lib/models/key';
	import Prelude from '$lib/components/Prelude.svelte';
	import { loadNodes } from '$lib/models/file';
	import Timers from '$lib/components/Timers.svelte';
	import Help from '$lib/components/Help.svelte';
	import { settings } from '$lib/models/settings';
	import SideDoc from '$lib/components/SideDoc.svelte';
	import { addNewFlow, deleteFlow, moveFlow, nodes } from '$lib/models/node';
	import { history } from '$lib/models/history';
	import { focusId, lastFocusIds, selectedFlowId } from '$lib/models/focus';

	let changesSaved = true;
	subscribeFlowsChange(() => {
		changesSaved = false;
	});
	$: unsavedChanges = $nodes.root.children.length > 0 && !changesSaved;

	onMount(() => {
		window.addEventListener(
			'dragover',
			function (e) {
				e.preventDefault();
			},
			false
		);
		window.addEventListener(
			'drop',
			function (e) {
				e.preventDefault();
			},
			false
		);
		// changes you made may not be saved
		window.addEventListener('beforeunload', function (e) {
			if (unsavedChanges && !dev) {
				let confirmationMessage = 'Are you sure you want to leave?';
				e.returnValue = confirmationMessage;
				return confirmationMessage;
			}
		});
	});

	let showSideDoc: boolean = settings.data['showSideDoc'].value as boolean;

	onDestroy(
		settings.subscribe(['showSideDoc'], (key: string) => {
			showSideDoc = settings.data[key].value as boolean;
		})
	);

	function clickTab(id: FlowId) {
		blurFlow();
		$selectedFlowId = id;
		focusFlow();
	}
	function focusFlow() {
		if ($selectedFlowId == null) return;
		let lastFocus = $lastFocusIds[$selectedFlowId];
		if (lastFocus == null) {
			lastFocus = $selectedFlowId;
		}
		$focusId = lastFocus;
	}
	function blurFlow() {
		$focusId = null;
	}

	function addFlow(type: 'primary' | 'secondary') {
		let id = addNewFlow($nodes, $nodes.root.children.length, type, switchSpeakers);
		$nodes = $nodes;
		if (id != null) {
			$selectedFlowId = id;
			focusFlow();
		}
	}

	async function deleteFlowAndFocus() {
		if ($selectedFlowId == null) return;

		blurFlow();

		let oldIndex = $nodes.root.children.indexOf($selectedFlowId);
		deleteFlow($nodes, $selectedFlowId);
		$nodes = $nodes;

		let nextIndex;
		if (oldIndex == 0) {
			nextIndex = 0;
		} else {
			nextIndex = oldIndex - 1;
		}
		if ($nodes.root.children.length > 0) {
			$selectedFlowId = $nodes.root.children[nextIndex];
			focusFlow();
		} else {
			$selectedFlowId = null;
		}
	}

	function handleSort(e: { detail: { from: number; to: number } }) {
		let { from, to } = e.detail;
		if (from > to) {
			to += 1;
		}
		moveFlow($nodes, $nodes.root.children[from], to);
		$nodes = $nodes;
	}

	function handleMouseMove(e: MouseEvent) {
		$activeMouse = true;
	}
	const keyDownHandler = createKeyDownHandler({
		control: {
			n: { handle: () => addFlow('primary') }
		},
		'control shift': {
			n: { handle: () => addFlow('secondary') }
		},
		'commandControl shift': {
			z: {
				handle: () => {
					if ($selectedFlowId == null) return;
					history.redo($nodes, $selectedFlowId);
					$nodes = $nodes;
				},
				require: () => {
					if ($selectedFlowId == null) return false;
					return history.canRedo($selectedFlowId);
				},
				stopRepeat: false,
				preventDefault: 'always'
			}
		},
		commandControl: {
			z: {
				handle: () => {
					if ($selectedFlowId == null) return;
					history.undo($nodes, $selectedFlowId);
					$nodes = $nodes;
				},
				require: () => {
					if ($selectedFlowId == null) return false;
					return history.canUndo($selectedFlowId);
				},
				stopRepeat: false,
				preventDefault: 'always'
			}
		},
		'commandControl alt': {
			ArrowUp: {
				handle: () => {
					if ($selectedFlowId == null) return;
					let index =
						$nodes.root.children.indexOf($selectedFlowId) - (1 % $nodes.root.children.length);
					clickTab($nodes.root.children[index]);
				},
				require: () => $nodes.root.children.length > 0,
				stopRepeat: false
			},
			ArrowDown: {
				handle: () => {
					if ($selectedFlowId == null) return;
					let index =
						$nodes.root.children.indexOf($selectedFlowId) + (1 % $nodes.root.children.length);
					clickTab($nodes.root.children[index]);
				},
				require: () => $nodes.root.children.length > 0,
				stopRepeat: false
			}
		}
	});
	function handleKeydown(e: KeyboardEvent) {
		$activeMouse = false;
		keyDownHandler(e);
	}

	function readUploadDragged(e: DragEvent) {
		e.preventDefault();
		let file = e?.dataTransfer?.files[0];
		if (file == undefined) {
			return;
		}

		let reader: FileReader = new FileReader();
		reader.onload = function (fileLoadedEvent) {
			let uploadData = fileLoadedEvent.target?.result;
			if (uploadData == undefined) return;
			handleUpload(uploadData.toString());
		};
		// check if can readAsText
		if (file.type == 'text/plain') {
			reader.readAsText(file, 'UTF-8');
		} else if (file.type == 'application/json') {
			reader.readAsText(file, 'UTF-8');
		} else {
			openPopup(Error, 'File Error', {
				props: { message: 'Invalid file' }
			});
		}
	}
	function readUpload() {
		const files = (<HTMLInputElement>document.getElementById('uploadId'))?.files;
		if (files == undefined) return;
		let file = files[0];

		let reader: FileReader = new FileReader();
		reader.onload = function (fileLoadedEvent) {
			let uploadData = fileLoadedEvent.target?.result;
			if (uploadData == undefined) return;
			handleUpload(uploadData.toString());
		};
		reader.readAsText(file, 'UTF-8');
	}
	function preventDefault(e: { preventDefault: () => void }) {
		e.preventDefault();
	}

	async function handleUpload(data: string) {
		let newNodes: Nodes | null = null;
		try {
			newNodes = loadNodes(data);
		} catch (e) {
			openPopup(Error, 'File Error', {
				props: { message: 'Invalid file' }
			});
		}
		if (newNodes != null) {
			if (!unsavedChanges || confirm('Are you sure you want to overwrite your current flows?')) {
				$nodes = newNodes;
				$selectedFlowId = null;
				flowsChange();
			}
		}
	}

	let switchSpeakers = false;

	// TODO:
	// add command K
	// add command f
	// add capitalization
</script>

<svelte:body
	on:keydown={handleKeydown}
	on:mousemove={handleMouseMove}
	on:dragenter={preventDefault}
	on:drop={readUploadDragged}
/>
<main class:activeMouse class="palette-plain">
	<input id="uploadId" type="file" hidden on:change={readUpload} />
	<div class="grid" class:showPrelude={$nodes.root.children.length == 0}>
		<div class="sidebar">
			<div class="header">
				<ButtonBar
					resize
					buttons={[
						{
							icon: 'link',
							onclick: () => openPopup(Help, 'Help'),
							tooltip: 'help',
							tutorialHighlight: 1
						},
						{
							icon: 'gear',
							onclick: () => openPopup(Settings, 'Settings'),
							tooltip: 'settings',
							tutorialHighlight: 2
						},
						{
							icon: 'file',
							onclick: () => openPopup(DownloadUpload, 'File'),
							tooltip: 'file',
							tutorialHighlight: 3
						},
						{
							icon: 'people',
							onclick: () => openPopup(Share, 'Share'),
							tooltip: 'share',
							tutorialHighlight: 4
						}
					]}
				/>
			</div>
			<div class="tabs">
				<div class="tabScroll">
					<SortableList list={$nodes.root.children} on:sort={handleSort} let:index>
						<Tab
							on:click={() => clickTab($nodes.root.children[index])}
							flowId={$nodes.root.children[index]}
							selected={$selectedFlowId == $nodes.root.children[index]}
						/>
					</SortableList>
					<AddTab {addFlow} bind:switchSpeakers />
				</div>
			</div>
			<div class="timer">
				<Timers />
			</div>
		</div>
		{#if $nodes.root.children.length > 0 && $selectedFlowId != null && $nodes[$selectedFlowId]}
			{#key $selectedFlowId}
				{#key $nodes.root.children.length}
					<div class="title">
						<Title flowId={$selectedFlowId} deleteSelf={() => deleteFlowAndFocus()} />
					</div>
					<div class="box-control">
						<BoxControl flowId={$selectedFlowId} />
					</div>
					<div class="flow">
						<Flow on:focusFlow={focusFlow} flowId={$selectedFlowId} />
					</div>
					{#if showSideDoc}
						<div class="side-doc">
							<SideDoc />
						</div>
					{/if}
				{/key}
			{/key}
		{:else}
			<div class="prelude">
				<Prelude />
			</div>
		{/if}
	</div>
</main>

<style>
	.grid {
		display: grid;
		gap: var(--gap);
		grid-template-areas:
			'sidebar title box-control'
			'sidebar flow flow';
		grid-template-columns: var(--sidebar-width) 1fr auto;
		padding: var(--main-margin);
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		position: relative;
	}
	.grid:has(.side-doc) {
		grid-template-areas:
			'sidebar title box-control side-doc'
			'sidebar flow flow side-doc';
	}
	.grid.showPrelude {
		grid-template-areas: 'sidebar prelude';
		grid-template-columns: var(--sidebar-width) auto;
	}

	.sidebar {
		background: var(--background);
		width: 100%;
		height: var(--main-height);
		border-radius: var(--border-radius);
		padding: var(--padding);
		grid-area: sidebar;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}
	.header {
		height: auto;
		padding-bottom: var(--padding);
	}
	.tabs {
		overflow-y: auto;
		height: var(--main-height);
		box-sizing: border-box;
		position: relative;
	}
	.tabScroll {
		padding: 0;
		margin: 0;
		padding-top: 0;
		padding-bottom: calc(var(--view-height) * 0.6);
	}

	.title {
		background: var(--background);
		border-radius: var(--border-radius);
		width: 100%;
		grid-area: title;
		height: var(--title-height);
	}
	.box-control {
		background: var(--background);
		border-radius: var(--border-radius);
		width: 100%;
		grid-area: box-control;
		height: var(--title-height);
	}
	.flow {
		width: 100%;
		overflow-x: auto;
		background: var(--background);
		z-index: 0;
		border-radius: var(--border-radius);
		grid-area: flow;
		height: var(--view-height);
	}
	.prelude {
		position: relative;
		width: calc(100vw - var(--sidebar-width) - var(--gap) * 3);
		height: var(--main-height);
		grid-area: prelude;
	}
	.side-doc {
		position: relative;
		width: var(--side-doc-width);
		height: var(--main-height);
		grid-area: side-doc;
	}
</style>
