<script>
  export let background;
</script>

<div class="top" style={`--this-background-color:${background}`} />

<style>
  .top {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: var(--this-background-color);
    z-index: 300;
    transition: background var(--transition-speed);
  }
</style>
