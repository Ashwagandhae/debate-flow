<script lang="ts">
	import { openPopup } from '$lib/models/popup';
	import { setLastChangelogVersion } from '$lib/models/version';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import Help from './Help.svelte';
	import Share from './Share.svelte';
	import Shortcut from './Shortcut.svelte';

	export let closePopup: () => void;

	onMount(() => setLastChangelogVersion());
</script>

<div class="top palette-plain">
	<div class="scroll">
		<section>
			<div class="above">
				<h2>v1.1.6</h2>
			</div>
			<ul>
				<li>
					added quick extensions. Click <Button icon="arrowRightThroughCircle" inline /> or press <Shortcut
						keys={['commandControl', 'E']}
						inline
					/> while highlighting a cell to extend that cell to the next speech. Thanks to
					<a href="https://github.com/JadenTepper">JadenTepper</a> for implementing!
				</li>
			</ul>
		</section>
		<section>
			<div class="above">
				<h2>v1.1.5</h2>
			</div>
			<ul>
				<li>
					added cell folding. click <Button icon="foldArrows" inline /> or press <Shortcut
						keys={['control', 'L']}
						inline
					/> to fold and unfold cells. Folding a cell hides any responses so you can minimize unimportant
					parts of the debate.
				</li>
				<li>
					added setting that makes pressing enter always create a new a cell instead of sometimes
					moving focus.
				</li>
				<li>fixed bug where notes doc would clear on tab switch.</li>
			</ul>
		</section>
		<section>
			<div class="above">
				<h2>v1.1.4</h2>
			</div>
			<ul>
				<li>made settings headers clickable.</li>
			</ul>
		</section>
		<section>
			<div class="above">
				<h2>v1.1.3</h2>
			</div>
			<ul>
				<li>added classic debate format.</li>
			</ul>
		</section>
		<section>
			<div class="above">
				<h2>v1.1.2</h2>
			</div>
			<ul>
				<li>
					added text bolding. click <Button icon="letterB" inline /> or press <Shortcut
						keys={['commandControl', 'b']}
						inline
					/> to toggle bold.
				</li>
				<li>the formatting of selected cells now shows in the toolbar.</li>
			</ul>
		</section>
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
