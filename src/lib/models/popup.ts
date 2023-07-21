import type { SvelteComponent } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export const popups: Writable<
	{
		component: typeof SvelteComponent;
		title: string;
		props: any;
	}[]
> = writable([]);

export function closePopup(index: number) {
	popups.update((popups) => {
		popups.splice(index, 1);
		return popups;
	});
}
export function openPopup(component: any, title: string, { props = {} } = {}) {
	popups.update((popups) => [...popups, { component, props, title }]);
}
