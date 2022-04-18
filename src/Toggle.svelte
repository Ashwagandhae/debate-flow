<script lang="ts">
  export let value: number = 1;
  export let auto: number = 1;

  let palette: string;
  $: if (value) {
    if (value == auto) {
      palette = 'accent-secondary';
    } else {
      palette = 'accent';
    }
  } else {
    palette = 'plain';
  }
  let booleanValue = value ? true : false;
  $: value = booleanValue ? 1 : 0;
</script>

<label class={`palette-${palette}`}>
  <input type="checkbox" bind:checked={booleanValue} />
  <div class="background">
    <div class="switch" />
  </div>
</label>

<style>
  label {
    margin-left: auto;
  }
  input {
    display: none;
  }
  .background {
    position: relative;
    box-sizing: content-box;
    padding: var(--padding-small);
    width: calc(var(--button-size) * 2);
    height: var(--button-size);
    background-color: var(--this-background-indent);
    border-radius: var(--border-radius);
    transition: background var(--transition-speed);
  }
  .background:hover {
    background-color: var(--this-background-active);
  }
  .switch {
    position: absolute;
    display: flex;
    flex-direction: row;
    align-items: center;

    box-sizing: content-box;
    padding: calc(var(--padding-small) - var(--padding-small));
    width: var(--button-size);
    height: var(--button-size);
    left: var(--padding-small);
    top: var(--padding-small);

    border: none;
    background-color: var(--this-color);
    color: var(--this-text);
    border-radius: var(--border-radius);
    transition: background var(--transition-speed), left var(--transition-speed),
      color var(--transition-speed);
  }
  input:checked + .background > .switch {
    left: calc(var(--button-size) + var(--padding-small));
  }
</style>
