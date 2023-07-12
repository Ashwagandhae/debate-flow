import { quadOut } from 'svelte/easing';
import { quadIn } from 'svelte/easing';
import { settings } from '../models/settings';

export function boxIn(node: HTMLElement, { skip }: { skip: boolean }) {
	// don't do transition if skip
	if (skip) {
		return {
			duration: 0,
			css: () => ''
		};
	}
	const h = node.clientHeight;

	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        height: calc(${eased * h}px - var(--padding) * 2);
        overflow: visible;
        clip-path: inset(${(1 - eased) * h - 2}px 0 -${h}px 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
		}
	};
}
export function boxOut(node: HTMLElement, { skip }: { skip: boolean }) {
	// don't do transition if skip
	if (skip) {
		return {
			duration: 0,
			css: () => ''
		};
	}
	const h = node.clientHeight;
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);
			return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h}px 0 0 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
		}
	};
}
export function boxButtonIn(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			return `
        opacity:${t};
      `;
		}
	};
}
export function brIn(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
        transform: translateX(${(1 - eased) * 50}%);
      `;
		}
	};
}

export function brOut(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadIn(t);

			return `
      clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
      transform: translateX(${(1 - eased) * 50}%)`;
		}
	};
}

export function tab(node: Element) {
	const h = node.clientHeight;
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);
			return `
        height: ${h * eased}px;
        margin-bottom: calc(${eased} * var(--padding));
        transform: scale(${eased});
        opacity: ${eased};
      `;
		}
	};
}
export function tabList(node: HTMLElement) {
	const h = node.clientHeight;
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);
			return `
        height: ${h * eased}px;
        transform: scale(${eased});
        opacity: ${eased};
      `;
		}
	};
}

export function flowIn(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        transform: translateX(${-100 * (1 - eased)}vw);
      `;
		}
	};
}
export function flowOut(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        transform: translateX(${100 * (1 - eased)}vw);
      `;
		}
	};
}

export function tooltipTransition(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        transform: scale(${eased});
        opacity: ${t};
      `;
		}
	};
}

export function popupIn(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        transform: scale(${eased});
        opacity: ${t};
      `;
		}
	};
}
export function popupOut(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);

			return `
        transform: scale(${eased});
        opacity: ${t};
      `;
		}
	};
}
export function screenTransition(_node: HTMLElement) {
	return {
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			return `
        opacity: ${t};
      `;
		}
	};
}

export function tutorialSpan(_node: HTMLElement, { delay }: { delay?: number } = { delay: 0 }) {
	return {
		delay,
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			return `
        opacity: ${t};
      `;
		}
	};
}

export function tutorialBlock(node: HTMLElement, { delay }: { delay?: number } = { delay: 0 }) {
	const style = getComputedStyle(node);
	const paddingTop = parseInt(style.getPropertyValue('padding-top'));
	const paddingBottom = parseInt(style.getPropertyValue('padding-bottom'));
	const h = node.clientHeight - paddingTop - paddingBottom;
	return {
		delay,
		duration: settings.data.transitionSpeed.value as number,
		css: (t: number) => {
			const eased = quadOut(t);
			return `
        opacity: ${t};
				height: ${eased * h}px;
				padding-top: ${eased * paddingTop}px;
				padding-bottom: ${eased * paddingBottom}px;
				scale: ${eased};
      `;
		}
	};
}
