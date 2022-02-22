import { quadOut } from 'svelte/easing';
import { quadIn } from 'svelte/easing';

export const speed = 300;

export function boxIn(node, { duration = speed }) {
  const h = node.clientHeight;
  return {
    duration,
    css: (t) => {
      const eased = quadOut(t);

      return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h - 2}px 0 -${h}px 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
    },
  };
}
export function boxOut(node, { duration = speed }) {
  const h = node.clientHeight;
  return {
    duration,
    css: (t) => {
      const eased = quadOut(t);
      return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h}px 0 0 0);
        transform: translateY(${(1 - eased) * -h}px);
        `;
    },
  };
}
export function boxButtonIn(node, { delay = 0, duration = speed }) {
  return {
    delay,
    duration,
    css: (t) => {
      return `
        opacity:${t};
      `;
    },
  };
}
export function brIn(node, { delay = 0, duration = speed }) {
  return {
    delay,
    duration,
    css: (t) => {
      const eased = quadOut(t);

      return `
        clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
        transform: translateX(${(1 - eased) * 50}%);
      `;
    },
  };
}

export function brOut(node, { delay = 0, duration = speed }) {
  return {
    delay,
    duration,
    css: (t) => {
      const eased = quadIn(t);

      return `
      clip-path:inset(0% ${(1 - eased) * 100}% 0% 0%);
      transform: translateX(${(1 - eased) * 50}%)`;
    },
  };
}

export function tabIn(node, { duration = speed }) {
  const h = node.clientHeight;
  return {
    duration,
    css: (t) => {
      const eased = quadOut(t);
      return `
        height: ${h * eased}px;
        overflow: hidden;
        transform: translateX(${-100 * (1 - eased)}%);
      `;
    },
  };
}
export function flowIn(node, { delay = 300, duration = speed }) {
  return {
    delay,
    duration,
    css: (t) => {
      const eased = quadOut(t);

      return `
        transform: translateX(${-100 * (1 - eased)}vw);
      `;
    },
  };
}
export function flowOut(node, { duration = speed }) {
  return {
    duration,
    css: (t) => {
      const eased = quadOut(t);

      return `
        transform: translateX(${100 * (1 - eased)}vw);
      `;
    },
  };
}
