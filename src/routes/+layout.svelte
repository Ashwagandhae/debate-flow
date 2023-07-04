<script lang="ts">
	import './global.css';
	import { settings } from '$lib/models/settings';

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
	settings.subscribe(['colorTheme'], function () {
		if (settings.data.colorTheme.value == 1) {
			document.body.classList.remove('dark');
		} else if (settings.data.colorTheme.value == 2) {
			document.body.classList.add('dark');
		} else {
			updateColorTheme();
		}
	});
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
		gap: {
			name: 'gap',
			unit: 'px'
		}
	};
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
	});
	settings.subscribe(Object.keys(cssVarIndex), function (key: string) {
		const name = cssVarIndex[key].name;
		const value = settings.data[key].value;
		const unit = cssVarIndex[key].unit;
		document.body.style.setProperty(`--${name}`, `${value}${unit}`);
	});
</script>

<slot />
