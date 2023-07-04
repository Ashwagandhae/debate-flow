

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.c2779bcd.js","_app/immutable/chunks/scheduler.d614411d.js","_app/immutable/chunks/index.11deee02.js","_app/immutable/chunks/singletons.76023d28.js","_app/immutable/chunks/index.ce2f0656.js"];
export const stylesheets = [];
export const fonts = [];
