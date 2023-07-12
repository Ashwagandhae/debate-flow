<script lang="ts">
	// https://github.com/brunomolteni/svelte-sortable-list/blob/master/SortableList.svelte
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { tab, tabList } from '../models/transition';
	import { tick, onMount } from 'svelte';
	import { settings } from '$lib/models/settings';

	let transitionSpeed: number = settings.data['transitionSpeed'].value as number;

	onMount(() => {
		settings.subscribe(['transitionSpeed'], (key: string) => {
			transitionSpeed = settings.data[key].value as number;
		});
	});

	// FLIP ANIMATION
	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * transitionSpeed),
		fallback: tab
	});

	// DRAG AND DROP
	let overFirst: number | null = null;
	let overSecond: number | null = null;
	let dragSource: number | null = null;
	const overHalf = (ev: DragEvent & { target: HTMLElement }) => {
		let rect = ev.target.getBoundingClientRect();
		let offset = ev.clientY - rect.top;
		let half = rect.height / 2;
		return offset > half;
	};
	const getDraggedParent: (node: HTMLElement) => DOMStringMap = (node: HTMLElement) =>
		node.dataset && node.dataset.index
			? node.dataset
			: getDraggedParent(node.parentNode as HTMLElement);
	const start = (ev: any) => {
		ev.dataTransfer.setData('source', ev.target.dataset.index);
		dragSource = parseInt(ev.target.dataset.index);
	};
	const over = (ev: any) => {
		ev.preventDefault();
		let dragged = getDraggedParent(ev.target);
		let index = parseInt(dragged.index as string);
		if (overHalf(ev)) {
			overFirst = index;
			overSecond = index + 1;
		} else {
			overFirst = index - 1;
			overSecond = index;
		}
	};
	const leave = (ev: any) => {
		let dragged = getDraggedParent(ev.target);
		let index = parseInt(dragged.index as string);
		overFirst = null;
		overSecond = null;
	};
	const drop = (ev: any) => {
		ev.preventDefault();
		overFirst = null;
		overSecond = null;
		dragSource = null;
		let dragged = getDraggedParent(ev.target);
		let from: number = parseInt(ev.dataTransfer.getData('source'));
		let to: number = parseInt(dragged.index as string);
		// check whether dropped in bottom or top half
		if (!overHalf(ev)) {
			to -= 1;
		}
		reorder({ from, to });
	};

	// DISPATCH REORDER
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	const reorder = ({ from, to }: { from: number; to: number }) => {
		dispatch('sort', { from, to });
	};

	// UTILS
	const getKey = (item: any) => (key ? item[key] : item);

	// PROPS
	export let list: any[];
	export let key: string;

	let element: HTMLElement;
	async function changeHeight(reset = false) {
		if (reset && element != null) {
			// set to auto to prevent animation on mount
			element.style.height = 'auto';
		}
		await tick();
		/// combine heights of children
		let height = 0;
		for (let i = 0; i < list.length; i++) {
			height += element.children[i].scrollHeight;
		}
		if (element == null) return;
		element.style.height = `calc(${height}px)`;
	}
	onMount(() => {
		changeHeight(true);
	});

	$: list, changeHeight();
</script>

{#if list && list.length}
	<ul bind:this={element} out:tabList>
		{#each list as item, index (getKey(item))}
			<li
				data-index={index}
				data-id={JSON.stringify(getKey(item))}
				draggable="true"
				on:dragstart={start}
				on:dragover={over}
				on:dragleave={leave}
				on:drop={drop}
				in:receive={{ key: getKey(item) }}
				out:send={{ key: getKey(item) }}
				animate:flip={{ duration: transitionSpeed }}
				class:overFirst={index === overFirst}
				class:overSecond={index === overSecond}
				class:dragSource={index === dragSource}
			>
				<slot {item} {index} />
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		position: relative;
		transition: height var(--transition-speed) ease-in;
		display: block;
		height: 0px;
		box-sizing: border-box;
	}
	li {
		/* need these to remove drag background */
		position: relative;
		z-index: 1;
		height: min-content;
	}
</style>
