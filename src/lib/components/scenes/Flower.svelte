<script lang="ts">
	import { onMount } from 'svelte';
	import anime from 'animejs/lib/anime.es';

	let timeline: anime.AnimeTimelineInstance;

	let petalsEl: HTMLElement;
	let bud: HTMLElement;

	onMount(() => {
		// let height = addedResponse.clientHeight;
		timeline = anime.timeline({
			loop: true
		});
		let petals = Array.from(petalsEl.children);
		petals.reverse();
		timeline.add({
			targets: petals,
			easing: 'easeOutBack',
			delay: anime.stagger(100),
			scale: [0, 1],
			duration: 1000
		});
		timeline.add(
			{
				targets: bud,
				easing: 'easeOutBack',
				scale: [0, 1],
				duration: 1000
			},
			'-=1000'
		);
		timeline.add({ duration: 8000 });
		// undo animation
		timeline.add({
			targets: bud,
			easing: 'easeInSine',
			scale: [1, 0],
			duration: 1000
		});
		petals.reverse();
		timeline.add(
			{
				targets: petals,
				easing: 'easeInSine',
				delay: anime.stagger(100),
				scale: [1, 0],
				duration: 1000
			},
			'-=1000'
		);
		timeline.add({ duration: 1000 });
	});
	export let hover = false;

	$: if (timeline) {
		if (hover) {
		} else {
		}
	}
</script>

<div class="top" class:hover role="img">
	<div class="petals" bind:this={petalsEl}>
		<div class="petal" style="transform: rotate(0deg)" />
		<div class="petal" style="transform: rotate(72deg)" />
		<div class="petal" style="transform: rotate(144deg)" />
		<div class="petal" style="transform: rotate(216deg)" />
		<div class="petal" style="transform: rotate(288deg)" />
	</div>
	<div class="bud" bind:this={bud} />
</div>

<style>
	.top {
		width: 0;
		height: 0;
		transform-origin: 0 0;
		position: absolute;
		z-index: -1;
		animation: rotate 40s linear infinite;
		scale: 1;
		transition: scale var(--transition-speed) ease-in-out;
		pointer-events: none;
	}
	@keyframes rotate {
		from {
			rotate: 0deg;
		}
		to {
			rotate: 360deg;
		}
	}
	.top.hover {
		scale: 1.1;
	}

	.petal {
		width: 8rem;
		height: 17rem;
		border-radius: 1rem;
		/* box-shadow: 0 0 10px var(--text) inset; */
		transform-origin: 0% 0%;
		position: absolute;
		top: 0;
		left: 0;
		background-color: var(--background-accent-active);
		transition: background-color var(--transition-speed) ease-in-out;
	}

	.petals {
		position: absolute;
	}
	.bud {
		--size: 18rem;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		position: absolute;
		top: calc(-0.5 * var(--size));
		left: calc(-0.5 * var(--size));
		background-color: var(--background-accent-secondary-active);
		transition: background-color var(--transition-speed) ease-in-out;
		border: var(--gap) solid var(--background-back);
		box-sizing: border-box;
	}
</style>
