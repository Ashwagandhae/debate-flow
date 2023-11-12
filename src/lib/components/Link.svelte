<script lang="ts">
	export let link: string | null = null;
	export let target: string | null = null;
</script>

{#if link}
	<a href={link} {target}>
		<slot />
	</a>
{:else}
	<slot />
{/if}

<style>
	a {
		display: block;
		color: inherit;
		text-decoration: none;
	}
</style>
