<script lang="ts">
	import { openPopup } from '$lib/models/popup';
	import { isChangelogVersionCurrent } from '$lib/models/version';
	import Button from './Button.svelte';
	import Changelog from './Changelog.svelte';

	export let closePopup: () => void;

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="top">
	<section class="palette-plain">
		<div class="above">
			<h2>Links</h2>
			<p>useful resources</p>
		</div>
		<ul>
			<Button icon="home" text="home page" link="/" on:click={closePopup} />
			<Button
				icon="angleBrackets"
				text="code"
				link="https://github.com/Ashwagandhae/debate-flow"
				target="_blank"
			/>
			<Button
				icon="delta"
				text="changelog"
				on:click={() => {
					closePopup();
					openPopup(Changelog, 'Changelog');
				}}
				target="_blank"
				tooltip={$isChangelogVersionCurrent ? undefined : 'see new updates'}
				notification={!$isChangelogVersionCurrent}
			/>
		</ul>
	</section>
	<section class="palette-plain-secondary secondary">
		<div class="above">
			<h2>Contact</h2>
			<p>send feedback</p>
		</div>
		<ul>
			<Button icon="copy" text="email" on:click={() => copyText('julianlianbauer@gmail.com')} />
			<Button icon="copy" text="discord" on:click={() => copyText('ashwagandhae')} />
			<Button icon="link" text="github" link="https://github.com/Ashwagandhae/" target="_blank" />
			<Button
				icon="link"
				text="reddit"
				link="https://www.reddit.com/user/ash-wag-and"
				target="_blank"
			/>
		</ul>
	</section>
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 500px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 1fr 1fr;
		overflow: auto;
	}
	section {
		width: 100%;
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		color: var(--this-text);
	}
	.secondary {
		background: var(--background-secondary);
	}
	ul {
		margin: 0;
		padding: 0;
		color: var(--color-subtle);
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}
	.above {
		position: relative;
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		align-items: center;
		justify-content: space-between;
	}
	.above > p {
		margin: 0;
		color: var(--this-text-weak);
		transition: opacity var(--transition-speed);
	}
</style>
