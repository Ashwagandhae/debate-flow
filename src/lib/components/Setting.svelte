<script lang="ts">
	import Toggle from './Toggle.svelte';
	import Radio from './Radio.svelte';
	import Slider from './Slider.svelte';
	import Button from './Button.svelte';
	import { settings, type Setting } from '$lib/models/settings';
	import { tweened } from 'svelte/motion';
	import { onDestroy } from 'svelte';
	import { settingIn, settingOut } from '$lib/models/transition';
	import ColorSelector from './ColorSelector.svelte';
	export let setting: Setting;
	export let key: string;

	let value: any = setting.value;

	function setValue(value: any) {
		settings.setValue(key, value);
		value = setting.value;
	}
	$: value, setValue(value);

	function resetValue() {
		settings.setValue(key, setting.auto);
		value = setting.value;
	}

	onDestroy(
		settings.subscribe([key], function (key) {
			if (setting.value != value) {
				value = setting.value;
			}
		})
	);

	let spotlight = tweened(0);
	let element: HTMLElement;
	export function scrollToSelf() {
		element.scrollIntoView();
		spotlight = tweened(1, {
			duration: 2000
		});
		$spotlight = 0;
	}
</script>

<div class="top" bind:this={element} in:settingIn={{skip: false}} out:settingOut={{skip: false}}>
	<div class="spotlight" style={`--spotlight:${$spotlight}`}>
	</div>
	<span class="above">
		<div class="titleReset">
			<h2>{setting.name}</h2>
			<div class="reset" class:hidden={value == setting.auto}>
				<Button
					icon="arrowRoundLeft"
					tooltip="reset to default"
					tooltipLayout="right"
					on:click={resetValue}
				/>
			</div>
		</div>

		{#if setting.type == 'toggle'}
			<Toggle bind:value auto={setting.auto} />
		{/if}
		{#if setting.type == 'color'}
			<ColorSelector bind:value />
		{/if}
		{#if setting.info && setting.type != 'toggle' && setting.type != 'color'}
			<p class="info">{setting.info}</p>
		{/if}
	</span>
	{#if setting.type == 'radio'}
		<Radio
			name={setting.name}
			bind:value
			auto={setting.auto}
			detail={setting.detail}
			on:forceUpdate={() => setValue(value)}
		/>
	{/if}
	{#if setting.type == 'slider'}
		<Slider bind:value auto={setting.auto} detail={setting.detail} />
	{/if}
	{#if setting.info && (setting.type == 'toggle' || setting.type == 'color')}
		<p class="info">{setting.info}</p>
	{/if}
</div>

<style>
	.top {
		position: relative;
		border-radius: var(--border-radius);
		padding: var(--padding);
		max-width: 30rem;
		min-width: 10rem;
		width: 100%;
		box-sizing: border-box;
	}
	.spotlight {
		background-color: var(--this-background-indent);
		opacity: var(--spotlight);
		border-radius: var(--border-radius);
		position: absolute;
		height: 100%;
		width: 100%;
		top: calc(-1 * var(--padding)/2);
		left: calc(-1 * var(--padding)/2);
	}
	.above {
		position: relative;
		display: flex;
		flex-direction: row;
		gap: 1em;
		align-items: center;
		padding-bottom: var(--padding);
		height: auto;
	}
	.above h2 {
		width: max-content;
		white-space: nowrap;
	}
	.above .titleReset {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1em;
	}
	p.info {
		color: var(--this-text-weak);
		opacity: 0;
		transition: opacity var(--transition-speed);
		margin: 0;
	}
	.top:hover p.info {
		opacity: 1;
	}
	.hidden {
		color: var(--this-text-weak);
	}
	.reset {
		opacity: 1;

		transition: opacity var(--transition-speed);
	}
	.reset.hidden {
		opacity: 0;
	}
	@media (max-width: 800px) {
		.above {
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
		}
	}
</style>
