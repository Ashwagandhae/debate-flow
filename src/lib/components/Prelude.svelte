<script lang="ts">
	import Tutorial from './Tutorial.svelte';
	import SavedFlows from './SavedFlows.svelte';
	import { savedNodesDatas } from '$lib/models/autoSave';

	let showTutorial = false;
	$: savedFlowsExist = Object.keys($savedNodesDatas).length > 0;
</script>

{#if savedFlowsExist && !showTutorial}
	<SavedFlows savedFlowsDatas={$savedNodesDatas} bind:showTutorial />
{:else}
	<Tutorial bind:showTutorial {savedFlowsExist} />
{/if}
