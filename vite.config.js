import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      plugins: [
        svelte({
          hot: {
            preserveLocalState: true,
          },
          preprocess: preprocess(),
        }),
      ],
    };
  } else {
    return {
      base: '/debate-flow/',
      plugins: [svelte({ preprocess: preprocess() })],
    };
  }
});
