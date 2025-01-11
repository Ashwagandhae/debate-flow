<script lang="ts">
	import Setting from './Setting.svelte';
	import Button from './Button.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import { settingsGroups, settings } from '$lib/models/settings';
	import { onDestroy } from 'svelte';

	export const closePopup: () => void = () => {};
	onDestroy(() => {
		settings.saveToLocalStorage();
	});

	let settingComponents: Setting[][] = [];
	let groupHeaderElements: HTMLElement[] = [];
	for (let i = 0; i < settingsGroups.length; i++) {
		settingComponents.push([]);
	}
	function scrollToSettingElement(groupIndex: number, index: number) {
		settingComponents[groupIndex][index].scrollToSelf();
	}
	function scrollToGroupHeader(groupIndex: number) {
		groupHeaderElements[groupIndex].scrollIntoView();
	}
</script>

<div class="top palette-plain">
	<div class="outline">
		<div class="outlineScroll" class:customScrollbar={settings.data.customScrollbar.value}>
			<ul>
				{#each settingsGroups as group, groupIndex}
					<li class="title">
						<button
							on:click={(e) => {
								scrollToGroupHeader(groupIndex);
							}}
						>
							{group.name}
						</button>
					</li>
					{#each group.settings as key, index}
						<li>
							<button on:click={() => scrollToSettingElement(groupIndex, index)}>
								{settings.data[key].name}
							</button>
						</li>
					{/each}
				{/each}
			</ul>
		</div>
	</div>
	<div class="content" class:customScrollbar={settings.data.customScrollbar.value}>
		<section class="controls">
			<Button
				icon="arrowRoundLeft"
				text="reset all settings"
				on:click={() => settings.resetToAuto()}
			/>
			<Button
				icon="dots"
				text="randomize settings"
				tooltip="why would you click this"
				on:click={() => settings.randomize()}
			/>
		</section>
		<section class="settings">
			<ul>
				<!-- {#each Object.keys(settings.data) as key, index}
					<Setting {key} setting={settings.data[key]} bind:this={settingComponents[index]} />
				{/each} -->
				{#each settingsGroups as group, groupIndex}
					<li class="title" bind:this={groupHeaderElements[groupIndex]}>
						<h1>
							{group.name}
						</h1>
					</li>
					{#each group.settings as key, index}
						<Setting
							{key}
							setting={settings.data[key]}
							bind:this={settingComponents[groupIndex][index]}
						/>
					{/each}
				{/each}
			</ul>
		</section>
	</div>
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 1100px);
		height: min(calc(100vh - var(--padding) * 2), 700px);
		display: grid;
		grid-template-columns: calc(max(150px, 20%) + var(--padding-big)) 1fr;
	}
	.outline {
		width: 100%;
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: left;
		gap: var(--padding);
		background-color: var(--background-secondary);
		overflow: hidden;
	}
	.outlineScroll {
		overflow: auto;
		height: 100%;
		padding: 0 var(--padding);
	}
	.outlineScroll ul {
		padding-bottom: 50vh;
	}

	.settings .title {
		width: 100%;
		max-width: 30rem;
		box-sizing: border-box;
		padding: calc(var(--padding-big) * 2) var(--padding) var(--padding) var(--padding);
	}
	.settings .title h1 {
		font-weight: var(--font-weight-bold);
	}
	.outline button {
		border: none;
		background: none;
		display: block;
		width: calc(100% - var(--padding));
		text-align: left;
		border-radius: var(--border-radius);
		color: var(--this-text);
		padding: var(--padding);
		overflow-wrap: break-word;
		transition: background var(--transition-speed);
		font-weight: var(--font-weight);
		margin-left: var(--padding);
	}
	.outline button:hover {
		background-color: var(--this-background-indent);
	}
	.outline button:active {
		transition: none;
		background-color: var(--this-background-active);
	}

	.outline .title button {
		font-weight: var(--font-weight-bold);
		margin-top: var(--padding);
		padding: var(--padding);
		margin-left: 0;
		width: 100%;
	}

	.content {
		box-sizing: border-box;
		width: 100%;
		padding-top: calc(var(--button-size) + var(--padding));
		overflow: auto;
		scroll-behavior: smooth;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding-big);
		height: inherit;
		position: relative;
	}
	.settings {
		width: 100%;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.settings ul {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.content > .settings > ul {
		padding-bottom: 50vh;
	}
	.controls {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding);
		justify-content: center;
	}
	@media (max-width: 800px) {
		.controls {
			flex-direction: column;
		}
	}
</style>
