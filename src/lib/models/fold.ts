import { writable, type Writable } from 'svelte/store';
import type { BoxId } from './node';

export const folded: Writable<Map<BoxId, boolean>> = writable(new Map());
