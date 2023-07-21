<script lang="ts">
	import TextInput from '$lib/components/TextInput.svelte';
</script>

<div class="top">
	<div class="enter">
		<h1>Create Account</h1>
		<TextInput placeholder="username" type="username" />
		<TextInput placeholder="password" type="password" />
	</div>
</div>

<style>
	.top {
		background: var(--background);
		padding: var(--padding-big);
		border-radius: var(--border-radius);
		display: flex;
		flex-direction: column;
		height: 100%;
		box-sizing: border-box;
		width: 100%;
		align-items: center;
	}
	.enter {
		width: min(100%, 20rem);
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}
</style>
