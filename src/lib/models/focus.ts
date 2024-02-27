import { writable, type Writable } from 'svelte/store';
import type { BoxId, FlowId } from './node';

export const selectedFlowId: Writable<FlowId | null> = writable(null);

export const focusId: Writable<FlowId | BoxId | null> = writable(null);

export const lastFocusIds: Writable<{
	[key: FlowId]: FlowId | BoxId;
}> = writable({});
