

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.13373aeb.js","_app/immutable/chunks/scheduler.2a49f677.js","_app/immutable/chunks/index.8a1ca1b8.js","_app/immutable/chunks/singletons.39ec0fe8.js","_app/immutable/chunks/index.7f4ed86a.js"];
export const stylesheets = [];
export const fonts = [];
