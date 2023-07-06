<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let title: string;
	export let detail: string;
	export let component: ConstructorOfATypedSvelteComponent;
	let timeline: anime.AnimeTimelineInstance;

	let element: HTMLElement;
	let show = false;
	let observer: IntersectionObserver;

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
	<div class="visualWrapper">
		<div class="visual">
			<svelte:component this={component} bind:timeline />
		</div>
	</div>
	<div class="text">
		<h2>{title}</h2>
		<p>{detail}</p>
	</div>
</div>

<style>
	.top {
		display: grid;
		grid-template-columns: var(--height) 1fr;
		gap: var(--padding);
		min-height: var(--height);
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
		grid-template-columns: 1fr var(--height);
	}
	.top:nth-child(odd) > .visualWrapper {
		order: 2;
	}
	.top > div {
		border-radius: var(--radius);
		background: var(--background);
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	.visualWrapper {
		flex-basis: var(--height);
		width: var(--height);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.visual {
		height: var(--height);
		width: var(--height);
		box-sizing: border-box;
		transition: box-shadow var(--transition-speed) ease-in-out;
	}

	.text {
		padding: 3rem;
		height: 100%;
		width: 100%;
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
	@media (max-width: 800px) {
		h2 {
			font-size: 1.5rem;
		}
		p {
			font-size: 1rem;
		}
		.top,
		.top:nth-child(odd) {
			grid-template-columns: 100%;
			grid-template-rows: var(--height) 1fr;

			height: auto;
			width: 100%;
		}

		.visualWrapper,
		.top:nth-child(odd) > .visualWrapper {
			width: 100%;
			order: 0;
		}
	}
</style>
