<script lang="ts">
	import type { Doc } from '$lib/models/type';
	import Button from './Button.svelte';
	export let doc: Doc;

	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function dateToString(date: Date) {
		// get distance from today
		let distance = Math.abs(date.getTime() - new Date().getTime());
		// if more than 1 year away, show year + month
		if (distance > 365 * 24 * 60 * 60 * 1000) {
			return `${date.getFullYear()} ${months[date.getMonth()]}`;
		}
		// if more than 1 week away, show month + day
		if (distance > 7 * 24 * 60 * 60 * 1000) {
			return `${months[date.getMonth()]} ${date.getDate()}`;
		}
		// if more than 1 day away, show day of week
		if (distance > 24 * 60 * 60 * 1000) {
			return `${weekDays[date.getDay()]}`;
		}
		// if more than 1 hour away, show hour
		if (distance > 60 * 60 * 1000) {
			return `${date.getHours()}`;
		}
		// if more than 1 minute away, show minute
		if (distance > 60 * 1000) {
			return `${date.getMinutes()}`;
		}
		// if more than 1 second away, show second
		if (distance > 1000) {
			return `${date.getSeconds()}`;
		}
		// if less than 1 second away, show now
		return 'now';
	}
</script>

<div class="preview">
	<h2>{doc.name}</h2>
	<div class="info">
		<span>
			created {dateToString(new Date(doc.created))}
		</span>
		<span>
			expires {dateToString(new Date(doc.expire))}
		</span>
	</div>
	<div class="actions">
		<Button icon="copy" text="copy into new" on:click={() => {}} />
		<Button icon="trash" text="delete" on:click={() => {}} />
	</div>
</div>

<style>
	.preview {
		display: grid;
		grid-template-areas:
			'header actions'
			'info actions';
		grid-template-columns: 1fr min-content;
		width: 100%;
		height: 100%;
		padding: var(--padding);
		background-color: var(--background);
		border-radius: var(--border-radius);
	}
	h2 {
		grid-area: header;
		margin: 0;
	}
	.info {
		grid-area: info;
		display: flex;
		flex-direction: column;
		height: min-content;
	}
	.actions {
		grid-area: actions;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
</style>
