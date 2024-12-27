export const SETTINGS_VERSION = 1;

type SettingBasic<T> = {
	name: string;
	value: T;
	auto: T;
	type: string;
	info?: string;
	visibilityCondition?: () => boolean;
};
type ToggleSetting = SettingBasic<boolean> & {
	type: 'toggle';
};
type RadioSetting = SettingBasic<number> & {
	type: 'radio';
	detail: {
		options: string[];
		customOption?: boolean;
		customOptionValue?: string;
	};
};
type SliderSetting = SettingBasic<number> & {
	type: 'slider';
	detail: {
		min: number;
		max: number;
		step: number;
		hue?: boolean;
	};
};
export type Hexcode = `#${string}`;
type ColorSetting = SettingBasic<Hexcode> & {
	type: 'color';
}
export type SaveableSettings = {
	settings: { [key: string]: number | boolean | string | Hexcode },
	isSettings: boolean,
	version: number
}
export type Setting = ToggleSetting | RadioSetting | SliderSetting | ColorSetting;
class Settings {
	data: { [key: string]: Setting };
	callbacks: { [key: string]: ((key: string) => void)[] } = { any: [] };
	constructor(settings: { [key: string]: Setting }) {
		this.data = settings;
	}
	init() {
		this.loadFromLocalStorage();
	}
	setValue(key: string, value: boolean | number | Hexcode): void {
		this.data[key].value = value;
		if (this.callbacks[key]) {
			for (const callback of this.callbacks[key]) {
				callback(key);
			}
		}
		for (const callback of this.callbacks['any']) {
			callback(key);
		}
	}
	subscribe(keys: string[], callback: (key: string) => void): () => void {
		for (const key of keys) {
			if (!this.callbacks[key]) {
				this.callbacks[key] = [];
			}
			this.callbacks[key].push(callback);
			callback(key);
		}
		return () => {
			for (const key of keys) {
				this.callbacks[key] = this.callbacks[key].filter((el) => el != callback);
			}
		};
	}
	convertSettingsToJson(includeDefaults?: boolean): string {
		const jsonSettingsData: { [key: string]: number | boolean | string | Hexcode } = {};
		for (const key of Object.keys(this.data)) {
			if (this.data[key].value != this.data[key].auto || includeDefaults) {
				jsonSettingsData[key] = this.data[key].value;
				if (this.data[key].type == 'radio') {
					const setting = this.data[key] as RadioSetting;
					if (setting.detail.customOptionValue) {
						jsonSettingsData[key + 'Custom'] = setting.detail.customOptionValue;
					}
				}
			}
		}

		let jsonData: SaveableSettings = {
			settings: jsonSettingsData,
			isSettings: true,
			version: SETTINGS_VERSION
		};

		return JSON.stringify(jsonData);
	}
	parseJsonToSettings(jsonData: {[key: string]: any}) {
		if (!jsonData["isSettings"]) {
			return;
		}

		const settingsData = jsonData as SaveableSettings;

		try {
			for (const key in settingsData.settings) {
				if (this.data[key] == null) {
					continue;
				};
				if (this.data[key].type == 'radio') {
					const setting = this.data[key] as RadioSetting;
					if (settingsData["settings"][key + 'Custom']) {
						setting.detail.customOptionValue = settingsData["settings"][key + 'Custom'] as string;
					}
				}
				this.setValue(key, settingsData["settings"][key] as number | boolean | Hexcode);
			}
		} catch (e) {
			localStorage.setItem('settings', JSON.stringify({}));
			this.resetToAuto();
			return;
		}
	}
	saveToLocalStorage() {
		const jsonData = this.convertSettingsToJson();
		localStorage.setItem('settings', jsonData);
	}
	loadFromLocalStorage() {
		const settingsData = localStorage.getItem('settings');
		if (settingsData) {
			const settingsObj = JSON.parse(settingsData);
			this.parseJsonToSettings(settingsObj);
		}
	}
	resetToAuto() {
		for (const key in this.data) {
			this.setValue(key, this.data[key].auto);
		}
	}
	randomize() {
		for (const key in this.data) {
			const setting = this.data[key];
			if (setting.type == 'slider') {
				this.setValue(
					key,
					setting.detail.min + Math.random() * (setting.detail.max - setting.detail.min)
				);
			} else if (setting.type == 'radio') {
				this.setValue(key, Math.floor(Math.random() * setting.detail.options.length));
			} else if (setting.type == 'toggle') {
				this.setValue(key, Math.random() < 0.5);
			} else if (setting.type == 'color') {
				const r = Math.floor(Math.random() * 256).toString(16);
				const g = Math.floor(Math.random() * 256).toString(16);
				const b = Math.floor(Math.random() * 256).toString(16);
				this.setValue(key, ("#" + r + g + b) as Hexcode);
			}
		}
	}
}
export const settings: Settings = new Settings({
	debateStyle: {
		name: 'Debate style',
		type: 'radio',
		value: 0,
		auto: 0,
		detail: {
			options: [
				'Policy',
				'Public Forum',
				'Lincoln Douglas',
				'Congress',
				'World Schools',
				'Big Questions',
				'NOF SPAR',
				'Parli',
				'Classic'
			]
		},
		info: "Already created flows won't be affected by this setting"
	},
	LDSubstyle: {
		name: 'Debate substyle',
		value: 0,
		auto: 0,
		type: 'radio',
		detail: {
			options: ['Classical', 'TOC Circuit']
		},
		visibilityCondition: () => {
			return settings.data.debateStyle.value == 2;
		}
	},
	colorTheme: {
		name: 'Color theme',
		type: 'radio',
		value: 0,
		auto: 0,
		detail: {
			options: ['System default', 'Light theme', 'Dark theme', 'Custom theme']
		}
	},
	customBackgroundBack: {
		name: 'Back background',
		type: 'color',
		value: "#01020e",
		auto: "#01020e",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackground: {
		name: 'Background',
		type: 'color',
		value: "#010318",
		auto: "#010318",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundIndent: {
		name: 'Highlighted background',
		type: 'color',
		value: "#020531",
		auto: "#020531",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundActive: {
		name: 'Clicked background',
		type: 'color',
		value: "#050848",
		auto: "#050848",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundSecondary: {
		name: 'Background',
		type: 'color',
		value: "#020527",
		auto: "#020527",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundSecondaryIndent: {
		name: 'Highlighted background',
		type: 'color',
		value: "#050748",
		auto: "#050748",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundSecondaryActive: {
		name: 'Clicked background',
		type: 'color',
		value: "#080c6d",
		auto: "#080c6d",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundAccentIndent: {
		name: 'Accent',
		type: 'color',
		value: "#030531",
		auto: "#030531",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundAccentActive: {
		name: 'Clicked accent',
		type: 'color',
		value: "#050848",
		auto: "#050848",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundAccentSecondaryIndent: {
		name: 'Accent',
		type: 'color',
		value: "#050748",
		auto: "#050748",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customBackgroundAccentSecondaryActive: {
		name: 'Clicked accent',
		type: 'color',
		value: "#080c6d",
		auto: "#080c6d",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customText: {
		name: 'Text',
		type: 'color',
		value: "#ffffff",
		auto: "#ffffff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextSelect: {
		name: 'Selection',
		type: 'color',
		value: "#917aff",
		auto: "#917aff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextWeak: {
		name: 'Weak text',
		type: 'color',
		value: "#ffffff",
		auto: "#ffffff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccent: {
		name: 'Aff text',
		type: 'color',
		value: "#adc7f0",
		auto: "#adc7f0",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccentSelect: {
		name: 'Aff selection',
		type: 'color',
		value: "#917aff",
		auto: "#917aff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccentWeak: {
		name: 'Aff weak text',
		type: 'color',
		value: "#917aff",
		auto: "#917aff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccentSecondary: {
		name: 'Neg text',
		type: 'color',
		value: "#e9d6ff",
		auto: "#e9d6ff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccentSecondarySelect: {
		name: 'Neg selection',
		type: 'color',
		value: "#ffffff",
		auto: "#ffffff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customTextAccentSecondaryWeak: {
		name: 'Weak neg text',
		type: 'color',
		value: "#ffffff",
		auto: "#ffffff",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColor: {
		name: 'Selected lines',
		type: 'color',
		value: "#3e46ac",
		auto: "#3e46ac",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColorFade: {
		name: 'Unselected Lines',
		type: 'color',
		value: "#150354",
		auto: "#150354",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColorAccent: {
		name: 'Aff selected lines',
		type: 'color',
		value: "#3f46ac",
		auto: "#3f46ac",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColorAccentFade: {
		name: 'Aff highlighted lines',
		type: 'color',
		value: "#180363",
		auto: "#180363",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColorAccentSecondary: {
		name: 'Neg selected lines',
		type: 'color',
		value: "#3f46ac",
		auto: "#3f46ac",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customColorAccentSecondaryFade: {
		name: 'Neg highlighted lines',
		type: 'color',
		value: "#1e047c",
		auto: "#1e047c",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		}
	},
	customScrollbarThumb: {
		name: 'Scrollbar thumb',
		type: 'color',
		value: "#0a093e",
		auto: "#0a093e",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		},
		info: 'Only works with custom scrollbars enabled'
	},
	customScrollbarThumbHover: {
		name: 'Hovered scrollbar thumb',
		type: 'color',
		value: "#101350",
		auto: "#101350",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		},
		info: 'Only works with custom scrollbars enabled'
	},
	customScrollbarBackground: {
		name: 'Scrollbar background',
		type: 'color',
		value: "#04031c",
		auto: "#04031c",
		visibilityCondition: () => {
			return settings.data.colorTheme.value == 3;
		},
		info: 'Only works with custom scrollbars enabled'
	},
	columnWidth: {
		name: 'Column width',
		type: 'slider',
		value: 150,
		auto: 150,
		detail: {
			min: 50,
			max: 300,
			step: 1
		}
	},
	accentHue: {
		name: 'Primary color hue',
		type: 'slider',
		value: 192,
		auto: 192,
		detail: {
			min: 0,
			max: 360,
			step: 1,
			hue: true
		},
		info: 'This color will be used for aff',
		visibilityCondition: () => {
			return settings.data.colorTheme.value != 3;
		}
	},
	accentSecondaryHue: {
		name: 'Secondary color hue',
		type: 'slider',
		value: 26,
		auto: 26,
		detail: {
			min: 0,
			max: 360,
			step: 1,
			hue: true
		},
		info: 'This color will be used for neg',
		visibilityCondition: () => {
			return settings.data.colorTheme.value != 3;
		}
	},
	transitionSpeed: {
		name: 'Transition duration',
		type: 'slider',
		value: 300,
		auto: 300,
		detail: {
			min: 0,
			max: 1000,
			step: 1
		}
	},
	useTooltips: {
		name: 'Use tooltips',
		type: 'toggle',
		value: true,
		auto: true
	},
	fontSize: {
		name: 'Font size',
		type: 'slider',
		value: 0.9,
		auto: 0.9,
		detail: {
			min: 0.2,
			max: 2,
			step: 0.01
		}
	},
	fontWeight: {
		name: 'Font weight',
		type: 'slider',
		value: 300,
		auto: 300,
		detail: {
			min: 100,
			max: 900,
			step: 50
		}
	},
	fontWeightBold: {
		name: 'Font weight bold',
		type: 'slider',
		value: 700,
		auto: 700,
		detail: {
			min: 100,
			max: 900,
			step: 50
		}
	},
	fontFamily: {
		name: 'Font',
		type: 'radio',
		value: 0,
		auto: 0,
		detail: {
			options: ['Merriweather Sans', 'Helvetica', 'Georgia', 'Courier New'],
			customOption: true,
			customOptionValue: ''
		},
		info: 'Type in a custom font name if it is installed on your computer'
	},
	buttonSize: {
		name: 'Button size',
		type: 'slider',
		value: 20,
		auto: 20,
		detail: {
			min: 10,
			max: 50,
			step: 1
		}
	},
	lineWidth: {
		name: 'Line width',
		type: 'slider',
		value: 4,
		auto: 4,
		detail: {
			min: 0,
			max: 8,
			step: 1
		}
	},
	borderRadius: {
		name: 'Border radius',
		type: 'slider',
		value: 8,
		auto: 8,
		detail: {
			min: 0,
			max: 30,
			step: 1
		}
	},
	padding: {
		name: 'Padding',
		value: 8,
		auto: 8,
		type: 'slider',
		detail: {
			min: 0,
			max: 30,
			step: 1
		}
	},
	gap: {
		name: 'Grid gap',
		value: 8,
		auto: 8,
		type: 'slider',
		detail: {
			min: 0,
			max: 30,
			step: 1
		}
	},
	sidebarWidth: {
		name: 'Sidebar width',
		value: 184,
		auto: 184,
		type: 'slider',
		detail: {
			min: 50,
			max: 500,
			step: 1
		}
	},
	showUndoRedoButtons: {
		name: 'Undo/redo buttons',
		value: true,
		auto: true,
		type: 'toggle'
	},
	showBoxCreationButtons: {
		name: 'Cell creation/deletion buttons',
		value: true,
		auto: true,
		type: 'toggle'
	},
	showQuickExtensionButtons: {
		name: 'Quick extension button',
		value: true,
		auto: true,
		type: 'toggle'
	},
	showBoxFormatButtons: {
		name: 'Cell format buttons',
		value: true,
		auto: true,
		type: 'toggle'
	},
	showSideDoc: {
		name: 'Show notes doc',
		value: false,
		auto: false,
		type: 'toggle'
	},
	sideDocWidth: {
		name: 'Notes doc width',
		value: 300,
		auto: 300,
		type: 'slider',
		detail: {
			min: 50,
			max: 1000,
			step: 1
		}
	},
	customScrollbar: {
		name: 'Custom scrollbars',
		type: 'toggle',
		value: false,
		auto: false,
		info: 'Reload for these changes to take effect'
	},
	customScrollbarWidth: {
		name: 'Custom scrollbar width',
		value: 6,
		auto: 6,
		type: 'slider',
		detail: {
			min: 1,
			max: 26,
			step: 1
		},
		info: 'Does not work on Firefox'
	},
	consistentEnterBehaviour: {
		name: 'Pressing enter always creates new cell',
		value: false,
		auto: false,
		type: 'toggle',
		info: 'Reload for these changes to take effect'
	},
	tabReturnsToParent: {
		name: 'Pressing tab returns to parent on overrun',
		value: false,
		auto: false,
		type: 'toggle',
		info: 'Reload for these changes to take effect'
	}
});

type SettingsGroup = {
	name: string;
	settings: string[];
};
export const settingsGroups: SettingsGroup[] = [
	{
		name: 'General',
		settings: [
			'debateStyle',
			'LDSubstyle',
			'colorTheme',
			'columnWidth',
			'transitionSpeed',
			'useTooltips',
			'showSideDoc'
		]
	},
	{
		name: 'Colors',
		settings: ['colorTheme', 'accentHue', 'accentSecondaryHue']
	},
	{
		name: 'Background Colors',
		settings: [
			'customBackgroundBack', 'customBackground', 'customBackgroundIndent', 'customBackgroundActive',
			'customBackgroundAccentIndent', 'customBackgroundAccentActive'
		]
	},
	{
		name: 'Neg Background Colors',
		settings: ['customBackgroundSecondary', 'customBackgroundSecondaryIndent', 'customBackgroundSecondaryActive',
			'customBackgroundAccentSecondaryIndent', 'customBackgroundAccentSecondaryActive'
		]
	},
	{
		name: 'Text Colors',
		settings: ['customText', 'customTextSelect', 'customTextWeak', 'customTextAccent', 'customTextAccentSelect',
			'customTextAccentWeak', 'customTextAccentSecondary', 'customTextAccentSecondarySelect', 'customTextAccentSecondaryWeak',
		]
	},
	{
		name: 'Line Colors',
		settings: ['customColor', 'customColorFade', 'customColorAccent', 'customColorAccentFade',
			'customColorAccentSecondary', 'customColorAccentSecondaryFade'
		]
	},
	{
		name: 'Scrollbar Colors',
		settings: ['customScrollbarThumb', 'customScrollbarThumbHover', 'customScrollbarBackground']
	},
	{
		name: 'Font',
		settings: ['fontFamily', 'fontSize', 'fontWeight', 'fontWeightBold']
	},
	{
		name: 'Spacing',
		settings: ['columnWidth', 'sidebarWidth', 'sideDocWidth', 'buttonSize', 'padding', 'gap']
	},
	{
		name: 'Borders',
		settings: ['lineWidth', 'borderRadius']
	},
	{
		name: 'Animations',
		settings: ['transitionSpeed', 'useTooltips']
	},
	{
		name: 'Toolbar',
		settings: ['showUndoRedoButtons', 'showBoxCreationButtons', 'showQuickExtensionButtons', 'showBoxFormatButtons']
	},
	{
		name: 'Scrollbars',
		settings: ['customScrollbar', 'customScrollbarWidth']
	},
	{ name: 'Controls', settings: ['consistentEnterBehaviour', 'tabReturnsToParent'] }
];
