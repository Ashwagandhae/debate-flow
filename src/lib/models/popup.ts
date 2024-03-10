import type { ComponentProps, ComponentType, SvelteComponent } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export type PopupGen<Component extends SvelteComponent> = {
	component: ComponentType<Component>;
	title: string;
	props: ComponentProps<Component>;
};

export type Popup = PopupGen<SvelteComponent>;
export const popups: Writable<Popup[]> = writable([]);

export function closePopup(index: number) {
	popups.update((popups) => {
		popups.splice(index, 1);
		return popups;
	});
}
export function openPopup<P extends object>(
	component: ComponentType<SvelteComponent<P>>,
	title: string,
	props?: P
) {
	popups.update((popups) => [...popups, { component, props, title }]);
}

export function openTopPopup<P extends object>(
	component: ComponentType<SvelteComponent<P>>,
	title: string,
	props?: P
) {
	popups.update((popups) => [{ component, props, title }, ...popups]);
}
