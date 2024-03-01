import { writable } from 'svelte/store';

export const tutorialStep = writable(0);
export const activeMouse = writable(true);
export const tooltipState = writable({
	open: false,
	claimed: false
});
export const appMinimized = writable(false);
export const isSheetSharing = writable(false);

const flowsChangeCallbacks: (() => void)[] = [];
export function subscribeFlowsChange(callback: () => void): () => void {
	flowsChangeCallbacks.push(callback);
	return () => {
		const index = flowsChangeCallbacks.indexOf(callback);
		if (index !== -1) {
			flowsChangeCallbacks.splice(index, 1);
		}
	};
}
export function flowsChange() {
	flowsChangeCallbacks.forEach((callback) => callback());
}
