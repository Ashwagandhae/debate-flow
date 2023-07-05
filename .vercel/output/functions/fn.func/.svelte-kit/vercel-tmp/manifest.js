export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.45b4d08c.js","app":"_app/immutable/entry/app.11d64271.js","imports":["_app/immutable/entry/start.45b4d08c.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/singletons.01b4756a.js","_app/immutable/chunks/index.1bfb93a9.js","_app/immutable/entry/app.11d64271.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/index.1c7690fd.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
