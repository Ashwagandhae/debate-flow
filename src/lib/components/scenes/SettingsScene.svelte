<script lang="ts">
	import { onMount } from 'svelte';
	import anime from 'animejs/lib/anime.es';
	import FakeSlider from './FakeSlider.svelte';

	export let timeline: anime.AnimeTimelineInstance;
	let switchEl: HTMLElement;
	let switchEl2: HTMLElement;
	let switchEl3: HTMLElement;
	let hack: HTMLElement;

	onMount(() => {
		timeline = anime.timeline({
			loop: true,
			autoplay: false
		});
		let dist = hack.clientHeight;
		let els = [switchEl, switchEl2, switchEl3];
		timeline.add({
			targets: els,
			translateX: [0, dist],
			duration: 1000,
			easing: 'easeInOutSine',
			delay: anime.stagger(500)
		});
		timeline.add({
			duration: 2000
		});
		timeline.add({
			targets: els,
			translateX: [dist, 0],
			duration: 1000,
			easing: 'easeInOutSine',
			delay: anime.stagger(500)
		});
		timeline.add({
			duration: 2000
		});
	});
</script>

<div class="top">
	<div class="hack" bind:this={hack} />
	<ul>
		<div class="setting">
			<h1>Font size</h1>
			<div class="palette-accent">
				<div class="label">
					<div bind:this={switchEl} class="switch" />
				</div>
			</div>
		</div>
		<div class="setting">
			<h1>Column width</h1>
			<div class="palette-accent">
				<div class="label">
					<div bind:this={switchEl2} class="switch" />
				</div>
			</div>
		</div>
		<div class="setting">
			<h1>Transition duration</h1>
			<div class="palette-accent-secondary">
				<div class="label">
					<div bind:this={switchEl3} class="switch" />
				</div>
			</div>
		</div>
	</ul>
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

	div.label {
		width: 200px;
		position: relative;
		box-sizing: content-box;
		display: block;
		padding: var(--padding-small) 0;
		height: var(--button-size);
		background-color: var(--this-background-indent);
		border-radius: var(--border-radius);
		transition: background var(--transition-speed), background-image var(--transition-speed);
		margin: calc(var(--padding-small)) 0;
	}

	.switch {
		position: absolute;

		box-sizing: content-box;
		padding: calc(var(--padding-small) - var(--padding-small));
		width: var(--button-size);
		height: var(--button-size);
		left: var(--padding-small);
		top: var(--padding-small);

		border: none;
		background-color: var(--this-color);
		color: var(--this-text);
		border-radius: var(--border-radius);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	div.hack {
		position: fixed;
		pointer-events: none;
		height: calc(200px - var(--button-size) - var(--padding));
	}
</style>
