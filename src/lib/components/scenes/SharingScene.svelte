<script lang="ts">
	import { onMount } from 'svelte';
	import FakeBox from './FakeBox.svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;

	export let hostAdd: HTMLElement;
	export let guestAdd: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		timeline.add({
			targets: hostAdd,
			scale: [0, 1],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add(
			{
				targets: guestAdd,
				scale: [0, 1],
				easing: 'easeInOutSine',
				duration: 500
			},
			'+=250'
		);
		timeline.add({
			duration: 2000
		});
		timeline.add({
			targets: guestAdd,
			scale: [1, 0],
			easing: 'easeInOutSine',
			duration: 500
		});
		timeline.add(
			{
				targets: hostAdd,
				scale: [1, 0],
				easing: 'easeInOutSine',
				duration: 500
			},
			'+=250'
		);

		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top">
	<!-- TODO finish this scene -->
	<div class="window first palette-accent">
		<div class="title">host</div>
		<FakeBox text="Argument 1" />
		<FakeBox text="Argument 2" below />
		<div class="hostAdd" bind:this={hostAdd}>
			<FakeBox text="Argument 3" below />
		</div>
	</div>
	<div class="window second palette-accent-secondary">
		<div class="title">guest</div>
		<FakeBox text="Argument 1" />
		<FakeBox text="Argument 2" below />
		<div class="guestAdd" bind:this={guestAdd}>
			<FakeBox text="Argument 3" below />
		</div>
	</div>
</div>

<style>
	.top {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.title {
		padding: 0 var(--padding);
		padding-bottom: var(--padding);
		color: var(--this-text-weak);
	}
	.hostAdd,
	.guestAdd {
		width: min-content;
		transform-origin: 50% 0%;
	}
	.window {
		box-sizing: border-box;
		width: calc(var(--column-width));
		height: 160px;
		position: absolute;
		background: var(--background-secondary);
		color: var(--this-text);
		border-radius: var(--border-radius);
		padding: var(--padding) 0;
		box-sizing: border-box;
		z-index: 999;
	}
	.first {
		top: 30px;
		left: 10px;
		transform: rotate(-5deg);
	}
	.second {
		bottom: 30px;
		right: 10px;
		transform: rotate(5deg);
	}
</style>
