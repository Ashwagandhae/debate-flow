console.log('hehehe');
Element.prototype._addEventListener = Element.prototype.addEventListener;
Element.prototype.addEventListener = function () {
	let args = [...arguments];
	let ogFn = args[1];
	args[1] = function () {
		let eventArgs = [...arguments];
		if (eventArgs[0].isTrusted) {
			return ogFn(...eventArgs);
		}
		let newEvent = {};
		for (let key in eventArgs[0]) {
			newEvent[key] = eventArgs[0][key];
		}
		newEvent.isTrusted = true;
		eventArgs[0] = newEvent;
		return ogFn(...eventArgs);
	};
	return this._addEventListener(...args);
};
