<script lang="ts">
	import Button from './Button.svelte';
	import { restartSyncInterval, minimizeApp } from '$lib/models/sharing';
	import { isSharing } from '$lib/models/store';
	import injectCode from '$lib/../../scripts/inject.min.js?raw';

	$: copyCode = browser == 'arc' ? injectCode : 'javascript:' + injectCode;

	type BrowserLabel = 'arc' | 'chrome' | 'edge' | 'firefox' | 'safari';
	let browser: BrowserLabel = 'chrome';
	let browsers: BrowserLabel[] = ['arc', 'chrome', 'edge', 'firefox', 'safari'];

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="top palette-plain" class:isSharing={$isSharing}>
	{#if $isSharing}
		<div class="shareControls">
			<h1>Sharing successful!</h1>
			<p>
				Sharing is new and probably has bugs. <a href="https://github.com/Ashwagandhae/debate-flow"
					>Let me know!</a
				>
			</p>
			<div class="controls">
				<Button
					icon="arrowRoundLeft"
					text="sync with sheet"
					tooltip="auto syncs every 5 seconds"
					on:click={restartSyncInterval}
				/>
				<Button
					icon="eye"
					text="show sheet"
					tooltip="show hidden google sheet"
					on:click={minimizeApp}
				/>
			</div>
		</div>
	{:else}
		<div class="explainContentScroll">
			<h1>Sharing explained</h1>
			<p>
				Flower uses Google Sheets as a "backend" for sharing flow data. You can collaborate on your
				flows in 5 steps:
			</p>
			<div class="browserSelector">
				{#each browsers as currBrowser}
					<button
						class:selected={browser == currBrowser}
						on:click={() => {
							browser = currBrowser;
						}}>{currBrowser}</button
					>
				{/each}
			</div>
			<div class="instruction">
				<div class="above">
					<h2>1. Copy this code</h2>
					<Button
						icon="copy"
						text="copy"
						palette="plain-secondary"
						on:click={() => {
							copyText(copyCode);
						}}
					/>
				</div>
				<div class="codeScroll">
					<code>{copyCode}</code>
				</div>
				<p>
					Security note: Flower does not store any of your data. This code allows Flower to <code
						><b>read</b></code
					>
					and <code><b>write</b></code> cells and access the <code><b>url</b></code> of the Google
					Sheet; it loses access when you {#if browser == 'arc'}disable the boost{:else}reload the
						page{/if}. It can't access the document's title, your email, other sheets tabs, etc. See
					the unminified version
					<a
						href="https://raw.githubusercontent.com/Ashwagandhae/debate-flow/main/scripts/inject.js"
						>here</a
					>.
				</p>
			</div>
			<div class="instruction">
				<h2>
					2. Create a new {#if browser == 'arc'}boost{:else}bookmarklet{/if}
				</h2>
				<p>
					{#if browser == 'arc'}
						Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer"
							>sheets.google.com</a
						>, open the control panel in the URL bar, and click the paintbrush titled
						<code>New Boost</code>. Click <code>Code</code>, select <code>Javascript</code>, and
						paste the code into the box. Disable the boost for now by reopening the control panel
						and clicking on the boost.
					{:else if browser == 'chrome' || browser == 'edge'}
						Right click on your bookmarks bar, click <code>Add page</code> and paste the code into
						the URL. You can name it whatever you want. If you don't see a bookmarks bar, click the
						dots in the top right corner of your browser, go to <code>Bookmarks</code> and click
						<code>Show Bookmarks Bar</code>.
					{:else if browser == 'firefox'}
						Right click on your bookmarks bar, click <code>Add Bookmark</code> and paste the code
						into the URL. You can name it whatever you want. If you don't see a bookmarks bar, click
						the dots in the top right corner of your browser, go to <code>Bookmarks</code>
						and click
						<code>Show bookmarks toolbar</code>.
					{:else if browser == 'safari'}
						Open a new tab, paste the code into the URL bar, and press enter. Click on the three
						dots on the right side of the URL bar, click <code>Bookmark</code> and add it to your
						<code>Favorites</code>.
					{/if}
				</p>
			</div>
			<div class="instruction">
				<h2>3. Create a new Google Sheet</h2>
				<p>
					{#if browser == 'arc'}
						Create a blank sheet by clicking <code>Blank</code> in the top left.
					{:else}
						Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer"
							>sheets.google.com</a
						>
						and create a blank sheet by clicking <code>Blank</code> in the top left.
					{/if}
				</p>
			</div>
			<div class="instruction">
				<h2>4. Share it with collaboraters</h2>
				<p>
					Share the google sheet like you normally would, by clicking <code>Share</code>, entering
					email addresses, and sending. Make sure your teammates also installed the
					{#if browser == 'arc'}boost{:else}bookmarklet{/if}.
				</p>
			</div>
			<div class="instruction">
				<h2>
					5. Activate your {#if browser == 'arc'}boost{:else}bookmarklet{/if}
				</h2>
				<p>
					{#if browser == 'arc'}
						Open the control panel, and click on the boost.
					{:else if browser == 'chrome' || browser == 'edge'}
						Click on the bookmark you just made. If you have many bookmarks it might be hidden;
						reveal it by clicking the right-facing arrows on the right side of your bookmarks bar.
					{:else if browser == 'firefox'}
						Click on the bookmark you just made. If you have many bookmarks it might be hidden;
						reveal it by clicking the right-facing arrows on the right side of your bookmarks bar.
					{:else if browser == 'safari'}
						Select "Bookmarks" in the menu bar in the top left, open the <code>Favorites</code>
						folder, and click on the bookmark you just made. Flower should say
						<code>Sharing Successful</code> if everything went right! If you want to
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.top {
		width: min(calc(100vw - var(--padding) * 2), 800px);
		height: min(calc(100vh - var(--padding) * 2), 700px);
		padding: calc(var(--button-size) + var(--padding) * 2) 0 0 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--padding);
	}
	.top.isSharing {
		width: min(calc(100vw - var(--padding) * 2), min-content);
		height: min(calc(100vh - var(--padding) * 2), min-content);
		padding: calc(var(--button-size) + var(--padding) * 2) var(--padding-big) var(--padding-big)
			var(--padding-big);
		align-items: flex-start;
	}
	.explainContentScroll {
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--padding-big);
		padding: 0 var(--padding-big);
	}

	.shareControls {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		justify-content: center;
	}
	.controls {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
		justify-content: center;
	}
	div.codeScroll {
		padding: var(--padding);
		border-radius: var(--border-radius);
		height: 6rem;
		overflow: auto;
		background: var(--background-indent);
		position: relative;
	}
	.above {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
	.codeScroll code {
		font-size: 0.6rem;
		/* break all words */
		word-break: break-all;
	}

	code {
		font-size: inherit;
		white-space: pre-wrap;
		background: var(--background-indent);
		padding: var(--padding-small);
		font-family: var(--font-family);
		border-radius: var(--border-radius);
	}

	h1 {
		padding: var(--padding-big) 0 var(--padding) 0;
	}
	h2 {
		padding: var(--padding-big) 0 var(--padding) 0;
	}
	p {
		margin: var(--padding) 0;
		line-height: 2;
	}

	button {
		width: 100%;
		border: none;
		background: none;
		padding: var(--padding);
		border-radius: var(--border-radius);
		text-align: left;
		transition: background var(--transition-speed);
		color: var(--text);
		text-align: center;
	}
	button:hover {
		background-color: var(--background-indent);
	}
	button:active,
	button.selected {
		background-color: var(--background-active);
	}

	.browserSelector {
		display: flex;
		flex-direction: row;
		gap: var(--padding);
	}
</style>
