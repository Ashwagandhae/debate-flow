<script lang="ts">
	export let reason: string;
</script>

<main>
	<div class="content">
		<h2>Close this tab</h2>
		<p>{reason}</p>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--background);
		padding: var(--padding-big);
		border-radius: var(--border-radius);
		width: min-content;
		gap: var(--padding-big);
	}
	h2 {
		font-size: 2rem;
		white-space: nowrap;
	}
	p {
		color: var(--text);
		margin: 0;
		white-space: nowrap;
	}
</style>
