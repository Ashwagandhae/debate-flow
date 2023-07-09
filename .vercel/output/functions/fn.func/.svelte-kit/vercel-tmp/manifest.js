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
		client: {"start":"_app/immutable/entry/start.c4e59361.js","app":"_app/immutable/entry/app.38e35147.js","imports":["_app/immutable/entry/start.c4e59361.js","_app/immutable/chunks/scheduler.2a49f677.js","_app/immutable/chunks/singletons.ee30e52a.js","_app/immutable/chunks/index.7f4ed86a.js","_app/immutable/entry/app.38e35147.js","_app/immutable/chunks/scheduler.2a49f677.js","_app/immutable/chunks/index.8a1ca1b8.js"],"stylesheets":[],"fonts":[]},
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
