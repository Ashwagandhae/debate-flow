<script lang="ts">
	import ButtonBar from '$lib/components/ButtonBar.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import NavTab from '$lib/components/NavTab.svelte';
	import { openPopup } from '$lib/models/popup';
	import NavTabList from '$lib/components/NavTabList.svelte';
	let title: string;
</script>

<main class="palette-plain">
	<div class="grid">
		<div class="sidebar">
			<div class="header">
				<ButtonBar
					buttons={[
						{
							icon: 'flower',
							link: '/',
							tooltip: 'flower homepage',
							tutorialHighlight: 1
						},
						{
							icon: 'gear',
							onclick: () => openPopup(Settings, 'Settings'),
							tooltip: 'settings',
							tutorialHighlight: 2
						}
					]}
				/>
			</div>
			<div class="tabs">
				<ul class="tabScroll">
					<NavTabList
						bind:title
						tabs={[
							{
								link: '/app/docs',
								title: 'Saved in browser'
							},
							{
								link: '/app/shared',
								title: 'Shared'
							},
							{
								link: '/app/account',
								title: 'Account'
							}
						]}
					/>
				</ul>
			</div>
		</div>
		<div class="topbar">
			<div class="title">
				<h1>{title}</h1>
			</div>
			<ButtonBar
				buttons={[
					{
						icon: 'add',
						text: 'new flow',
						tooltip: 'create blank flow',
						link: '/app/flow',
						palette: 'accent',
						tutorialHighlight: 1
					}
				]}
			/>
		</div>
		<div class="content">
			<slot />
		</div>
	</div>
</main>

<style>
	.grid {
		display: grid;
		gap: var(--gap);
		grid-template-areas:
			'sidebar topbar topbar'
			'sidebar content content';
		grid-template-columns: var(--sidebar-width) 1fr auto;
		padding: var(--main-margin);
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		/* position: relative; */
		padding: var(--main-margin);
		gap: var(--gap);
	}

	.sidebar {
		width: 100%;
		height: var(--main-height);
		grid-area: sidebar;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background: var(--background);
		border-radius: var(--border-radius);
		padding: var(--padding);
	}
	.header {
		height: auto;
		padding-bottom: var(--padding);
	}
	.topbar {
		grid-area: topbar;
		box-sizing: border-box;
		height: var(--title-height);
		display: flex;
		align-items: center;
		background: var(--background);
		border-radius: var(--border-radius);
		padding: var(--padding);
		display: flex;
		justify-content: space-between;
	}
	.tabs {
		overflow-y: auto;
		height: var(--main-height);
		box-sizing: border-box;
		position: relative;
	}
	.tabScroll {
		padding: 0;
		margin: 0;
		padding-top: 0;
		padding-bottom: calc(var(--view-height) * 0.6);
	}
	.content {
		grid-area: content;
		flex-direction: column;
		gap: var(--gap);
		height: var(--view-height);
		width: 100%;
	}
</style>
