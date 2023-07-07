<script lang="ts">
	import { tooltipTransition } from '../models/transition';
	import Shortcut from './Shortcut.svelte';
	import { tick, onDestroy } from 'svelte';
	import { settings } from '$lib/models/settings';
	import { tooltipState } from '$lib/models/stores';

	export let content: string | null;
	export let shortcut: string[] | null = null;
	export let disabled: boolean | string = false;
	export let layout: string = 'bottom';
	export let inline: boolean = false;
	let isHovered: boolean = false;
	let x: number = 0;
	let y: number = 0;
	let element: HTMLElement;
	let tooltip: {
		offsetWidth: number;
		offsetHeight: number;
	};

	let useTooltips = true;

	onDestroy(
		settings.subscribe(['useTooltips'], function () {
			useTooltips = settings.data.useTooltips.value as boolean;
		})
	);
	let openTimeout: NodeJS.Timeout | null = null;
	async function openTooltip() {
		isHovered = true;
		mouseMove();
		await tick();
		$tooltipState.open = true;
	}
	function mouseOver() {
		if (!isHovered) {
			$tooltipState.claimed = true;
			if ($tooltipState.open) {
				openTooltip();
			} else {
				if (openTimeout == null) {
					openTimeout = setTimeout(openTooltip, 0);
				}
			}
		}
	}
	function mouseMove() {
		if (tooltip) {
			let rect = element.getBoundingClientRect();
			if (layout == 'bottom' || layout == 'top') {
				x = rect.left - tooltip.offsetWidth / 2 + rect.width / 2;
				if (x < 4) {
					x = 4;
				} else if (x + tooltip.offsetWidth > window.innerWidth - 4) {
					x = window.innerWidth - tooltip.offsetWidth - 4;
				}
				if (layout == 'bottom') {
					y = rect.bottom + 4;
				} else if (layout == 'top') {
					y = rect.top - tooltip.offsetHeight - 4;
				}
			} else if (layout == 'left' || layout == 'right') {
				y = rect.top - tooltip.offsetHeight / 2 + rect.height / 2;
				if (y < 4) {
					y = 4;
				} else if (y + tooltip.offsetHeight > window.innerHeight - 4) {
					y = window.innerHeight - tooltip.offsetHeight - 4;
				}
				if (layout == 'left') {
					x = rect.left - tooltip.offsetWidth - 4;
				} else if (layout == 'right') {
					x = rect.right + 4;
				}
			}
		}
	}
	async function onContentChanged() {
		await tick();
		mouseMove();
	}
	$: tooltip, content, shortcut, disabled, layout, onContentChanged();
	function mouseLeave() {
		if (openTimeout != null) {
			clearTimeout(openTimeout);
			openTimeout = null;
		}
		$tooltipState.claimed = false;
		isHovered = false;
		setTimeout(function () {
			if (!$tooltipState.claimed) {
				$tooltipState.open = false;
			}
		}, 300);
	}
</script>

{#if content != null && useTooltips}
	<div
		class="element"
		class:inline
		on:mouseover={mouseOver}
		on:focus={mouseOver}
		on:mouseleave={mouseLeave}
		on:blur={mouseLeave}
		on:mousemove={mouseMove}
		bind:this={element}
		role="tooltip"
	>
		<slot />
	</div>

	{#if isHovered}
		<div
			bind:this={tooltip}
			style="top: {y}px; left: {x}px;"
			class="tooltip"
			transition:tooltipTransition
		>
			<div class="content">
				{content}
			</div>
			{#if !disabled && shortcut != null}
				<Shortcut keys={shortcut} />
			{/if}
			{#if disabled}
				<div class="disabled">
					{disabled}
				</div>
			{/if}
		</div>
	{/if}
{:else}
	<slot />
{/if}

<style>
	.element {
		width: min-content;
		height: min-content;
	}
	.element.inline {
		display: inline-block;
	}
	.tooltip {
		border: none;
		padding: var(--padding);
		color: var(--text);
		background-color: var(--background-back);
		border-radius: var(--border-radius);
		position: fixed;
		white-space: nowrap;
		z-index: 10000;
		font-size: var(--font-size);
		box-shadow: var(--box-shadow);
		display: flex;
		flex-direction: column;
		gap: var(--padding-small);
	}
	.disabled {
		color: var(--text-weak);
	}
</style>
