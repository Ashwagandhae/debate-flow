<script lang="ts">
  import Setting from './Setting.svelte';
  import Button from './Button.svelte';
  import { settings } from './settings';
  import { onDestroy } from 'svelte';

  export let closePopup: () => void;
  onDestroy(() => {
    settings.saveToLocalStorage();
  });

  let settingComponents = [];
  function scrollToSettingElement(index: number) {
    settingComponents[index].scrollToSelf();
  }
</script>

<div class="top palette-plain">
  <div class="outline">
    <ul>
      {#each Object.keys(settings.data) as key, index}
        <li>
          <button on:click={() => scrollToSettingElement(index)}>
            {settings.data[key].name}
          </button>
        </li>
      {/each}
    </ul>
  </div>
  <div class="content">
    <section class="controls">
      <Button
        icon="delete"
        text="reset all settings"
        on:click={() => settings.resetToAuto()}
      />
    </section>
    <section class="settings">
      <ul>
        {#each Object.keys(settings.data) as key, index}
          <Setting
            {key}
            setting={settings.data[key]}
            bind:this={settingComponents[index]}
          />
        {/each}
      </ul>
    </section>
  </div>
</div>

<style>
  .top {
    width: clamp(400px, 60vw, 2000px);
    height: clamp(400px, 80vh, 1000px);
    display: grid;
    grid-template-columns: calc(max(150px, 20%) + var(--padding-big)) 1fr;
  }
  .outline {
    width: 100%;
    padding: var(--padding-big);
    padding-top: calc(var(--button-size) + var(--padding));
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: var(--padding);
    background-color: var(--background-secondary);
    overflow: scroll;
  }
  .outline button {
    border: none;
    background: none;
    display: block;
    width: 100%;
    text-align: left;
    border-radius: var(--border-radius);
    color: var(--this-text);
    padding: var(--padding);
    overflow-wrap: break-word;
    transition: background var(--transition-speed);
    font-weight: var(--font-weight);
  }
  .outline button:hover {
    background-color: var(--this-background-indent);
  }
  .outline button:active {
    transition: none;
    background-color: var(--this-background-active);
  }

  .content {
    box-sizing: border-box;
    width: 100%;
    padding: calc(var(--button-size) + var(--padding)) 20% 0 20%;
    overflow: auto;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    gap: var(--padding-big);
    height: inherit;
  }
  section.controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--padding);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .content > .settings > ul {
    padding-bottom: 100%;
  }
</style>
