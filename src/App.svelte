<script lang="ts">
  import Flow from './Flow.svelte';
  import Title from './Title.svelte';
  import BoxControl from './BoxControl.svelte';
  import Button from './Button.svelte';
  import ButtonBar from './ButtonBar.svelte';
  import Popup from './Popup.svelte';
  import Downloader from './Downloader.svelte';
  import Uploader from './Uploader.svelte';
  import Settings from './Settings.svelte';
  import Tab from './Tab.svelte';
  import { screenTransition } from './transition';
  import { onDestroy, tick } from 'svelte';
  import {
    activeMouse,
    flows,
    selected,
    boxFromPath,
    newFlow,
    History,
    changesSaved,
  } from './stores';
  import { settings } from './settings';

  let colorThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function updateColorTheme() {
    if (settings.data.colorTheme.value == 0) {
      document.body.classList.toggle('dark', colorThemeMediaQuery.matches);
    }
  }
  // listen for changes in system settings
  colorThemeMediaQuery.addEventListener('change', updateColorTheme);
  // listen for changes in color theme setting, and unsubscribe onDestroy
  onDestroy(
    settings.subscribe(['colorTheme'], function (key: string) {
      if (settings.data.colorTheme.value == 1) {
        document.body.classList.remove('dark');
      } else if (settings.data.colorTheme.value == 2) {
        document.body.classList.add('dark');
      } else {
        updateColorTheme();
      }
    })
  );
  // listen for changes in cssVariables setting group, and unsubscribe onDestroy
  let cssVarIndex: { [key: string]: { name: string; unit: string } } = {
    accentHue: {
      name: 'accent-hue',
      unit: '',
    },
    accentSecondaryHue: {
      name: 'accent-secondary-hue',
      unit: '',
    },
    transitionSpeed: {
      name: 'transition-speed',
      unit: 'ms',
    },
    columnWidth: {
      name: 'column-width',
      unit: 'px',
    },
    borderRadius: {
      name: 'border-radius',
      unit: 'px',
    },
    padding: {
      name: 'padding',
      unit: 'px',
    },
    fontSize: {
      name: 'font-size',
      unit: 'rem',
    },
    fontWeight: {
      name: 'font-weight',
      unit: '',
    },
    gap: {
      name: 'gap',
      unit: 'px',
    },
  };
  onDestroy(
    settings.subscribe(Object.keys(cssVarIndex), function (key: string) {
      let name = cssVarIndex[key].name;
      let value = settings.data[key].value;
      let unit = cssVarIndex[key].unit;
      document.body.style.setProperty(`--${name}`, `${value}${unit}`);
    })
  );
  onDestroy(
    settings.subscribe(['fontFamily'], function (key: string) {
      let setting = settings.data.fontFamily;
      if (setting.type != 'radio') return;
      let index = setting.value;
      let chosenFont: string;
      if (
        setting.detail.customOption &&
        setting.detail.options.length == index
      ) {
        chosenFont = setting.detail.customOptionValue;
      } else if (setting.detail.options[index]) {
        chosenFont = setting.detail.options[index];
      }
      if (chosenFont) {
        document.body.style.setProperty(
          '--font-family',
          `'${chosenFont}', 'Merriweather Sans', sans-serif`
        );
      } else {
        document.body.style.setProperty(
          '--font-family',
          `'Merriweather Sans', sans-serif`
        );
      }
    })
  );

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
      $flows[$selected].focus = true;
    }
    $flows = $flows;
  }
  function blurFlow() {
    if ($flows.length > 0) {
      let lastFocus =
        $flows[$selected]?.lastFocus &&
        boxFromPath($flows[$selected]?.lastFocus);
      if (!lastFocus) {
        lastFocus = $flows[$selected];
      }
      lastFocus.focus = false;
      lastFocus = lastFocus;
      (document.activeElement as HTMLElement).blur();
    }
  }
  function addFlow(type: string) {
    blurFlow();
    $flows.push(newFlow($flows.length, type));
    $selected = $flows.length - 1;
    $flows = $flows;
  }
  async function deleteFlow(index: number) {
    blurFlow();
    $flows.splice(index, 1);
    if (index == 0) {
      $selected = 0;
    } else {
      $selected = index - 1;
    }
    $flows = $flows;
    if ($flows.length > 0) {
      focusFlow();
    }
  }
  function handleMouseMove(e: MouseEvent) {
    $activeMouse = true;
  }
  function handleKeydown(e: KeyboardEvent) {
    $activeMouse = false;
    if (e.ctrlKey && e.shiftKey && e.key == 'N') {
      e.preventDefault();
      addFlow('neg');
    } else if (e.ctrlKey && e.key == 'n') {
      e.preventDefault();
      addFlow('aff');
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

    let reader: FileReader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result.toString());
    };
    reader.readAsText(file, 'UTF-8');
  }
  function readUpload() {
    let file = (<HTMLInputElement>document.getElementById('uploadId')).files[0];

    let reader: FileReader = new FileReader();
    reader.onload = function (fileLoadedEvent) {
      handleUpload(fileLoadedEvent.target.result.toString());
    };
    reader.readAsText(file, 'UTF-8');
  }
  function preventDefault(e: { preventDefault: () => void }) {
    e.preventDefault();
  }

  function handleUpload(data: string) {
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

  let popups: (Uploader | Downloader | Settings)[] = [];
  function closePopup(index: number) {
    popups.splice(index, 1);
    popups = popups;
  }
  function openPopup(component: any) {
    popups.push(component);
    popups = popups;
  }
  // changes you made may not be saved
  window.addEventListener('beforeunload', function (e) {
    if ($flows.length > 0 && !$changesSaved) {
      let confirmationMessage = 'Are you sure you want to leave?';
      (e || window.event).returnValue = confirmationMessage; // Gecko + IE
      return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
    }
  });
  // todos:
  // add set up
  // add temp hide settings button
  // add command f
  // add capitalization
  // add settings shortcut (cmd ,)
</script>

<svelte:body
  on:keydown={handleKeydown}
  on:mousemove={handleMouseMove}
  on:dragenter={preventDefault}
  on:drop={readUploadDragged} />
<main class:activeMouse class="palette-plain">
  {#if popups.length > 0}
    <div
      class="screen"
      on:click|self={() => {
        closePopup(0);
      }}
      transition:screenTransition
    >
      <div
        class="popups"
        on:click|self={() => {
          closePopup(0);
        }}
      >
        {#key popups}
          <Popup component={popups[0]} closeSelf={() => closePopup(0)} />
        {/key}
      </div>
    </div>
  {/if}
  <input id="uploadId" type="file" hidden on:change={readUpload} />
  <div class="grid">
    <div class="sidebar">
      <div class="header">
        <ButtonBar>
          <Button
            icon="settings"
            on:click={() => openPopup(Settings)}
            tooltip="settings"
          />
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
              text="aff"
              palette="accent"
              icon="add"
              on:click={() => addFlow('aff')}
              tooltip="create new aff flow"
              shortcut={['control', 'n']}
            />
            <Button
              text="neg"
              palette="accent-secondary"
              icon="add"
              on:click={() => addFlow('neg')}
              tooltip="create new neg flow"
              shortcut={['control', 'shift', 'n']}
            />
          </div>
        </ul>
      </div>
    </div>
    {#if $flows.length > 0 && $flows[$selected]}
      {#key $selected}
        <div class="title">
          <Title
            bind:content={$flows[$selected].content}
            bind:children={$flows[$selected].children}
            bind:index={$flows[$selected].index}
            bind:focus={$flows[$selected].focus}
            bind:invert={$flows[$selected].invert}
            deleteSelf={() => deleteFlow($selected)}
          />
        </div>
        <div class="box-control">
          <BoxControl bind:flow={$flows[$selected]} />
        </div>
        <div class="flow">
          <Flow on:focusFlow={focusFlow} bind:root={$flows[$selected]} />
        </div>
      {/key}
    {/if}
  </div>
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
  .grid {
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
    /* flex-wrap: wrap; */
    /* justify-content: center; */
    align-items: stretch;
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(h1) {
    font-weight: var(--font-weight);
    font-size: 1.5em;
    margin: 0;
  }
  :global(h2) {
    font-weight: var(--font-weight);
    font-size: 1.2em;
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
  :global(body) {
    --main-margin: 20px;
    --main-height: calc(100vh - var(--main-margin) * 2);
    --column-width: 160px;
    --padding: 8px;
    --padding-small: calc(var(--padding) / 2);
    --padding-big: calc(var(--padding) * 2);
    --title-height: calc(35px + var(--padding) * 2);
    --view-height: calc(var(--main-height) - var(--title-height) - var(--gap));
    --font-size: 0.9rem;
    --font-weight-bold: 700;
    --font-family: 'Merriweather Sans', sans-serif;
    --font-weight: 300;
    --border-radius: 12px;
    --border-radius-small: calc(var(--border-radius) / 2);
    --button-size: 20px;
    --gap: 12px;
    --line-width: 4px;
  }
  /* background text color 
  accent
  secondary
  back indent active fade weak */
  :global(body) {
    --background-back: hsl(0, 0%, 95%);

    --background: hsl(0, 0%, 100%);
    --background-indent: hsl(0 0% 92%);
    --background-active: hsl(0 0% 84%);

    --background-secondary: hsl(0 0% 98%);
    --background-secondary-indent: hsl(0 0% 89%);
    --background-secondary-active: hsl(0 0% 81%);

    --background-accent-indent: hsl(var(--accent-hue) 60% 92%);
    --background-accent-active: hsl(var(--accent-hue) 70% 86%);

    --background-accent-secondary-indent: hsl(
      var(--accent-secondary-hue),
      60%,
      92%
    );
    --background-accent-secondary-active: hsl(
      var(--accent-secondary-hue),
      70%,
      86%
    );

    --text: hsl(0 0% 30%);
    --text-select: hsl(0, 0%, 100%, 80%);
    --text-weak: hsl(0, 0%, 70%);

    --text-accent: hsl(var(--accent-hue), 90%, 30%);
    --text-accent-select: hsl(var(--accent-hue), 100%, 60%, 30%);
    --text-accent-weak: hsl(var(--accent-hue), 30%, 70%);

    --text-accent-secondary: hsl(var(--accent-secondary-hue), 90%, 30%);
    --text-accent-secondary-select: hsl(
      var(--accent-secondary-hue),
      100%,
      60%,
      30%
    );
    --text-accent-secondary-weak: hsl(var(--accent-secondary-hue), 30%, 70%);

    --color: hsl(0 0% 70%);
    --color-fade: hsl(0 0% 85%);

    --color-accent: hsl(var(--accent-hue), 80%, 70%);
    --color-accent-fade: hsl(var(--accent-hue), 90%, 85%);

    --color-accent-secondary: hsl(var(--accent-secondary-hue), 80%, 70%);
    --color-accent-secondary-fade: hsl(var(--accent-secondary-hue), 90%, 85%);

    --slider-lightness: 90%;
    --slider-lightness-hover: 85%;
    --slider-saturation: 80%;
    --slider-switch-lightness: 70%;

    --color-screen: hsl(0 0% 0%/ 0.3);
  }
  :global(body.dark) {
    --background-back: hsl(0 0% 10%);

    --background: hsl(0 0% 16%);
    --background-indent: hsl(0 0% 24%);
    --background-active: hsl(0 0% 30%);

    --background-secondary: hsl(0 0% 18%);
    --background-secondary-indent: hsl(0 0% 28%);
    --background-secondary-active: hsl(0 0% 32%);

    --background-accent-indent: hsl(var(--accent-hue) 10% 24%);
    --background-accent-active: hsl(var(--accent-hue) 20% 30%);

    --background-accent-secondary-indent: hsl(
      var(--accent-secondary-hue) 10% 24%
    );
    --background-accent-secondary-active: hsl(
      var(--accent-secondary-hue) 20% 30%
    );

    --text: hsl(0, 0%, 80%);
    --text-select: hsl(0, 0%, 100%, 30%);
    --text-weak: hsl(0, 0%, 50%);

    --text-accent: hsl(var(--accent-hue), 60%, 80%);
    --text-accent-select: hsl(var(--accent-hue), 80%, 60%, 30%);
    --text-accent-weak: hsl(var(--accent-hue), 15%, 50%);

    --text-accent-secondary: hsl(var(--accent-secondary-hue), 60%, 80%);
    --text-accent-secondary-select: hsl(
      var(--accent-secondary-hue),
      80%,
      60%,
      30%
    );
    --text-accent-secondary-weak: hsl(var(--accent-secondary-hue), 15%, 50%);

    --color: hsl(0, 0%, 42%);
    --color-fade: hsl(0, 0%, 32%);

    --color-accent: hsl(var(--accent-hue), 40%, 42%);
    --color-accent-fade: hsl(var(--accent-hue), 25%, 32%);

    --color-accent-secondary: hsl(var(--accent-secondary-hue), 40%, 42%);
    --color-accent-secondary-fade: hsl(var(--accent-secondary-hue), 25%, 32%);

    --slider-lightness: 24%;
    --slider-lightness-hover: 30%;
    --slider-saturation: 20%;
    --slider-switch-lightness: 42%;

    --color-screen: hsl(0 0% 0%/ 0.4);
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
    --this-color: var(--color-fade);
    --this-text: var(--text-weak);
  }
</style>
