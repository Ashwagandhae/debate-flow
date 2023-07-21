(function () {
	// let iframe = document.createElement('iframe');
	// iframe.src = 'https://debate-flow.vercel.app/app';
	// iframe.style = `
	//   position: fixed;
	//   top: 0;
	//   right: 0;
	//   width: 100vw;
	//   height: 100vh;
	//   border: none;
	//   z-index: 99999
	// `;
	// document.body.appendChild(iframe);
})();

// Adds the extractor into the page context (aka "main world")
// const script = document.createElement('script');
// const eventId = `${Math.random()}${performance.now()}`;
// script.textContent = `(${(eventId) => {
// 	window.addEventListener(eventId, () => {
// 		const doc = document.querySelector('.docs-texteventtarget-iframe').contentDocument;
// 		const key = Object.keys(doc).find((k) => k.startsWith('closure_'));
// 		const res = dig(key ? doc[key] : doc.defaultView, new Set());
// 		window.dispatchEvent(new CustomEvent(`${eventId}res`, { detail: res || '' }));
// 	});

// 	/**
// 	 * Recursively searches for the text content of the document
// 	 * @param {any} src
// 	 * @param {Set} seen
// 	 * @returns {any}
// 	 */
// 	function dig(src, seen) {
// 		seen.add(src);
// 		if (!Array.isArray(src)) src = Object.values(src);
// 		for (let v, len = src.length, i = 0; i < len; i++) {
// 			try {
// 				if (
// 					!(v = src[i]) ||
// 					Object.prototype.toString.call(v) === '[object Window]' ||
// 					seen.has(v)
// 				) {
// 					continue;
// 				}
// 			} catch (e) {
// 				continue;
// 			}
// 			seen.add(v);
// 			if (
// 				(typeof v === 'string' && v[0] === '\x03' && v.endsWith('\n')) ||
// 				(typeof v === 'object' && (v = dig(v, seen)))
// 			) {
// 				return v;
// 			}
// 		}
// 	}
// }})(${JSON.stringify(eventId)})`;
// document.documentElement.appendChild(script);
// script.remove();

// // Calls the extractor via synchronous DOM messaging
// function getDocText() {
// 	let res;
// 	window.addEventListener(
// 		`${eventId}res`,
// 		(e) => {
// 			res = e.detail;
// 		},
// 		{ once: true }
// 	);
// 	window.dispatchEvent(new CustomEvent(eventId));
// 	return res;
// }

// works on google docs
(function () {
	const doc = document.querySelector('.docs-texteventtarget-iframe').contentDocument;
	const key = Object.keys(doc).find((k) => k.startsWith('closure_'));
	const res = dig(key ? doc[key] : doc.defaultView, new Set());
	console.log(res);
	function dig(src, seen) {
		seen.add(src);
		if (!Array.isArray(src)) src = Object.values(src);
		for (let i = 0; i < src.length; i++) {
			let v = src[i];
			try {
				if (!v || Object.prototype.toString.call(v) === '[object Window]' || seen.has(v)) {
					continue;
				}
			} catch (e) {
				continue;
			}
			seen.add(v);
			if (typeof v === 'string' && v[0] === '\x03' && v.endsWith('\n')) {
				return v;
			} else if (typeof v === 'object') {
				let newV = dig(v, seen);
				if (newV) {
					return newV;
				}
			}
		}
		return null;
	}
})();

(function () {
	// works on google sheets
	/**
	 *
	 * @param {number} row
	 * @param {number} col
	 * @returns
	 */
	function goToCell(row, col) {
		// make 1 indexed instead of 0 indexed
		row++;
		col++;
		// convert row to letter (1 -> A, 2 -> B, etc)
		const cellRange = String.fromCharCode(64 + col) + row.toString();
		const gotoInput = document.querySelector(
			'.docs-gotobar-content > input[type="text"][aria-label="Enter a range"]'
		);

		// select input
		let focusEvent = new Event('focus', { bubbles: true });
		gotoInput.dispatchEvent(focusEvent);
		let event = new Event('input', { bubbles: true });
		gotoInput.value = cellRange;
		gotoInput.dispatchEvent(event);
		// go to cell
		const gotoButton = document.querySelector('.docs-gotobar-content > [aria-label="Go to range"]');
		gotoButton.click();
	}
	goToCell(1, 1);
})();
