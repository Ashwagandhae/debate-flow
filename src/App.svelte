<script>
  import Flow from './Flow.svelte';
  import Title from './Title.svelte';
  import Button from './Button.svelte';
  import ButtonBar from './ButtonBar.svelte';
  import Tab from './Tab.svelte';
  import AddTab from './AddTab.svelte';
  import { speed } from './transition.js';

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
  function boxFromPath(path, scope) {
    if (!scope) {
      scope = 0;
    }
    let ret = flows[selected];
    if (path.length > 1) {
      for (let i = 1; i < path.length - scope; i++) {
        ret = ret.children[path[i]];
      }
    }
    return ret;
  }
  function focusFlow() {
    let lastFocus = boxFromPath(flows[selected]?.lastFocus);
    if (lastFocus) {
      lastFocus.focus = true;
    } else {
      flows[selected].children[0].focus = true;
    }
    flows = flows;
  }
  function addFlow(neg) {
    // function addFlow(neg) {
    let columns;
    if (neg) {
      columns = ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'];
    } else {
      columns = ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'];
    }
    flows.push({
      content: '',
      level: 0,
      columns: columns,
      neg: neg,
      focus: true,
      index: flows.length,
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
  function handleKeydown(e) {
    if (e.ctrlKey && e.shiftKey && e.key == 'N') {
      e.preventDefault();
      addFlow(false);
    } else if (e.ctrlKey && e.key == 'n') {
      e.preventDefault();
      addFlow(true);
    }
  }
  addFlow(false);
  function download() {
    let data = JSON.stringify(flows);
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8, ' + encodeURIComponent(data)
    );
    element.setAttribute('download', 'flow.json');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  function readUploadDragged(e) {
    e.preventDefault();
    let file = e.dataTransfer.files[0];

    let reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  }
  function readUpload() {
    let file = document.getElementById('uploadId').files[0];

    let reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  }
  function preventDefault(e) {
    e.preventDefault();
  }
  function openUploadDialog() {
    document.getElementById('uploadId').click();
  }
  function handleUpload(data) {
    flows = JSON.parse(data);
  }

  window.addEventListener(
    'dragover',
    function (e) {
      e = e || event;
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    'drop',
    function (e) {
      e = e || event;
      e.preventDefault();
    },
    false
  );
</script>

<svelte:body
  on:keydown={handleKeydown}
  on:dragenter={preventDefault}
  on:drop={readUploadDragged} />
<main class:dark style={`--transition-speed: ${speed}ms;`}>
  <div class="sidebar">
    <div class="header">
      <ButtonBar>
        <Button name="download" on:click={download} />
        <input id="uploadId" type="file" hidden on:change={readUpload} />
        <Button name="upload" on:click={openUploadDialog} />
      </ButtonBar>
    </div>
    <div class="tabs">
      <ul>
        {#each flows as flow, index}
          <Tab
            on:click={() => clickTab(index)}
            bind:content={flow.content}
            selected={index == selected}
          />
        {/each}
        <div class="add-tab">
          <AddTab content="on case" on:click={() => addFlow(false)} />
          <AddTab content="off case" on:click={() => addFlow(true)} />
        </div>
      </ul>
    </div>
  </div>
  <div class="title">
    {#if flows.length > 0}
      <Title bind:flow={flows[selected]} />
    {/if}
  </div>
  {#key selected}
    <div class="flow">
      <Flow on:focusFlow={focusFlow} bind:root={flows[selected]} />
    </div>
  {/key}
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
  .sidebar {
    background: var(--background);
    width: 100%;
    height: 90vh;
    border-radius: var(--border-radius);
    padding: var(--padding);
    grid-area: a;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .header {
    height: auto;
    padding-bottom: var(--padding);
  }
  .tabs {
    overflow-y: auto;
    height: 90vh;
    box-sizing: border-box;
  }
  .tabs > ul {
    padding-bottom: calc(var(--view-height) * 0.6);
  }

  .add-tab {
    display: flex;
    flex-wrap: wrap;
    gap: var(--padding);
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
    font-size: var(--font-size);
  }
  :global(:root) {
    --column-width: 140px;
    --padding: 8px;
    --title-height: 70px;
    --gap: 16px;
    --view-height: calc(90vh - var(--title-height) - var(--gap));
    --font-size: 0.9em;
    --font-family: Avenir, sans-serif;
    --border-radius: 12px;
    --border-radius-small: 6px;
    --br-height: 4px;
    --transition-speed: var(--transition-speed);
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
    --color-weak: hsl(0, 0%, 50%);
  }
  :global(body.dark) {
    --background-back: hsl(0 0% 10%);

    --background: hsl(0 0% 16%);
    --background-indent: hsl(0 0% 24%);
    --background-active: hsl(0 0% 30%);

    --background-secondary: hsl(0 0% 18%);
    --background-secondary-indent: hsl(0 0% 28%);
    --background-secondary-active: hsl(0 0% 32%);

    --background-accent: hsl(200 20% 20%);
    --background-accent-fade: hsl(205 10% 18%);

    --color: hsl(0 0% 80%);
    --color-weak: hsl(0, 0%, 40%);

    --accent: hsl(200, 50%, 42%);
    --accent-fade: hsl(205, 25%, 32%);
  }
</style>
