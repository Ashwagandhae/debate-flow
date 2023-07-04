<script lang="ts">
	export let link: string | null = null;
</script>

{#if link}
	<a href={link}>
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
