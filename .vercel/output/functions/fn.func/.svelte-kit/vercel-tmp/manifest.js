export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","favicon_old.png","robots.txt"]),
	mimeTypes: {".png":"image/png",".txt":"text/plain"},
	_: {
		client: {"start":"_app/immutable/entry/start.62aa663f.js","app":"_app/immutable/entry/app.1895e5b7.js","imports":["_app/immutable/entry/start.62aa663f.js","_app/immutable/chunks/scheduler.d2fddee9.js","_app/immutable/chunks/singletons.245bc642.js","_app/immutable/chunks/index.71cbf4be.js","_app/immutable/entry/app.1895e5b7.js","_app/immutable/chunks/scheduler.d2fddee9.js","_app/immutable/chunks/index.f8f1350c.js"],"stylesheets":[],"fonts":[]},
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
