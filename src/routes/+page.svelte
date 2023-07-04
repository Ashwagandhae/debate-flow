<script lang="ts">
	import { onMount } from 'svelte';
	import Benefit from '$lib/components/Benefit.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import SpacingScene from '$lib/components/scenes/SpacingScene.svelte';
	import TabScene from '$lib/components/scenes/TabScene.svelte';
	import ConvertScene from '$lib/components/scenes/ConvertScene.svelte';
	import KeyboardScene from '$lib/components/scenes/KeyboardScene.svelte';
	import SettingsScene from '$lib/components/scenes/SettingsScene.svelte';
</script>

<main>
	<article>
		<section class="title">
			<h1>Debate Flow</h1>
			<a href="./app">
				<button class="tryit">
					Try it<Icon name="arrowRight" size="4rem" />
				</button>
			</a>
		</section>
		<section class="benefits">
			<Benefit
				title="Super Spacing"
				detail="Stop guessing how many responses your opponent will make - arguments will automatically move out of the way."
				component={SpacingScene}
			/>
			<Benefit
				title="Awesome Organization"
				detail="Organize and rearrange your flows with with color-coded and renamable tabs. "
				component={TabScene}
			/>
			<Benefit
				title="Simple Sharing"
				detail="Convert your flow to a excel file with the click of a button, or save it as JSON file to edit later."
				component={ConvertScene}
			/>
			<Benefit
				title="Minimal Mousing"
				detail="Use the arrow keys and keyboard shortcuts to edit your flow, and leave your mouse alone."
				component={KeyboardScene}
			/>
			<Benefit
				title="Cosmic Customization"
				detail="Change the color theme, font, accent colors, spacing, and more to personalize your flow."
				component={SettingsScene}
			/>
		</section>
		<section class="tryagain">
			<h2>Free and open-source!</h2>
			<a href="./app">
				<button class="tryit">
					Try it<Icon name="arrowRight" size="4rem" />
				</button>
			</a>
		</section>
		<section class="footer">
			<a href="https://github.com/Ashwagandhae/debate-flow" target="_blank">Source Code</a>
		</section>
	</article>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;

		height: auto;
		box-sizing: border-box;
	}
	article {
		display: flex;
		flex-direction: column;

		width: 80vw;
		height: auto;
		padding: var(--padding);
		box-sizing: border-box;
		padding: 40vh 0 50vh 0;
		gap: var(--padding);
	}

	section.title {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 3rem;
		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		background: var(--background);
		box-sizing: border-box;
	}

	h1 {
		font-size: 5rem;
		font-weight: var(--font-weight-bold);
	}
	h2 {
		font-size: 3rem;
		font-weight: var(--font-weight-bold);
	}
	a {
		display: block;
		color: inherit;
		text-decoration: none;
	}
	button.tryit {
		font-size: 3rem;
		font-weight: var(--font-weight-bold);
		padding: 2rem;

		color: inherit;
		display: flex;
		flex-direction: row;
		align-items: center;
		background-color: var(--background-accent-indent);
		border: none;
		border-radius: calc(var(--border-radius));
		transition: background-color var(--transition-speed) ease-in-out;
		gap: 1rem;
	}
	button.tryit:hover {
		background-color: var(--background-accent-active);
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
		justify-content: space-between;

		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		background: var(--background);
		box-sizing: border-box;
		padding: 3rem;
	}
	section.footer {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		width: 100%;
		height: auto;
		border-radius: var(--border-radius);
		background: var(--background);
		box-sizing: border-box;
	}
	@media(max-width: 700px) {
		h1 {
			font-size: 3rem;
		}
		h2 {
			font-size: 2rem;
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

	}
</style>
