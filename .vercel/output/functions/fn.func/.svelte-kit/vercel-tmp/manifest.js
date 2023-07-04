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
		client: {"start":"_app/immutable/entry/start.7b87c6f0.js","app":"_app/immutable/entry/app.a0d76d7a.js","imports":["_app/immutable/entry/start.7b87c6f0.js","_app/immutable/chunks/scheduler.d614411d.js","_app/immutable/chunks/singletons.76023d28.js","_app/immutable/chunks/index.ce2f0656.js","_app/immutable/entry/app.a0d76d7a.js","_app/immutable/chunks/scheduler.d614411d.js","_app/immutable/chunks/index.11deee02.js"],"stylesheets":[],"fonts":[]},
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
