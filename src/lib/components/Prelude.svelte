<script lang="ts">
	import Tutorial from './Tutorial.svelte';
	import SavedFlows from './SavedFlows.svelte';
	import { savedFlowsDatas } from '$lib/models/autoSave';

	let showTutorial = false;
	$: savedFlowsExist = Object.keys($savedFlowsDatas).length > 0;
</script>

{#if savedFlowsExist && !showTutorial}
	<SavedFlows savedFlowsDatas={$savedFlowsDatas} bind:showTutorial />
{:else}
	<Tutorial bind:showTutorial {savedFlowsExist} />
{/if}
