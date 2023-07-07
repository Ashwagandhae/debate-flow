<script lang="ts">
	import Icon from './Icon.svelte';
	import Tooltip from './Tooltip.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { settings } from '$lib/models/settings';
	import { tutorialStep } from '$lib/models/stores';
	import { tutorialSpan, tutorialBlock } from '$lib/models/transition';
	import Button from './Button.svelte';

	let transitionSpeed: number = settings.data['transitionSpeed'].value as number;

	onMount(() => {
		tutorialStep.set(0);
		settings.subscribe(['transitionSpeed'], (key: string) => {
			transitionSpeed = settings.data[key].value as number;
		});
	});
	let delay = 600;
	let tutorialEnd = 7;
	onDestroy(() => {
		tutorialStep.set(0);
	});
</script>

<button
	class="top"
	on:click={() => {
		if ($tutorialStep < tutorialEnd) {
			$tutorialStep += 1;
		}
	}}
>
	{#if $tutorialStep > 0}
		<div class="instruction" in:tutorialBlock>
			<Icon name="arrowLeft" />
			<p>
				<span>
					click to go <span class="primary">home</span>,
				</span>
				{#if $tutorialStep > 1}
					<span in:tutorialSpan>
						to open <span class="primary">settings</span>,
					</span>
				{/if}
				{#if $tutorialStep > 2}
					<span in:tutorialSpan>
						and to <span class="secondary">download/upload</span>
					</span>
				{/if}
			</p>
		</div>
	{/if}
	{#if $tutorialStep > 3}
		<div class="instruction" in:tutorialBlock>
			<Icon name="arrowLeft" />
			<p>
				<span>
					click to create a new flow on <span class="primary">aff</span>
				</span>
				{#if $tutorialStep > 4}
					<span in:tutorialSpan>
						or <span class="secondary">neg</span>
					</span>
				{/if}
			</p>
		</div>
	{/if}
	{#if $tutorialStep > 5}
		<div class="tipsWrapper">
			<div class="tips" in:tutorialBlock>
				<h1>Tips</h1>
				<div class="instruction" in:tutorialSpan={{ delay: delay }}>
					<Icon name="dots" />
					<p>
						<Tooltip content="yes like this" inline>
							<span class="primary">hover</span>
						</Tooltip>
						over buttons to see what they do
					</p>
				</div>
				<div class="instruction" in:tutorialSpan={{ delay: delay * 2 }}>
					<Icon name="undo" />
					<p>
						use <span class="secondary">undo</span> and
						<span class="secondary">redo</span> if you make a mistake
					</p>
				</div>
				<div class="instruction" in:tutorialSpan={{ delay: delay * 3 }}>
					<Icon name="arrowUp" />
					<p>
						use the <span class="primary">arrow keys</span> to move around
					</p>
				</div>
				<div class="instruction" in:tutorialSpan={{ delay: delay * 4 }}>
					<Icon name="settings" />
					<p>
						click on <span class="primary">settings</span> to customize
					</p>
				</div>
			</div>
		</div>
	{/if}
	{#if $tutorialStep >= tutorialEnd}
		<div class="instruction continue">
			<Icon name="check" />
			<p>tutorial done</p>
			<Button
				icon="undo"
				text="reset"
				tooltip="reset tutorial"
				on:click={(event) => {
					event.stopPropagation();
					$tutorialStep = 0;
				}}
			/>
		</div>
	{:else if $tutorialStep == 0}
		<div class="instruction continue start">
			<Icon name="add" />
			<p>click this box to start tutorial</p>
		</div>
	{:else}
		<div class="instruction continue">
			<Icon name="add" />
			<p>click to continue ({$tutorialStep}/{tutorialEnd})</p>
		</div>
	{/if}
</button>

<style>
	.top {
		padding: 0;
		margin: 0;
		border: none;
		background: none;
		height: 100%;
		width: 100%;
		color: inherit;
		text-align: left;

		border-radius: var(--border-radius);
		background-color: var(--background);
		padding: var(--padding);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}
	.instruction {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding-small);

		box-sizing: content-box;
		padding: var(--padding) var(--padding) calc(var(--padding) * 2) var(--padding);
		width: max-content;
		min-width: var(--button-size);
		height: var(--button-size);

		border: none;
		background: none;
		margin: 0;
		text-align: left;
		border-radius: var(--border-radius);
		font-weight: var(--font-weight);
		color: var(--this-text);
		transition: background var(--transition-speed);
	}
	.instruction:last-child {
		padding-bottom: var(--padding);
	}
	p {
		display: block;
		color: var(--text);
	}
	.primary {
		color: var(--text-accent);
	}
	.secondary {
		color: var(--text-accent-secondary);
	}
	.tips {
		display: flex;
		flex-direction: column;
		padding: var(--padding);
		padding-bottom: var(--padding);
		background: var(--background-indent);
		border-radius: var(--border-radius);
		width: min-content;
	}
	.tipsWrapper {
		padding-bottom: var(--padding);
	}
	.continue {
		color: var(--text-weak);
	}
	.continue p {
		color: var(--text-weak);
	}
	.continue.start,
	.continue.start p {
		color: var(--text);
	}
</style>
