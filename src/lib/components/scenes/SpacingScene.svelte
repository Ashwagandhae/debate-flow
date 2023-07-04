<script lang="ts">
	import { onMount } from 'svelte';
	import FakeBox from './FakeBox.svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;
	let addedResponse: HTMLElement;
	let otherRows: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		let height = addedResponse.clientHeight;
		timeline.add({
			targets: addedResponse,
			scale: [0, 1],
			easing: 'easeInOutSine',
			duration: 500
		});
		let children = Array.from(otherRows.children);
		children.reverse();
		timeline.add({
			targets: children,
			translateY: [-height, 0],
			easing: 'easeInOutSine',
			duration: 500,
			delay: anime.stagger(100)
		});
		timeline.add({
			duration: 2000
		});
		timeline.add({
			targets: addedResponse,
			scale: [1, 0],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add(
			{
				targets: children,
				translateY: [0, -height],
				easing: 'easeInOutSine',
				duration: 500
			},
			'-=500'
		);
		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top">
	<ul class="palette-accent">
		<div class="row1 palette-accent">
			<FakeBox text="Arguement 1" />
			<div class="palette-accent-secondary">
				<FakeBox text="Response 1" below />
				<div class="addedResponse" bind:this={addedResponse}>
					<FakeBox text="Response 2" below />
				</div>
			</div>
		</div>
		<div bind:this={otherRows} class="otherRows">
			<FakeBox text="Arguement 2" />
			<FakeBox text="Arguement 3" />
			<FakeBox text="Arguement 4" below />
		</div>
	</ul>
</div>

<style>
	.top {
		width: 100%;
		height: 100%;
		position: relative;
		--column-width: 150px;
	}
	ul {
		position: absolute;
		top: 5rem;
		left: var(--padding);
		padding: 0;
		margin: 0;
		list-style-type: none;
	}
	.row1 {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		width: calc(var(--column-width) * 2);
	}
</style>
