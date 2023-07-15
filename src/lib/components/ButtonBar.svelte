<script lang="ts">
	import Button from './Button.svelte';
	import { onMount, type ComponentProps, onDestroy } from 'svelte';
	import { settings } from '$lib/models/settings';
	import { hiddenButtons as hiddenButtonsTransition } from '$lib/models/transition';

	export let buttons: ComponentProps<Button>[];
	export let showCount: number = buttons.length;

	export let resize: boolean = false;

	let element: HTMLDivElement;

	let buttonSize: number = settings.data['buttonSize'].value as number;
	let padding: number = settings.data['padding'].value as number;
	if (resize) {
		onDestroy(
			settings.subscribe(['padding'], (key: string) => {
				padding = settings.data[key].value as number;
				handleResize();
			})
		);
		onDestroy(
			settings.subscribe(['buttonSize'], (key: string) => {
				buttonSize = settings.data[key].value as number;
				handleResize();
			})
		);
	}
	let resizeObserver: ResizeObserver;
	onMount(() => {
		if (resize) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(element);
		}
	});
	onDestroy(() => {
		if (resize) {
			resizeObserver.unobserve(element);
		}
	});

	function handleResize() {
		if (element == null) return;
		let width = element.clientWidth;
		showCount = Math.max(0, Math.floor((width + padding) / (buttonSize + padding * 3)) - 1);
		if (showCount == buttons.length - 1) {
			showCount = buttons.length;
		}
	}

	$: showButtons = buttons.slice(0, showCount);
	$: hiddenButtons = buttons.slice(showCount);

	let show = false;
</script>

<div class="top" bind:this={element} class:allButtonsHidden={showButtons.length == 0}>
	<div class="buttons">
		<div class="showButtons">
			{#each showButtons as button}
				<Button {...button} />
			{/each}
		</div>
		<div class="hideButtons">
			{#if hiddenButtons.length > 0}
				<Button icon={show ? 'delete' : 'ellipses'} on:click={() => (show = !show)} />
			{/if}
			{#if show && hiddenButtons.length > 0}
				<div class="hidden" transition:hiddenButtonsTransition>
					{#each hiddenButtons as button}
						<Button {...button} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.top {
		/* min-width: calc(var(--button-size) + var(--padding) * 2); */
		min-width: 0;
		position: relative;
		box-sizing: border-box;
		width: auto;
		position: relative;
	}
	.buttons {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}
	.allButtonsHidden .buttons {
		justify-content: center;
	}
	.showButtons {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding);
	}
	.hideButtons {
		position: relative;
	}
	.hidden {
		z-index: 900;
		position: absolute;
		top: calc(var(--button-size) + var(--padding) * 2);
		right: calc(-1 * var(--padding));
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
		padding: var(--padding);
		background: var(--background-back);
		border-radius: var(--border-radius);
	}
</style>
