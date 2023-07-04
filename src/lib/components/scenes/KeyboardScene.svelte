<script lang="ts">
	import { onMount } from 'svelte';
	import FakeShortcut from './FakeShortcut.svelte';
	import anime from 'animejs/lib/anime.es';

	export let timeline: anime.AnimeTimelineInstance;
	let shortcuts: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		let children = Array.from(shortcuts.children);

		
		// hide each one by one
		timeline.add({
			targets: children,
			opacity: 0,
			duration: 250,
			delay: anime.stagger(500),
			translateY: [0, -20],
			rotate: [0, 10],
			easing: 'easeInOutSine'
		});
		timeline.add({
			duration: 1000
		});
    // show each shortcut one by one
		timeline.add({
			targets: children,
			opacity: [0, 1],
			duration: 250,
			delay: anime.stagger(500),
			translateY: [20, 0],
			rotate: [-15, 0],
			scale: [0.8, 1],
			easing: 'easeInOutSine'
		});
		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top">
	<ul bind:this={shortcuts}>
		<FakeShortcut keys={['shift', 'return']} />
		<FakeShortcut keys={['commandControl', 'z']} />
		<FakeShortcut keys={['commandControl', 'shift', 'n']} />
	</ul>
</div>

<style>
	.top {
		width: 100%;
		height: 100%;
		position: relative;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	ul {
		list-style: none;
		padding: 0;
		gap: var(--padding);
		display: flex;
		justify-content: center;
		flex-direction: column;
		margin: 0;
	}
</style>
