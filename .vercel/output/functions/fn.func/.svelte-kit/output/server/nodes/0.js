import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.29132eee.js","_app/immutable/chunks/scheduler.2a49f677.js","_app/immutable/chunks/index.8a1ca1b8.js","_app/immutable/chunks/settings.85f2d64a.js"];
export const stylesheets = ["_app/immutable/assets/0.95367aa3.css"];
export const fonts = ["_app/immutable/assets/merriweather-sans-vietnamese-300-normal.94c8661f.woff2","_app/immutable/assets/merriweather-sans-vietnamese-300-normal.9f409e45.woff","_app/immutable/assets/merriweather-sans-latin-ext-300-normal.afc8e8b8.woff2","_app/immutable/assets/merriweather-sans-latin-ext-300-normal.97f8aa5a.woff","_app/immutable/assets/merriweather-sans-latin-300-normal.82b48474.woff2","_app/immutable/assets/merriweather-sans-latin-300-normal.77ee271f.woff","_app/immutable/assets/merriweather-sans-vietnamese-700-normal.22b87631.woff2","_app/immutable/assets/merriweather-sans-vietnamese-700-normal.3c2ef06f.woff","_app/immutable/assets/merriweather-sans-latin-ext-700-normal.778f1ed2.woff2","_app/immutable/assets/merriweather-sans-latin-ext-700-normal.f3d0fb71.woff","_app/immutable/assets/merriweather-sans-latin-700-normal.97d8d889.woff2","_app/immutable/assets/merriweather-sans-latin-700-normal.300719ca.woff"];
