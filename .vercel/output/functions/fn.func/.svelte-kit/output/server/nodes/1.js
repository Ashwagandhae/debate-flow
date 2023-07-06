

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.75f41257.js","_app/immutable/chunks/scheduler.63234726.js","_app/immutable/chunks/index.1c7690fd.js","_app/immutable/chunks/singletons.da360867.js","_app/immutable/chunks/index.1bfb93a9.js"];
export const stylesheets = [];
export const fonts = [];
