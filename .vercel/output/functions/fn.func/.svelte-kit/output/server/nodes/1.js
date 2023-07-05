

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.8ad955e8.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/index.1c7690fd.js","_app/immutable/chunks/singletons.01b4756a.js","_app/immutable/chunks/index.1bfb93a9.js"];
export const stylesheets = [];
export const fonts = [];
