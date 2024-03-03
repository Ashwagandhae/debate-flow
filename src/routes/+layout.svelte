<script lang="ts">
	import './global.css';
	import { settings } from '$lib/models/settings';
	import { popups, closePopup, openPopup } from '$lib/models/popup';
	import Popup from '$lib/components/Popup.svelte';
	import { screenTransition } from '$lib/models/transition';

	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import { onDestroy, onMount } from 'svelte';
	import {
		giveGuestHostKey,
		initGuestConnection,
		parseConfirmLink,
		parseJoinLink,
		type Broadcast
	} from '$lib/models/sharingConnection';
	import Share from '$lib/components/Share.svelte';
	import CloseWindow from '$lib/components/CloseWindow.svelte';
	import Message from '$lib/components/Message.svelte';

	inject({ mode: dev ? 'development' : 'production' });

	const colorThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	if (colorThemeMediaQuery.matches) {
		document.body.classList.add('dark');
	}
	settings.init();
	function updateColorTheme() {
		if (settings.data.colorTheme.value == 0) {
			document.body.classList.toggle('dark', colorThemeMediaQuery.matches);
		}
	}
	// listen for changes in system settings
	colorThemeMediaQuery.addEventListener('change', updateColorTheme);
	// listen for changes in color theme setting, and unsubscribe onDestroy
	onDestroy(
		settings.subscribe(['colorTheme'], function () {
			if (settings.data.colorTheme.value == 1) {
				document.body.classList.remove('dark');
			} else if (settings.data.colorTheme.value == 2) {
				document.body.classList.add('dark');
			} else {
				updateColorTheme();
			}
		})
	);
	// listen for changes in cssVariables setting group, and unsubscribe onDestroy
	const cssVarIndex: { [key: string]: { name: string; unit: string } } = {
		accentHue: {
			name: 'accent-hue',
			unit: ''
		},
		accentSecondaryHue: {
			name: 'accent-secondary-hue',
			unit: ''
		},
		transitionSpeed: {
			name: 'transition-speed',
			unit: 'ms'
		},
		columnWidth: {
			name: 'column-width',
			unit: 'px'
		},
		borderRadius: {
			name: 'border-radius',
			unit: 'px'
		},
		padding: {
			name: 'padding',
			unit: 'px'
		},
		fontSize: {
			name: 'font-size',
			unit: 'rem'
		},
		fontWeight: {
			name: 'font-weight',
			unit: ''
		},
		fontWeightBold: {
			name: 'font-weight-bold',
			unit: ''
		},
		gap: {
			name: 'gap',
			unit: 'px'
		},
		buttonSize: {
			name: 'button-size',
			unit: 'px'
		},
		lineWidth: {
			name: 'line-width',
			unit: 'px'
		},
		sidebarWidth: {
			name: 'sidebar-width',
			unit: 'px'
		},
		sideDocWidth: {
			name: 'side-doc-width',
			unit: 'px'
		}
	};
	onDestroy(
		settings.subscribe(['fontFamily'], function (key: string) {
			const setting = settings.data.fontFamily;
			if (setting.type != 'radio') return;
			const index = setting.value;
			let chosenFont: string | undefined = undefined;
			if (setting.detail.customOption && setting.detail.options.length == index) {
				chosenFont = setting.detail.customOptionValue;
			} else if (setting.detail.options[index]) {
				chosenFont = setting.detail.options[index];
			}
			if (chosenFont) {
				document.body.style.setProperty(
					'--font-family',
					`'${chosenFont}', 'Merriweather Sans', sans-serif`
				);
			} else {
				document.body.style.setProperty('--font-family', `'Merriweather Sans', sans-serif`);
			}
		})
	);
	onDestroy(
		settings.subscribe(Object.keys(cssVarIndex), function (key: string) {
			const name = cssVarIndex[key].name;
			const value = settings.data[key].value;
			const unit = cssVarIndex[key].unit;
			document.body.style.setProperty(`--${name}`, `${value}${unit}`);
		})
	);

	let closeWindow = false;
	onMount(function () {
		const hostKey = parseJoinLink();
		const guestKey = parseConfirmLink();

		if (hostKey != null) {
			initGuestConnection();
			giveGuestHostKey(hostKey);
			openPopup(Share, 'Share');
		} else if (guestKey != null) {
			const channel = new BroadcastChannel('guestKeySend');
			const message: Broadcast = {
				tag: 'guestKey',
				key: guestKey
			};
			channel.postMessage(message);
			let mismatch = false;
			channel.addEventListener('message', function (event) {
				const response: Broadcast = event.data;
				// close this tab, because the host has already connected
				if (response.tag == 'guestKeyRecieved') {
					if (response.broadcastId != guestKey.broadcastId) return;
					closeWindow = true;
					window.close();
				} else if (response.tag == 'guestKeyMismatch') {
					if (response.broadcastId != guestKey.broadcastId) return;
					mismatch = true;
				}
			});
			setTimeout(function () {
				if (mismatch && !closeWindow) {
					openPopup(Message, 'Connection Message', {
						props: { message: 'Connection id mismatch', error: true }
					});
				} else {
					openPopup(Message, 'Connection Message', {
						props: { message: 'No host awaiting guests', error: true }
					});
				}
			}, 1000);
		}
	});
</script>

<svelte:head>
	<title>Flower: Debate Flowing App</title>
	<meta
		name="description"
		content="App for flowing in competitive debate, better than Excel or Google Sheets. Supports Policy, Lincoln-Douglas, Public Forum, Congress, and World Schools debate."
	/>
	<link rel="canonical" href="https://debate-flow.vercel.app/" />
</svelte:head>
{#if closeWindow}
	<CloseWindow reason="confirm link information has been sent to host tab" />
{:else}
	<slot />
{/if}
{#if $popups.length > 0}
	<!-- we can ignore because pressing escape on window already has same functionality -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="screen"
		on:click|self={() => {
			closePopup(0);
		}}
		transition:screenTransition
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="popups"
			on:click|self={() => {
				closePopup(0);
			}}
		>
			{#key $popups}
				<Popup
					component={$popups[0].component}
					closeSelf={() => closePopup(0)}
					title={$popups[0].title}
					props={$popups[0].props}
				/>
			{/key}
		</div>
	</div>
{/if}

<style>
	.screen {
		background-color: var(--color-screen);
		width: 100vw;
		height: 100vh;
		position: fixed;
		display: flex;
		top: 0;
		left: 0;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}
	.popups {
		width: 100vw;
		height: min-content;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
