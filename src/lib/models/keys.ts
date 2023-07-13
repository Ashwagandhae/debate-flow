// export const keyDict: {
// 	[key: string]: string;
// } = {
// 	commandControl: '⌘/⌃',
// 	command: '⌘',
// 	shift: '⇧',
// 	option: '⌥',
// 	control: '⌃',
// 	up: '↑',
// 	down: '↓',
// 	left: '←',
// 	right: '→',
// 	escape: '⎋',
// 	return: '↵',
// 	space: '␣',
// 	delete: '⌫',
// 	backspace: '⌦',
// 	tab: '⇥',
// 	home: '⇱',
// 	end: '⇲',
// 	pageup: '⇞',
// 	pagedown: '⇟',
// 	insert: '⌤'
// };

export const keyDict: {
	[key: string]: string;
} = {
	commandControl: 'cmd/ctrl',
	command: 'cmd',
	shift: 'shift',
	option: 'alt',
	control: 'ctrl',
	up: '↑',
	down: '↓',
	left: '←',
	right: '→',
	escape: 'esc',
	return: '↵',
	space: 'space',
	delete: 'delete',
	tab: 'tab'
};

export type KeyComboHandlerOptions = {
	handle: () => void;
	require?: () => boolean;
	stopRepeat?: boolean;
	preventDefault?: boolean;
};
const defaultKeyComboHandlerOptions = {
	require: () => true,
	stopRepeat: true,
	preventDefault: true
};
function createKeyComboHandler(options: KeyComboHandlerOptions): (e: KeyboardEvent) => boolean {
	const { handle, require, stopRepeat, preventDefault } = {
		...defaultKeyComboHandlerOptions,
		...options
	};
	return function (e: KeyboardEvent) {
		if (!require()) {
			return false;
		}
		if (preventDefault) {
			e.preventDefault();
		}
		if (stopRepeat && e.repeat == true) {
			return false;
		}
		handle();
		return true;
	};
}
export type KeyComboOptionsIndex = {
	[key: string]: {
		[key: string]: KeyComboHandlerOptions;
	};
};
type KeyComboIndex = {
	[key: string]: {
		[key: string]: (e: KeyboardEvent) => boolean;
	};
};

export function createKeyDownHandler(
	keyComboOptionIndex: KeyComboOptionsIndex
): (e: KeyboardEvent) => void {
	// convert from option to handler
	const keyComboIndex: KeyComboIndex = {};
	for (const [modifiersKey, keyComboOptions] of Object.entries(keyComboOptionIndex)) {
		keyComboIndex[modifiersKey] = {};
		for (const [key, keyComboOption] of Object.entries(keyComboOptions)) {
			keyComboIndex[modifiersKey][key] = createKeyComboHandler(keyComboOption);
		}
	}

	return function (e: KeyboardEvent) {
		const modifiers = [];
		if (e.metaKey) {
			modifiers.push('command');
		}
		if (e.ctrlKey) {
			modifiers.push('control');
		}
		if (e.altKey) {
			modifiers.push('alt');
		}
		if (e.shiftKey) {
			modifiers.push('shift');
		}
		const key = e.key.length == 1 ? e.key.toLowerCase() : e.key;
		let modifiersKey = modifiers.length == 0 ? 'none' : modifiers.join(' ');
		let handler = keyComboIndex[modifiersKey]?.[key];
		if (handler == null) {
			if ((e.metaKey || e.ctrlKey) && !(e.metaKey && e.ctrlKey)) {
				modifiersKey = modifiersKey
					.replace('command', 'commandControl')
					.replace('control', 'commandControl');
				handler = keyComboIndex[modifiersKey]?.[key];
			}
		}
		if (handler == null) return;
		handler(e);
	};
}
