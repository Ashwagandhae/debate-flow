<script lang="ts">
	import { onMount } from 'svelte';
	import FakeButton from './FakeButton.svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;

	let flows: HTMLElement;
	let button: HTMLElement;

	onMount(() => {
		// let height = addedResponse.clientHeight;
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});

		let children = Array.from(flows.children);

		children.reverse();
		timeline.add({
			targets: children,
			rotate: [anime.stagger([20, -20]), 0],
			translateX: [anime.stagger([100, 20]), 60],
			translateY: [50, 100],
			scale: 0,
			delay: anime.stagger(100),
			easing: 'easeInOutSine',
			duration: 1000
		});
		timeline.add(
			{
				targets: button,
				opacity: 1,
				translateY: [80, 10],
				scale: [0, 1],
				duration: 1000,
				easing: 'easeInOutBack'
			},
			'-=1000'
		);
		timeline.add({
			duration: 2000
		});
		// undo animation
		children.reverse();
		timeline.add({
			targets: children,
			rotate: anime.stagger([-20, 20]),
			translateX: anime.stagger([20, 100]),
			translateY: 50,
			scale: 1,
			easing: 'easeInOutBack',
			duration: 1000
		});
		timeline.add(
			{
				targets: button,
				opacity: 0,
				scale: 0,
				translateY: 100,
				easing: 'easeInOutSine',
				duration: 1000
			},
			'-=1000'
		);
		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top">
	<ul bind:this={flows}>
		<div class="flow palette-accent">A1 Energy</div>
		<div class="flow palette-accent-secondary">K Anthropocentrism</div>
		<div class="flow palette-accent">A2 Cohesion</div>
	</ul>
	<div class="button" bind:this={button}>
		<FakeButton text="download as XLSX" icon="download" />
	</div>
</div>

<style>
	.top {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.flow {
		width: 200px;
		height: 150px;
		position: absolute;
		background: var(--this-background-indent);
		color: var(--this-text);
		border-radius: var(--border-radius);
		/* box-shadow: 0 0 20px var(--background); */
		padding: var(--padding);
		box-sizing: border-box;
	}
	ul {
		width: 100%;
		height: 100%;
		position: absolute;
		padding: 0;
		margin: 0;
	}
	.button {
		position: relative;
	}
</style>
