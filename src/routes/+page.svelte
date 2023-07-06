<script lang="ts">
	import { onMount } from 'svelte';
	import Benefit from '$lib/components/Benefit.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SpacingScene from '$lib/components/scenes/SpacingScene.svelte';
	import TabScene from '$lib/components/scenes/TabScene.svelte';
	import ConvertScene from '$lib/components/scenes/ConvertScene.svelte';
	import KeyboardScene from '$lib/components/scenes/KeyboardScene.svelte';
	import SettingsScene from '$lib/components/scenes/SettingsScene.svelte';
	import Flower from '$lib/components/scenes/Flower.svelte';
	let hover = false;
</script>

<main>
	<article>
		<section class="title">
			<div class="words">
				<h1>Flower</h1>
				<p>Debate flowing app</p>
			</div>
			<a href="./app" class="flowerholder">
				<Flower {hover} />
				<button
					on:mouseenter={() => (hover = true)}
					on:mouseover={() => (hover = true)}
					on:focus={() => (hover = true)}
					on:mouseleave={() => (hover = false)}
					on:mouseout={() => (hover = false)}
					on:blur={() => (hover = false)}
					class="tryit">Try it</button
				>
			</a>
		</section>
		<div class="why">
			<Icon name="arrowDown" size="3rem" />
		</div>
		<section class="benefits">
			<Benefit
				title="Super Spacing"
				detail="Stop guessing how many responses your opponent will make - arguments will automatically move out of the way."
				component={SpacingScene}
			/>
			<Benefit
				title="Optimal Organization"
				detail="Organize and rearrange your flows quickly with with color-coded and renamable tabs. "
				component={TabScene}
			/>
			<Benefit
				title="Simple Sharing"
				detail="Convert your flow to a Excel file with the click of a button, or save it as JSON file to edit later."
				component={ConvertScene}
			/>
			<Benefit
				title="Minimal Mousing"
				detail="Use the arrow keys and keyboard shortcuts to edit your flow, and leave your mouse alone."
				component={KeyboardScene}
			/>
			<Benefit
				title="Percise Personalization"
				detail="Change the color theme, font, accent colors, spacing, and more to customize your flow."
				component={SettingsScene}
			/>
		</section>
		<a href="./app">
			<section class="tryagain">
				<button class="tryit">
					Try it<Icon name="arrowRight" size="4rem" />
				</button>
			</section>
		</a>
		<section class="footer">
			<a href="https://github.com/Ashwagandhae/debate-flow" target="_blank">Source Code on Github</a
			>
		</section>
	</article>
</main>

<style>
	:global(body) {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow-y: scroll;
	}
	main {
		display: flex;
		flex-direction: column;
		align-items: center;

		height: auto;
		box-sizing: border-box;
		position: relative;
		overflow-x: hidden;
	}
	article {
		display: flex;
		flex-direction: column;

		width: 80vw;
		height: auto;
		padding: var(--padding);
		box-sizing: border-box;
		padding: 10rem 0 0 0;
		gap: var(--padding);
	}

	section.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 3rem;
		width: 100%;
		height: 30rem;
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	div.why {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: auto;
		padding: 4rem 0;
		color: var(--text-weak);
	}

	div.words {
		z-index: 1000;
		width: 100%;
		height: auto;
		font-size: 2rem;

		/* padding: 0 3rem; */
	}

	h1 {
		font-size: 5rem;
		font-weight: var(--font-weight-bold);
	}

	a {
		display: block;
		color: inherit;
		text-decoration: none;
	}
	.flowerholder {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: auto;
	}
	button.tryit {
		font-size: 3rem;
		font-weight: var(--font-weight-bold);
		padding: 3rem;

		color: inherit;
		display: flex;
		flex-direction: row;
		align-items: center;
		border: none;
		border-radius: calc(var(--border-radius));
		background: transparent;
		gap: 1rem;
	}

	section.benefits {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: var(--padding);
		height: auto;
	}
	section.tryagain {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		box-sizing: border-box;
		background: var(--background);
		transition: background var(--transition-speed) ease-in-out;
	}
	.tryagain .tryit {
		height: 100%;
		padding: 3rem;
	}
	.tryagain:hover {
		background: var(--background-accent-active);
	}
	section.footer {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 20rem 1rem 1rem 1rem;
		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		box-sizing: border-box;
	}
	@media (max-width: 700px) {
		h1 {
			font-size: 3rem;
		}
		.words {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.tryit {
			font-size: 2rem;
		}
		article {
			width: calc(100vw - 2rem);
		}
		section.title {
			flex-direction: column;
			padding: 1rem;
			gap: 3rem;
		}

		section.tryagain {
			flex-direction: column;
			padding: 1rem;
			gap: 3rem;
		}
		.tryagain .tryit {
			padding: 1rem;
		}
	}
</style>
