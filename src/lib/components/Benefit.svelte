<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let title: string;
	export let detail: string;
	export let component: ConstructorOfATypedSvelteComponent;
	let timeline: anime.AnimeTimelineInstance;

	let observer: IntersectionObserver;
	let element: HTMLElement;
	let show = false;

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						show = true;
						setTimeout(() => {
							timeline.play();
						}, 1000);
					}
				});
			},
			{
				rootMargin: '0px',
				threshold: 0.5
			}
		);
		observer.observe(element);
	});
</script>

<div class="top" bind:this={element} class:show>
	<div class="visual">
		<svelte:component this={component} bind:timeline />
	</div>
	<div class="text">
		<h2>{title}</h2>
		<p>{detail}</p>
	</div>
</div>

<style>
	.top {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--padding);
		height: var(--height);
		--height: 320px;
		opacity: 0;
		transform: translateY(50px);
		transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
	}
	.top.show {
		opacity: 1;
		transform: translateY(0);
	}
	.top:nth-child(odd) {
		flex-direction: row-reverse;
	}
	.top > div {
		border-radius: var(--radius);
		background: var(--background);
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	.visual {
		flex-basis: var(--height);
		height: var(--height);
		flex-grow: 0;
		flex-shrink: 0;
		box-sizing: border-box;
		transition: box-shadow var(--transition-speed) ease-in-out;
	}

	.text {
		padding: 3rem;
		height: 100%;
		width: max-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2rem;
	}
	h2 {
		margin: 0;
		font-size: 2.5rem;
		font-weight: var(--font-weight-bold);
	}
	p {
		margin: 0;
		font-size: 1.25rem;
		line-height: 2;
	}
</style>
