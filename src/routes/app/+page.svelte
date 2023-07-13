<script lang="ts">
	import Flow from '$lib/components/Flow.svelte';
	import Title from '$lib/components/Title.svelte';
	import BoxControl from '$lib/components/BoxControl.svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonBar from '$lib/components/ButtonBar.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import Downloader from '$lib/components/Downloader.svelte';
	import Uploader from '$lib/components/Uploader.svelte';
	import Error from '$lib/components/Error.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import SortableList from '$lib/components/SortableList.svelte';
	import Tutorial from '$lib/components/Tutorial.svelte';
	import TutorialHighlight from '$lib/components/TutorialHighlight.svelte';
	import AddTab from '$lib/components/AddTab.svelte';
	import Tab from '$lib/components/Tab.svelte';
	import type { Flow as IFlow } from '$lib/models/types';
	import { screenTransition } from '$lib/models/transition';
	import { onDestroy, onMount, tick } from 'svelte';
	import {
		activeMouse,
		flows,
		selected,
		boxFromPath,
		newFlow,
		History,
		changesSaved
	} from '$lib/models/stores';
	import { createKeyDownHandler } from '$lib/models/keys';

	let destroyers: (() => void)[] = [];
	$: unsavedChanges = $flows.length > 0 && !$changesSaved;
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
			if (unsavedChanges) {
				let confirmationMessage = 'Are you sure you want to leave?';
				e.returnValue = confirmationMessage;
				return confirmationMessage;
			}
		});
	});
	onDestroy(() => {
		destroyers.forEach((destroy) => destroy());
	});

	function clickTab(index: number) {
		blurFlow();
		$selected = index;
		focusFlow();
	}
	function focusFlow() {
		let lastFocus = boxFromPath($flows[$selected], $flows[$selected]?.lastFocus);
		if (lastFocus == null) {
			lastFocus = $flows[$selected];
		}
		lastFocus.focus = true;
		$flows = $flows;
	}
	function blurFlow() {
		if ($flows.length > 0) {
			let lastFocus = boxFromPath($flows[$selected], $flows[$selected].lastFocus);
			if (!lastFocus) {
				lastFocus = $flows[$selected];
			}
			lastFocus.focus = false;
			$flows = $flows;
			(document.activeElement as HTMLElement).blur();
		}
	}

	function addFlow(type: 'primary' | 'secondary') {
		blurFlow();
		let flow = newFlow($flows.length, type, switchSpeakers);
		if (flow == null) return;
		$flows.push(flow);
		$selected = $flows.length - 1;
		$flows = $flows;
	}

	async function deleteFlow(index: number) {
		blurFlow();
		$flows.splice(index, 1);
		if (index == 0) {
			$selected = 0;
		} else {
			$selected = index - 1;
		}
		$flows = $flows;
		if ($flows.length > 0) {
			focusFlow();
		}
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
					$flows[$selected].history.redo();
				},
				require: () => $flows.length > 0,
				stopRepeat: false
			},
			Backspace: {
				handle: () => {
					deleteFlow($selected);
				},
				require: () => $flows.length > 0
			}
		},
		commandControl: {
			z: {
				handle: () => $flows[$selected].history.undo(),
				require: () => $flows.length > 0,
				stopRepeat: false
			}
		},
		'commandControl alt': {
			ArrowUp: {
				handle: () => {
					let newSelected = $selected - 1 < 0 ? $flows.length - 1 : $selected - 1;
					clickTab(newSelected);
				},
				require: () => $flows.length > 0,
				stopRepeat: false
			},
			ArrowDown: {
				handle: () => {
					let newSelected = $selected + 1 >= $flows.length ? 0 : $selected + 1;
					clickTab(newSelected);
				},
				require: () => $flows.length > 0,
				stopRepeat: false
			}
		}
	});
	function handleKeydown(e: KeyboardEvent) {
		$activeMouse = false;
		keyDownHandler(e);
	}

	// function handleKeydown(e: KeyboardEvent) {
	// 	$activeMouse = false;
	// 	if (e.ctrlKey && e.shiftKey && e.key == 'N') {
	// 		e.preventDefault();
	// 		addFlow('secondary');
	// 	} else if (e.ctrlKey && e.key == 'n') {
	// 		e.preventDefault();
	// 		addFlow('primary');
	// 	}
	// 	if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key == 'z') {
	// 		e.preventDefault();
	// 		$flows[$selected].history.redo();
	// 	} else if ((e.metaKey || e.ctrlKey) && e.key == 'z') {
	// 		e.preventDefault();
	// 		$flows[$selected].history.undo();
	// 	}
	// }

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
		let rawFlows: unknown[];
		let newFlows: IFlow[] | null = null;
		try {
			rawFlows = JSON.parse(data);
			newFlows = rawFlows.map((flow: any) => {
				flow.history = new History(flow);
				return flow;
			});
		} catch (e) {
			openPopup(Error, 'File Error', {
				props: { message: 'Invalid file' }
			});
		}
		if (newFlows != null) {
			if (!unsavedChanges || confirm('Are you sure you want to overwrite your current flows?')) {
				$flows = newFlows;
				$selected = 0;
			}
		}
	}

	let popups: {
		component: Uploader | Downloader | Settings | Error;
		title: string;
		props: any;
	}[] = [];
	function closePopup(index: number) {
		popups.splice(index, 1);
		popups = popups;
	}
	function openPopup(component: any, title: string, { props = {} } = {}) {
		popups.push({ component, props, title });
		popups = popups;
	}

	function handleSort(e: { detail: { from: number; to: number } }) {
		let { from, to } = e.detail;
		let selectedId = $flows[$selected].id;
		let newFlows = [...$flows];
		// add to to if needed
		if (from > to) {
			to += 1;
		}
		let flow = newFlows.splice(from, 1)[0];
		newFlows.splice(to, 0, flow);

		$flows = newFlows;
		$selected = $flows.findIndex((flow) => flow.id == selectedId);
	}

	let switchSpeakers = false;

	// TODO:
	// add tab switch keyboard shortcut
	// add cross out
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
	{#if popups.length > 0}
		<!-- we can ignore because pressing escape on window already has same functionality -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="screen"
			on:click|self={() => {
				closePopup(0);
			}}
			transition:screenTransition
		>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="popups"
				on:click|self={() => {
					closePopup(0);
				}}
			>
				{#key popups}
					<Popup
						component={popups[0].component}
						closeSelf={() => closePopup(0)}
						title={popups[0].title}
						props={popups[0].props}
					/>
				{/key}
			</div>
		</div>
	{/if}
	<input id="uploadId" type="file" hidden on:change={readUpload} />
	<div class="grid" class:tutorialMode={$flows.length == 0}>
		<div class="sidebar">
			<div class="header">
				<ButtonBar>
					<TutorialHighlight showOn={1}>
						<Button icon="home" link="/" tooltip="go home" />
					</TutorialHighlight>
					<TutorialHighlight showOn={2}>
						<Button
							icon="gear"
							on:click={() => openPopup(Settings, 'Settings')}
							tooltip="settings"
						/>
					</TutorialHighlight>
					<TutorialHighlight showOn={3}>
						<Button
							icon="download"
							on:click={() => openPopup(Downloader, 'Download')}
							disabled={$flows.length == 0}
							disabledReason={'nothing to download'}
							tooltip="download as file"
						/>
					</TutorialHighlight>
					<TutorialHighlight showOn={3}>
						<Button
							icon="upload"
							on:click={() => openPopup(Uploader, 'Upload')}
							tooltip="import file"
						/>
					</TutorialHighlight>
				</ButtonBar>
			</div>
			<div class="tabs">
				<div class="tabScroll">
					<SortableList list={$flows} key="id" on:sort={handleSort} let:index>
						<Tab
							on:click={() => clickTab(index)}
							bind:flow={$flows[index]}
							selected={index == $selected}
						/>
					</SortableList>
					<AddTab {addFlow} bind:switchSpeakers />
				</div>
			</div>
		</div>
		{#if $flows.length > 0 && $flows[$selected]}
			{#key $selected}
				{#key $flows.length}
					<div class="title">
						<Title
							bind:content={$flows[$selected].content}
							bind:children={$flows[$selected].children}
							bind:focus={$flows[$selected].focus}
							bind:invert={$flows[$selected].invert}
							deleteSelf={() => deleteFlow($selected)}
						/>
					</div>
					<div class="box-control">
						<BoxControl bind:flow={$flows[$selected]} />
					</div>
					<div class="flow">
						<Flow on:focusFlow={focusFlow} bind:root={$flows[$selected]} />
					</div>
				{/key}
			{/key}
		{:else}
			<div class="tutorial">
				<Tutorial />
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
	}
	.grid.tutorialMode {
		grid-template-areas: 'sidebar tutorial';
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
	.tutorial {
		width: 100%;
		height: var(--main-height);
		grid-area: tutorial;
	}
	/* Hide scrollbar for Chrome, Safari and Opera */
	.tabs::-webkit-scrollbar,
	.flow::-webkit-scrollbar {
		display: none;
	}
	/* Hide scrollbar for IE, Edge and Firefox */
	.tabs,
	.flow {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.screen {
		background-color: var(--color-screen);
		width: 100vw;
		height: 100vh;
		position: fixed;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}
	.popups {
		width: 100vw;
		height: min-content;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
