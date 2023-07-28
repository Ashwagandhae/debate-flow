// @ts-check
/**
 * @typedef {import("../src/lib/models/shareType").SheetsMessage} SheetsMessage
 * @typedef {import("../src/lib/models/shareType").SheetsResponse} SheetsResponse
 */

(async function () {
	const URL = 'https://debate-flow.vercel.app/app';
	// const URL = 'http://localhost:5173/app';
	const VERSION = '0.0.1';
	const GOTO_INPUT_SELECT =
		'.docs-gotobar-content > input[type="text"][aria-label="Enter a range"]';
	const GOTO_BUTTON_SELECT = '.docs-gotobar-content > [aria-label="Go to range"]';
	const CELL_GLOBAL_INPUT_SELECT = '#t-formula-bar-input > .cell-input';
	const CELL_INPUT_SELECT = '.cell-input.editable';
	const NAME_BOX_INPUT = '.jfk-textinput.waffle-name-box';
	/**
	 * @param {Element | null} target
	 * @param {string} event
	 */
	function dispatchClickEvent(target, event) {
		if (target == null) return;
		var e = document.createEvent('MouseEvent');
		e.initEvent.apply(e, [event, false, true]);
		target.dispatchEvent(e);
	}
	/**
	 * @param {Element | null} el
	 * @returns
	 */
	function clickEl(el) {
		dispatchClickEvent(el, 'mouseover');
		dispatchClickEvent(el, 'mousedown');
		dispatchClickEvent(el, 'click');
		dispatchClickEvent(el, 'mouseup');
	}
	/**
	 * @param {Element | null} el
	 * @returns
	 */
	function focusEl(el) {
		if (el == null) return;
		let focusEvent = new FocusEvent('focus');
		dispatchClickEvent(el, 'mouseover');
		dispatchClickEvent(el, 'mousedown');
		el.dispatchEvent(focusEvent);
		dispatchClickEvent(el, 'click');
		dispatchClickEvent(el, 'mouseup');
	}
	/**
	 * @param {Element} target
	 * @param {string} event
	 * @param {string} key
	 * @param {{[key: string]: boolean}} modifiers
	 */
	function dispatchKeyEvent(
		target,
		event,
		key,
		{ altKey, ctrlKey, shiftKey, metaKey, repeat } = {}
	) {
		var e = new KeyboardEvent(event, {
			key,
			code: key,
			altKey,
			ctrlKey,
			shiftKey,
			metaKey,
			repeat,
			bubbles: true,
			cancelable: true
		});
		target.dispatchEvent(e);
	}

	/**
	 * @param {Element} el
	 * @param {string} key
	 * @param {{[key: string]: boolean}} modifiers
	 * @returns
	 */
	function pressKey(el, key, { altKey, ctrlKey, shiftKey, metaKey } = {}) {
		dispatchKeyEvent(el, 'keydown', key, { altKey, ctrlKey, shiftKey, metaKey });
		dispatchKeyEvent(el, 'keypress', key, { altKey, ctrlKey, shiftKey, metaKey });
		dispatchKeyEvent(el, 'keyup', key, { altKey, ctrlKey, shiftKey, metaKey });
	}

	/**
	 * @param {Element} el
	 * @param {string} key
	 * @param {{[key: string]: boolean}} modifiers
	 * @returns
	 */
	function pressKeyShortcut(el, key, { altKey, ctrlKey, shiftKey, metaKey } = {}) {
		for (let event of ['keydown', 'keypress']) {
			if (altKey) dispatchKeyEvent(el, event, 'Alt');
			if (ctrlKey) dispatchKeyEvent(el, event, 'Control');
			if (shiftKey) dispatchKeyEvent(el, event, 'Shift');
			if (metaKey) dispatchKeyEvent(el, event, 'Meta');
		}
		pressKey(el, key, { altKey, ctrlKey, shiftKey, metaKey });
		if (altKey) dispatchKeyEvent(el, 'keyup', 'Alt');
		if (ctrlKey) dispatchKeyEvent(el, 'keyup', 'Control');
		if (shiftKey) dispatchKeyEvent(el, 'keyup', 'Shift');
		if (metaKey) dispatchKeyEvent(el, 'keyup', 'Meta');
	}

	function initGoto() {
		// goto menu not open, open it

		let cell = /** @type {HTMLElement} */ (document.querySelector(NAME_BOX_INPUT)); // idk why focusing cell is necessary
		pressKeyShortcut(cell, 'g', { ctrlKey: true });
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(null);
			}, 100);
		});
	}
	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns
	 */
	function gotoCell(col, row) {
		// make 1 indexed instead of 0 indexed
		row++;
		col++;
		// convert row to letter (1 -> A, 2 -> B, etc)
		const cellRange = String.fromCharCode(64 + col) + row.toString();
		let gotoInput = /**  @type {HTMLInputElement} */ (document.querySelector(GOTO_INPUT_SELECT));
		gotoInput.value = cellRange;
		const gotoButton = document.querySelector(GOTO_BUTTON_SELECT);
		clickEl(gotoButton);
	}

	/**
	 * @param {number} row
	 * @param {number} col
	 * @returns {Promise<string>}
	 */
	function readCell(col, row) {
		return new Promise((resolve) => {
			gotoCell(col, row);
			focusEl(document.querySelector(NAME_BOX_INPUT)); // need to unfocus cell to update state
			const cell = document.querySelector(CELL_GLOBAL_INPUT_SELECT);
			focusEl(cell);
			setTimeout(function () {
				// wait for dom to update
				resolve(cell?.textContent ?? '');
				clickEl(document.querySelector(NAME_BOX_INPUT)); // click somewhere else to unfocus and save changes
			}, 0);
		});
	}

	/**
	 * @param {number} row
	 * @param {number} col
	 * @param {string} value
	 */
	function writeCell(col, row, value) {
		gotoCell(col, row);
		const cell = /**  @type {HTMLInputElement} */ (document.querySelector(CELL_INPUT_SELECT));
		pressKey(cell, 'Backspace');
		focusEl(cell);
		cell.textContent = value;
		pressKey(cell, 'Enter');
		clickEl(document.querySelector(NAME_BOX_INPUT)); // click somewhere else to unfocus and save changes
	}

	await initGoto();
	/**
	 * @param {MessageEvent & {source: any}} event
	 * @param {SheetsResponse} response
	 * @returns
	 * @throws
	 */
	function respondToMessage(event, response) {
		event.source.postMessage(response, event.origin);
	}

	let iframe = document.createElement('iframe');
	iframe.src = URL;
	iframe.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; z-index: 99999`;
	// connection between flower and sheets
	window.addEventListener(
		'message',
		/**
		 * @param {MessageEvent<SheetsMessage> & {source: any}} event
		 */
		async (event) => {
			const message = event.data;
			/** @type {SheetsResponse | null} */
			let response = null;
			switch (message.message) {
				// init: sends url so flower can verify it's on the right page. also sends this script's version
				case 'flower:init':
					response = {
						message: 'flower:init',
						data: {
							version: VERSION,
							ready: true,
							url: window.location.href
						}
					};
					break;
				// close: closes the flower iframe
				case 'flower:close':
					iframe.remove();
					return;
				// readCell: reads a cell from the sheet, and sends the value back to flower
				case 'flower:readCell': {
					/** @type {{value: string}[]}*/
					let responseData = [];
					for (let data of message.data) {
						responseData.push({
							value: await readCell(data.col, data.row)
						});
					}
					response = {
						message: 'flower:readCell',
						data: responseData
					};
					break;
				}
				// writeCell: writes a value sent from flower to the sheet
				case 'flower:writeCell': {
					for (let data of message.data) {
						writeCell(data.col, data.row, data.value);
					}
					response = {
						message: 'flower:writeCell',
						data: null
					};
					break;
				}
				// resizeMove: resizes and moves the flower iframe
				case 'flower:resizeMove':
					iframe.style.width = message.data.width ?? iframe.style.width;
					iframe.style.height = message.data.height ?? iframe.style.height;
					iframe.style.top = message.data.top ?? iframe.style.top;
					iframe.style.left = message.data.left ?? iframe.style.left;
					response = {
						message: 'flower:resizeMove',
						data: null
					};
			}
			if (response == null) return;
			respondToMessage(event, response);
		}
	);
	document.body.appendChild(iframe);
})();
