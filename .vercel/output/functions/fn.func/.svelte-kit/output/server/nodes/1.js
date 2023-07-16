

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.4f6ca039.js","_app/immutable/chunks/scheduler.d2fddee9.js","_app/immutable/chunks/index.f8f1350c.js","_app/immutable/chunks/singletons.245bc642.js","_app/immutable/chunks/index.71cbf4be.js"];
export const stylesheets = [];
export const fonts = [];
