<script lang="ts">
  import Flow from './Flow.svelte';
  import Title from './Title.svelte';
  import BoxControl from './BoxControl.svelte';
  import Button from './Button.svelte';
  import ButtonBar from './ButtonBar.svelte';
  import Popup from './Popup.svelte';
  import Downloader from './Downloader.svelte';
  import Uploader from './Uploader.svelte';
  import Tab from './Tab.svelte';
  import AddTab from './AddTab.svelte';
  import { speed } from './transition';
  import { fade } from 'svelte/transition';
  import { flows, selected, boxFromPath, newFlow, History } from './stores';

  let dark: number = 1;
  $: {
    if (dark) {
      window.document.body.classList.add('dark');
    }
  }

  function clickTab(index: number) {
    $selected = index;
    focusFlow();
  }
  function focusFlow() {
    let lastFocus =
      $flows[$selected]?.lastFocus && boxFromPath($flows[$selected]?.lastFocus);
    if (lastFocus) {
      lastFocus.focus = true;
    } else {
      $flows[$selected].children[0].focus = true;
    }
    $flows = $flows;
  }
  function blurFlow() {
    let lastFocus =
      $flows[$selected]?.lastFocus && boxFromPath($flows[$selected]?.lastFocus);
    if (lastFocus) {
      lastFocus.focus = false;
    }
  }
  function addFlow(type: string) {
    blurFlow();
    $flows.push(newFlow($flows.length, type));
    $selected = $flows.length - 1;
    $flows = $flows;
  }
  function handleKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key == 'N') {
      e.preventDefault();
      addFlow('aff');
    } else if (e.ctrlKey && e.key == 'n') {
      e.preventDefault();
      addFlow('neg');
    }
    if (e.metaKey && e.shiftKey && e.key == 'z') {
      e.preventDefault();
      $flows[$selected].history.redo();
    } else if (e.metaKey && e.key == 'z') {
      e.preventDefault();
      $flows[$selected].history.undo();
    }
  }

  function readUploadDragged(e: DragEvent) {
    e.preventDefault();
    let file = e.dataTransfer.files[0];

    let reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  }
  function readUpload() {
    let file = (<HTMLInputElement>document.getElementById('uploadId')).files[0];

    let reader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  }
  function preventDefault(e: { preventDefault: () => void }) {
    e.preventDefault();
  }

  function handleUpload(data) {
    let rawFlows = JSON.parse(data);
    $flows = [];
    for (let flow of rawFlows) {
      flow.history = new History();
      // add to flows
      $flows.push(flow);
    }
  }

  window.addEventListener(
    'dragover',
    function (e) {
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    'drop',
    function (e) {
      e.preventDefault();
    },
    false
  );

  let popups = [];
  function closePopup(index) {
    popups.splice(index, 1);
    popups = popups;
  }
  function openPopup(component) {
    popups.push(component);
    popups = popups;
  }
</script>

<svelte:body
  on:keydown={handleKeydown}
  on:dragenter={preventDefault}
  on:drop={readUploadDragged} />
{#if popups.length > 0}
  <div
    class="screen"
    on:click|self={() => {
      popups.length == 1 && closePopup(0);
    }}
    transition:fade={{ duration: speed }}
  >
    <div
      class="popups"
      on:click|self={() => {
        popups.length == 1 && closePopup(0);
      }}
    >
      {#each popups as popup, index}
        <Popup component={popup} closeSelf={() => closePopup(index)} />
      {/each}
    </div>
  </div>
{/if}
<input id="uploadId" type="file" hidden on:change={readUpload} />
<main class="palette-plain" style={`--transition-speed: ${speed}ms;`}>
  <div class="sidebar">
    <div class="header">
      <ButtonBar>
        <Button icon="settings" tooltip="settings" />
        <Button
          icon="download"
          on:click={() => openPopup(Downloader)}
          disabled={$flows.length == 0}
          disabledReason={'nothing to download'}
          tooltip="download as file"
        />
        <Button
          icon="upload"
          on:click={() => openPopup(Uploader)}
          tooltip="import file"
        />
      </ButtonBar>
    </div>
    <div class="tabs">
      <ul>
        {#each $flows as flow, index}
          <Tab
            on:click={() => clickTab(index)}
            bind:flow={$flows[index]}
            selected={index == $selected}
          />
        {/each}
        <div class="add-tab">
          <Button
            text="on case"
            palette="accent"
            icon="add"
            on:click={() => addFlow('aff')}
            tooltip="create new oncase flow"
          />
          <Button
            text="off case"
            palette="accent-secondary"
            icon="add"
            on:click={() => addFlow('neg')}
            tooltip="create new offcase flow"
          />
        </div>
      </ul>
    </div>
  </div>
  {#if $flows.length > 0}
    <div class="title">
      <Title
        bind:content={$flows[$selected].content}
        bind:children={$flows[$selected].children}
        bind:index={$flows[$selected].index}
        bind:focus={$flows[$selected].focus}
        bind:invert={$flows[$selected].invert}
      />
    </div>
    <div class="box-control">
      <BoxControl bind:flow={$flows[$selected]} />
    </div>
    {#key $selected}
      <div class="flow">
        <Flow on:focusFlow={focusFlow} bind:root={$flows[$selected]} />
      </div>
    {/key}
  {/if}
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

  :global(body) {
    padding: 0;
    margin: 0;
  }
  :global(input),
  :global(button),
  :global(select),
  :global(textarea) {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
  }
  main {
    display: grid;
    gap: var(--gap);
    grid-template-areas:
      'sidebar title box-control'
      'sidebar flow flow';
    grid-template-columns: max(150px, 15%) 1fr auto;
    padding: var(--main-margin);
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  main > div {
    box-shadow: var(--box-shadow);
  }
  ul {
    padding: 0;
    margin: 0;
  }
  .sidebar {
    background: var(--background);
    width: 100%;
    height: var(--main-height);
    border-radius: var(--border-radius);
    padding: var(--padding);
    grid-area: sidebar;
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
    height: var(--main-height);
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
    grid-area: title;
    height: var(--title-height);
  }
  .box-control {
    background: var(--background);
    border-radius: var(--border-radius);
    width: 100%;
    grid-area: box-control;
    height: var(--title-height);
  }
  .flow {
    width: 100%;
    overflow-x: auto;
    background: var(--background);
    z-index: 0;
    border-radius: var(--border-radius);
    grid-area: flow;
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
  .screen {
    background-color: var(--color-screen);
    width: 100vw;
    height: 100vh;
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }
  .popups {
    width: 100vw;
    height: min-content;
    display: grid;
    gap: var(--gap);
    grid-template-columns: auto auto auto;
    grid-template-rows: auto;
    align-items: center;
    justify-content: center;
  }
  :global(h1) {
    font-weight: var(--font-weight);
    font-size: 1.4em;
    margin: 0;
  }
  :global(body) {
    --this-text: var(--text);
    background: var(--background-back);
    color: var(--this-text);
    font-family: var(--font-family);
    font-size: var(--font-size);
    font-weight: var(--font-weight);
  }
  :global(:root) {
    --main-margin: 20px;
    --main-height: calc(100vh - var(--main-margin) * 2);
    --column-width: 160px;
    --padding-small: 4px;
    --padding: 8px;
    --padding-big: 16px;
    --title-height: calc(35px + var(--padding) * 2);
    --gap: 12px;
    --view-height: calc(var(--main-height) - var(--title-height) - var(--gap));
    --font-size: 0.9em;
    --font-weight: 300;
    --font-weight-bold: 700;
    --font-family: 'Merriweather Sans', sans-serif;
    --border-radius: 12px;
    --border-radius-small: 6px;
    --button-size: 20px;
    --br-height: 4px;
    --transition-speed: var(--transition-speed);
  }
  /* background text color 
  accent
  secondary
  back indent active fade weak */
  :global(body) {
    --background-back: hsl(0 0% 100%);

    --background: hsl(0 0% 100%);
    --background-indent: hsl(0 0% 92%);
    --background-active: hsl(0 0% 84%);

    --background-secondary: hsl(0 0% 97%);
    --background-secondary-indent: hsl(0 0% 89%);
    --background-secondary-active: hsl(0 0% 81%);

    --background-accent-indent: hsl(192 80% 95%);
    --background-accent-active: hsl(192 80% 90%);

    --background-accent-secondary-indent: hsl(26 80% 95%);
    --background-accent-secondary-active: hsl(26 80% 90%);

    --text: hsl(0 0% 30%);
    --text-select: hsl(0, 0%, 100%, 80%);
    --text-weak: hsl(0, 0%, 70%);

    --text-accent: hsl(192, 80%, 30%);
    --text-accent-select: hsl(192, 100%, 60%, 30%);
    --text-accent-weak: hsl(192, 30%, 70%);

    --text-accent-secondary: hsl(26, 80%, 30%);
    --text-accent-secondary-select: hsl(26, 100%, 60%, 30%);
    --text-accent-secondary-weak: hsl(26, 30%, 70%);

    --color: hsl(0 0% 80%);
    --color-fade: hsl(0 0% 90%);

    --color-accent: hsl(192, 60%, 80%);
    --color-accent-fade: hsl(192, 70%, 90%);

    --color-accent-secondary: hsl(26, 60%, 80%);
    --color-accent-secondary-fade: hsl(26, 70%, 90%);

    --screen-color: hsl(0 0% 0%/ 0.3);
    --box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 12px;
  }
  :global(body.dark) {
    --background-back: hsl(0 0% 10%);

    --background: hsl(0 0% 16%);
    --background-indent: hsl(0 0% 24%);
    --background-active: hsl(0 0% 30%);

    --background-secondary: hsl(0 0% 18%);
    --background-secondary-indent: hsl(0 0% 28%);
    --background-secondary-active: hsl(0 0% 32%);

    --background-accent-indent: hsl(192 10% 24%);
    --background-accent-active: hsl(192 20% 30%);

    --background-accent-secondary-indent: hsl(26 10% 24%);
    --background-accent-secondary-active: hsl(26 20% 30%);

    --text: hsl(0, 0%, 80%);
    --text-select: hsl(0, 0%, 100%, 30%);
    --text-weak: hsl(0, 0%, 50%);

    --text-accent: hsl(192, 60%, 80%);
    --text-accent-select: hsl(192, 80%, 60%, 30%);
    --text-accent-weak: hsl(192, 15%, 50%);

    --text-accent-secondary: hsl(26, 60%, 80%);
    --text-accent-secondary-select: hsl(26, 80%, 60%, 30%);
    --text-accent-secondary-weak: hsl(26, 15%, 50%);

    --color-accent: hsl(192, 40%, 42%);
    --color-accent-fade: hsl(192, 25%, 32%);

    --color-accent-secondary: hsl(26, 40%, 42%);
    --color-accent-secondary-fade: hsl(26, 25%, 32%);

    --color-screen: hsl(0 0% 0%/ 0.4);
    --box-shadow: none;
  }
  :global(.palette-plain) {
    --this-background: var(--background);
    --this-background-indent: var(--background-indent);
    --this-background-active: var(--background-active);
    --this-text: var(--text);
    --this-text-weak: var(--text-weak);
    --this-text-select: var(--text-select);
    --this-color: var(--color);
    --this-color-fade: var(--color-fade);
  }
  :global(.palette-plain-secondary) {
    --this-background: var(--background-secondary);
    --this-background-indent: var(--background-secondary-indent);
    --this-background-active: var(--background-secondary-active);
    --this-text: var(--text);
    --this-text-weak: var(--text-weak);
    --this-text-select: var(--text-select);
  }
  :global(.palette-accent) {
    --this-background: var(--background);
    --this-background-indent: var(--background-accent-indent);
    --this-background-active: var(--background-accent-active);
    --this-text: var(--text-accent);
    --this-text-weak: var(--text-accent-weak);
    --this-text-select: var(--text-accent-select);
    --this-color: var(--color-accent);
    --this-color-fade: var(--color-accent-fade);
  }
  :global(.palette-accent-secondary) {
    --this-background: var(--background-secondary);
    --this-background-indent: var(--background-accent-secondary-indent);
    --this-background-active: var(--background-accent-secondary-active);
    --this-text: var(--text-accent-secondary);
    --this-text-weak: var(--text-accent-secondary-weak);
    --this-text-select: var(--text-accent-secondary-select);
    --this-color: var(--color-accent-secondary);
    --this-color-fade: var(--color-accent-secondary-fade);
  }
  :global(.palette-disabled) {
    --this-background-indent: var(--background);
    --this-background-active: var(--background);
    --this-text: var(--text-weak);
  }
</style>
