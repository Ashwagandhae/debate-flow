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
		client: {"start":"_app/immutable/entry/start.dc7ac560.js","app":"_app/immutable/entry/app.815d4b3d.js","imports":["_app/immutable/entry/start.dc7ac560.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/singletons.85f3a59e.js","_app/immutable/chunks/index.1bfb93a9.js","_app/immutable/entry/app.815d4b3d.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/index.1c7690fd.js"],"stylesheets":[],"fonts":[]},
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
