import { quadOut } from 'svelte/easing';
import { quadIn } from 'svelte/easing';

const speed = 300;

export function boxIn(node, { duration = speed }) {
  const h = node.clientHeight;
  return {
    duration,
    css: (t) => {
      const eased = quadOut(t);
      return `
        height: ${eased * h}px;
        overflow: visible;
        clip-path: inset(${(1 - eased) * h}px -20px -20px -20px);
        transform: translateY(${(1 - eased) * -h}px);`;
    },
  };
}
export function boxOut(node, { duration = speed }) {
  const h = node.clientHeight;
  return {
    duration,
    css: (t) => {
      const eased = quadIn(t);
      return `
      height: ${eased * h}px;
      overflow: visible;
      clip-path: inset(${(1 - eased) * h}px -20px -20px -20px);
      transform: translateY(${(1 - eased) * -h}px);`;
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
      transform: translateX(${(1 - eased) * 50}%)`;
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
        clip-path: inset(-20px -20px ${(1 - eased) * h}px  -20px);
        height: ${h * eased}px;
        overflow: hidden;`;
    },
  };
}
