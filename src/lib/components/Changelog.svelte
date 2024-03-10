<script lang="ts">
	import { openPopup } from '$lib/models/popup';
	import { setLastChangelogVersion } from '$lib/models/version';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import Help from './Help.svelte';
	import Share from './Share.svelte';

	export let closePopup: () => void;

	onMount(() => setLastChangelogVersion());
</script>

<div class="top palette-plain">
	<div class="scroll">
		<section>
			<div class="above">
				<h2>v1.1.1</h2>
			</div>
			<ul>
				<li>when sharing, disallowed editing before initial sync.</li>
				<li>made uploading files and opening saved flows work through sharing.</li>
			</ul>
		</section>
		<section>
			<div class="above">
				<h2>v1.1.0</h2>
			</div>
			<ul>
				<li>
					added WebRTC-based sharing, click on <Button
						icon="people"
						on:click={() => {
							closePopup();
							openPopup(Share, 'Share');
						}}
						inline
					/> to try it out! You can now collaborate on your flows live with as many people as you want.
				</li>
				<li>
					removed sheet sharing. You can still access sheet sharing in the <a
						href="https://debate-flow-git-sheet-sharing-ashwagandhae.vercel.app/app/"
						>legacy version</a
					>, but please <Button
						text="let me know"
						icon="link"
						on:click={() => {
							closePopup();
							openPopup(Help, 'Help');
						}}
						inline
					/> why WebRTC sharing doesn't working for you.
				</li>
			</ul>
		</section>
	</div>
</div>

<style>
	.top {
		padding-top: calc(var(--button-size) + var(--padding) * 2);
		width: min(calc(100vw - var(--padding) * 2), 500px);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		box-sizing: border-box;
		display: grid;
		grid-template-columns: 1fr;
		overflow: auto;
		background: var(--background);
	}

	.scroll {
		width: 100%;
		height: 20rem;
		overflow: auto;
	}
	section {
		width: 100%;
		padding: var(--padding-big);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		color: var(--text);
		background: var(--background);
	}

	ul {
		line-height: 1.6em;
		margin: 0;
		padding-left: var(--padding-big);
		color: var(--color-subtle);
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
</style>
