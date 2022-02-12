<script>
  export let name;
  export let size = '1rem';
  let icons = [
    {
      box: 100,
      name: 'arrowRight',
      svg: `<path d="M27 7L74 50L27 93" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      box: 100,
      name: 'arrowLeft',
      svg: `<path d="M74 93L27 50L74 7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      box: 100,
      name: 'arrowUp',
      svg: `<path d="M7.5 73.5L50.5 26.5L93.5 73.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      box: 100,
      name: 'arrowDown',
      svg: `<path d="M93.5 26.5L50.5 73.5L7.5 26.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      box: 100,
      name: 'delete',
      svg: `<path d="M85.7107 15L15 85.7107" stroke-width="10" stroke-linecap="round"/>
<path d="M15 15L85.7107 85.7107" stroke-width="10" stroke-linecap="round"/>`,
    },
  ];
  let displayIcon = icons.find((e) => e.name === name);
</script>

<svg
  style={`width:${size};height:${size};display:block;margin:auto;`}
  viewBox="0 0 {displayIcon.box} {displayIcon.box}"
  fill="none"
  stroke="var(--color)"
>
  {@html displayIcon.svg}
</svg>
