import { defineConfig } from 'vite';

import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      plugins: [
        svelte({
          hot: {
            preserveLocalState: true,
          },
        }),
      ],
    };
  } else {
    return {
      base: '/debate-flow/',
      plugins: [svelte({})],
    };
  }
});
