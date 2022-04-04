<script lang="ts">
  export let column: string;
</script>

<div class="top">
  {column}
</div>

<style>
  .top {
    width: var(--column-width);
    height: 100%;
    padding: var(--padding);
    text-align: center;
    box-sizing: border-box;
    user-select: none;
  }
</style>
