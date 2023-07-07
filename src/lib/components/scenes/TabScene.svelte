<script lang="ts">
	import FakeTab from './FakeTab.svelte';
	import { onMount } from 'svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;

	let dragTab: HTMLElement;
	let aboveTabs: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		let height = () => dragTab.clientHeight;

		let otherHeight = () => aboveTabs.clientHeight;
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
			translateY: [0, () => -1 * height()],
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
			duration: 500
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
				translateY: [() => -1 * height(), 0],
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
</style>
