<script lang="ts">
  import Icon from './Icon.svelte';
  export let name: string;
  export let value: number;
  export let auto: number;
  export let detail: { options: string[] };

  $: palette = auto == value ? 'accent-secondary' : 'accent';
</script>

<div class={`top palette-${palette}`}>
  <div class="background">
    <div
      class="switch"
      style={`--pos:calc(${value} * (var(--button-size) + var(--padding) * 2) + var(--padding-small))`}
    >
      <!-- <Icon name="among" /> -->
    </div>
  </div>
  <ul>
    {#each detail.options as option, index}
      <label>
        <input
          type="radio"
          bind:group={value}
          {name}
          checked={index == value}
          value={index}
        />
        <li>
          <p>
            {option}
          </p>
          {#if index == auto}
            <p class="default">default</p>
          {/if}
        </li>
      </label>
    {/each}
  </ul>
</div>

<style>
  .top {
    display: flex;
    flex-direction: row;
    position: relative;
  }
  .background {
    position: relative;
    box-sizing: content-box;
    padding: var(--padding-small);
    width: var(--button-size);
    height: auto;
    background-color: var(--this-background-indent);
    border-radius: var(--border-radius);
    transition: background var(--transition-speed);
    margin: calc(var(--padding-small)) 0;
  }
  .top:hover > .background {
    background-color: var(--this-background-active);
  }
  .switch {
    position: absolute;

    box-sizing: content-box;
    padding: calc(var(--padding-small) - var(--padding-small));
    width: var(--button-size);
    height: var(--button-size);
    left: var(--padding-small);
    top: var(--pos);

    border: none;
    background-color: var(--this-color);
    color: var(--this-text);
    border-radius: var(--border-radius);
    transition: background var(--transition-speed), top var(--transition-speed),
      color var(--transition-speed);
  }

  ul {
    list-style: none;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    width: calc(100% - var(--button-size) - var(--padding));
    display: block;
  }
  label {
    position: relative;
    height: calc(var(--button-size) + var(--padding) * 2);
    margin-left: calc(-1 * (var(--button-size) + var(--padding)));
    display: block;
    padding-right: var(--padding);
    padding-left: calc(var(--button-size) + var(--padding) * 2);
    font-size: inherit;
    z-index: 2;
  }
  p {
    margin: 0;
  }

  label > li {
    display: flex;
    flex-direction: row;
    padding: var(--padding);
    border-radius: var(--border-radius);
  }
  label:hover > li {
    background-color: var(--this-background-indent);
  }
  label:active > li {
    background-color: var(--this-background-active);
    color: var(--this-text);
  }
  input {
    display: none;
  }
  input:checked + li {
    color: var(--this-text);
  }
  .default {
    opacity: 0;
    margin-left: auto;
    color: var(--this-text-weak);
    transition: opacity var(--transition-speed);
  }
  li:hover > .default {
    opacity: 1;
  }
</style>
