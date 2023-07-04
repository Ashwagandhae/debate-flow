<script lang="ts">
	import FakeTab from './FakeTab.svelte';
	import { onMount } from 'svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;

	let dragTab: HTMLElement;
	let aboveTabs: HTMLElement;
	let hackEl: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		let height = hackEl.clientHeight;
		let otherHeight = height * 3;
		timeline.add({
			targets: dragTab,
			translateX: [0, 10],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add({
			targets: dragTab,
			duration: 0
		});
		let children = Array.from(aboveTabs.children);
		timeline.add({
			targets: children,
			translateY: [0, -height],
			easing: 'easeInOutSine',
			duration: 500,
			delay: anime.stagger(100)
		});
		timeline.add(
			{
				targets: dragTab,
				translateY: [0, otherHeight],
				easing: 'easeInOutSine'
			},
			'-=500'
		);
		timeline.add({
			targets: dragTab,
			translateX: [10, 0],
			easing: 'easeInOutSine',
			duration: 500,
			begin: () => {
				dragTab.classList.remove('hover');
			}
		});
		timeline.add({
			targets: dragTab,
			duration: 0
		});
		// undo everything
		timeline.add({
			duration: 2000
		});
		timeline.add({
			targets: dragTab,
			translateX: [0, 10],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add({
			targets: dragTab,
			translateY: [otherHeight, 0],
			easing: 'easeInOutSine'
		});
		children.reverse();
		timeline.add(
			{
				targets: children,
				translateY: [-height, 0],
				easing: 'easeInOutSine',
				duration: 500,
				delay: anime.stagger(100)
			},
			'-=800'
		);
		timeline.add({
			targets: dragTab,
			translateX: [10, 0],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top palette-accent">
	<div class="dragTab palette-accent-secondary" bind:this={dragTab}>
		<FakeTab text="CP States" />
	</div>
	<div class="aboveTabs" bind:this={aboveTabs}>
		<FakeTab text="A1 Nuclear War" />
		<FakeTab text="A2 Asteroids" />
		<FakeTab text="A3 Structural Violence" />
	</div>
	<div class="palette-accent-secondary">
		<FakeTab text="CP Space Elevator" />
	</div>
	<div bind:this={hackEl} class="hack" />
</div>

<style>
	.top {
		width: 100%;
		height: 100%;
		position: relative;
		--tab-width: 200px;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.dragTab {
		z-index: 1000;
	}
	.hack {
		position: fixed;
		pointer-events: none;
		height: calc(var(--padding) * 3 + var(--font-size) * 1.25);
	}
</style>
