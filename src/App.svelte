<script>
  import Flow from './Flow.svelte';
  import Title from './Title.svelte';
  import Tab from './Tab.svelte';
  import AddTab from './AddTab.svelte';

  let dark = 1;
  if (dark) {
    window.document.body.classList.toggle('dark');
  }

  let selected = 0;
  function clickTab(index) {
    selected = index;
    focusFlow();
  }
  let flows = [];
  function focusFlow() {
    if (flows[selected]?.lastFocus != undefined) {
      let { parent, index } = flows[selected].lastFocus;
      if (parent.children[index]) {
        parent.children[index].focus = true;
        flows = flows;
      } else {
        flows[selected].children[0].focus = true;
      }
    } else {
      flows[selected].children[0].focus = true;
    }
  }
  function addFlow(neg) {
    // function addFlow(neg) {
    let columns;
    if (neg) {
      columns = ['1NC', '2AC', '2NC', '1NR', '1AR', '2NR', '2AR'];
    } else {
      columns = ['1AC', '1NC', '2AC', '2NC', '1NR', '1AR', '2NR', '2AR'];
    }
    flows.push({
      content: '',
      level: 0,
      columns: columns,
      neg: neg,
      focus: true,
      lastFocus: undefined,
      children: [
        {
          content: '',
          level: 1,
          index: 0,
          children: [],
        },
      ],
    });
    selected = flows.length - 1;
    flows = flows;
  }
  addFlow(false);
</script>

<main class:dark>
  <div class="tabs">
    <ul>
      {#each flows as flow, index}
        <Tab
          on:click={() => clickTab(index)}
          on:focusFlow={focusFlow}
          bind:content={flow.content}
          selected={index == selected}
        />
      {/each}
      <div class="add-tab">
        <AddTab content="+ on case" on:click={() => addFlow(false)} />
        <AddTab content="+ off case" on:click={() => addFlow(true)} />
      </div>
    </ul>
  </div>
  <div class="title">
    {#if flows.length > 0}
      <Title on:focusFlow={focusFlow} bind:flow={flows[selected]} />
    {/if}
  </div>
  <div class="flow">
    {#each flows as flow, i}
      {#if i == selected}
        <Flow on:focusFlow={focusFlow} bind:root={flow} />
      {/if}
    {/each}
  </div>
</main>

<style>
  :global(body) {
    padding: 0;
    margin: 0;
  }
  main {
    display: grid;
    gap: var(--gap);
    grid-template-areas:
      'a b'
      'a c';
    grid-template-columns: max(150px, 15%) auto;
    padding: 5vh;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  ul {
    padding: 0;
    margin: 0;
  }
  .tabs {
    background: var(--background);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    border-radius: var(--border-radius);
    padding: var(--padding);
    grid-area: a;
  }
  .tabs > ul {
    padding-bottom: calc(var(--view-height) * 0.6);
  }

  .add-tab {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    grid-gap: var(--padding);
  }
  .title {
    background: var(--background);
    border-radius: var(--border-radius);
    width: 100%;
    height: var(--title-height);
  }
  .flow {
    width: 100%;
    overflow-x: auto;
    background: var(--background);
    z-index: 0;
    border-radius: var(--border-radius);
    grid-area: c;
    height: var(--view-height);
  }
  /* Hide scrollbar for Chrome, Safari and Opera */
  .tabs::-webkit-scrollbar,
  .flow::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .tabs,
  .flow {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  :global(body) {
    background: var(--background-back);
    color: var(--color);
    font-family: var(--font-family);
  }
  :global(:root) {
    --column-width: 150px;
    --padding: 8px;
    --title-height: 70px;
    --gap: 16px;
    --view-height: calc(90vh - var(--title-height) - var(--gap));
    --font-size: 0.9em;
    --font-family: Avenir, sans-serif;
    --border-radius: 15px;
    --br-height: 4px;
  }
  :global(body) {
    --background-back: hsl(0 0% 90%);

    --background: hsl(0 0% 100%);
    --background-indent: hsl(0 0% 92%);
    --background-active: hsl(0 0% 84%);

    --background-secondary: hsl(0 0% 97%);
    --background-secondary-indent: hsl(0 0% 89%);
    --background-secondary-active: hsl(0 0% 81%);

    --color: hsl(0 0% 30%);
    --color-weak: hsl(0, 0%, 70%);
  }
  :global(body.dark) {
    --background-back: hsl(0 0% 10%);

    --background: hsl(0 0% 16%);
    --background-indent: hsl(0 0% 24%);
    --background-active: hsl(0 0% 30%);

    --background-secondary: hsl(0 0% 18%);
    --background-secondary-indent: hsl(0 0% 28%);
    --background-secondary-active: hsl(0 0% 32%);

    --color: hsl(0 0% 85%);
    --color-weak: hsl(0, 0%, 40%);
  }
</style>
