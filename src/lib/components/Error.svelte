<script lang="ts">
	export const closePopup = () => {};
	export let message: string = '';
</script>

<div class="top">
	<p><strong>Error:</strong> {message}</p>
</div>

<style>
	.top {
		padding: var(--padding-big);
		padding-top: calc(var(--button-size) + var(--padding));
		width: clamp(300px, 20vw, 400px);
		height: min-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--padding-big);
		color: var(--text-error);
	}
	p {
		margin: 0;
	}
</style>
