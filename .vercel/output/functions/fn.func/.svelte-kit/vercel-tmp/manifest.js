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
		client: {"start":"_app/immutable/entry/start.5e0056f8.js","app":"_app/immutable/entry/app.6d616a98.js","imports":["_app/immutable/entry/start.5e0056f8.js","_app/immutable/chunks/scheduler.d614411d.js","_app/immutable/chunks/singletons.b4709d3d.js","_app/immutable/chunks/index.ce2f0656.js","_app/immutable/entry/app.6d616a98.js","_app/immutable/chunks/scheduler.d614411d.js","_app/immutable/chunks/index.11deee02.js"],"stylesheets":[],"fonts":[]},
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
