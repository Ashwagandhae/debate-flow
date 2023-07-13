<script lang="ts">
	export let name: string;
	export let size: string = '1rem';
	let icons: { name: string; svg: string }[] = [
		{
			name: 'dots',
			svg: `<circle cx="26.25" cy="50.25" r="5.625" stroke-width="11.25"/>
<circle cx="71.25" cy="80.25" r="5.625" stroke-width="11.25"/>
<circle cx="71.25" cy="20.25" r="5.625" stroke-width="11.25"/>`
		},
		{
			name: 'arrowRight',
			svg: `<path d="M27 7L74 50L27 93" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'arrowLeft',
			svg: `<path d="M74 93L27 50L74 7" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'arrowUp',
			svg: `<path d="M7.5 73.5L50.5 26.5L93.5 73.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'arrowDown',
			svg: `<path d="M93.5 26.5L50.5 73.5L7.5 26.5" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'delete',
			svg: `<path d="M78.5685 22L22 78.5685" stroke-width="10" stroke-linecap="round"/>
<path d="M22 22L78.5685 78.5685" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'add',
			svg: `<path d="M50 15L50 85" stroke-width="10" stroke-linecap="round"/>
<path d="M15 50H85" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'download',
			svg: `<path d="M71 45L50 68L29 45" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 66L50 14" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'upload',
			svg: `<path d="M29 37L50 14L71 37" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 85L80 85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 16L50 68" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'addUp',
			svg: `<path d="M85 25V25C87.7614 25 90 27.2386 90 30V70C90 75.5228 85.5228 80 80 80H20C14.4772 80 10 75.5228 10 70L10 30C10 27.2386 12.2386 25 15 25V25" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M35 25H65" stroke-width="10" stroke-linecap="round"/>
<path d="M50 40V10" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'addDown',
			svg: `<path d="M15 75V75C12.2386 75 10 72.7614 10 70L10 30C10 24.4772 14.4772 20 20 20L80 20C85.5228 20 90 24.4772 90 30L90 70C90 72.7614 87.7614 75 85 75V75" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M65 75H35" stroke-width="10" stroke-linecap="round"/>
<path d="M50 60L50 90" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'addRight',
			svg: `<path d="M75 85V85C75 87.7614 72.7614 90 70 90H30C24.4772 90 20 85.5228 20 80V20C20 14.4772 24.4772 10 30 10H70C72.7614 10 75 12.2386 75 15V15" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M75 35V65" stroke-width="10" stroke-linecap="round"/>
<path d="M60 50H90" stroke-width="10" stroke-linecap="round"/>`
		},
		{
			name: 'undo',
			svg: `<path d="M10 47H70C81.0457 47 90 55.9543 90 67V77" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 70L10 47L36 24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'redo',
			svg: `<path d="M90 47H30C18.9543 47 10 55.9543 10 67V77" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M64 70L90 47L64 24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'settings',
			svg: `<line x1="10" y1="50" x2="90" y2="50" stroke-width="10" stroke-linecap="round"/>
<line x1="10" y1="80" x2="90" y2="80" stroke-width="10" stroke-linecap="round"/>
<line x1="10" y1="20" x2="90" y2="20" stroke-width="10" stroke-linecap="round"/>
<circle cx="26.25" cy="50.25" r="6.25" stroke-width="10"/>
<circle cx="71.25" cy="80.25" r="6.25" stroke-width="10"/>
<circle cx="71.25" cy="20.25" r="6.25" stroke-width="10"/>`
		},
		{
			name: 'check',
			svg: `<path d="M88.7817 29.2843L39.2842 78.7817L11 50.4975" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'home',
			svg: `<path d="M6 47L50 8L94 47" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M21 60L21 83C21 88.5228 25.4772 93 31 93H70C75.5228 93 80 88.5228 80 83V60" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`
		},
		{
			name: 'cross',
			svg: `<path d="M78.5686 22L22.0001 78.5685" stroke-width="10" stroke-linecap="round"/>
<circle cx="50" cy="50" r="40" stroke-width="10"/>`
		}
	];
	let displayIcon: { name: string; svg: string } | null;
	function findIcon() {
		displayIcon = icons.find((icon: { name: string; svg: string }) => icon.name === name) ?? null;
	}
	findIcon();
	$: name, findIcon();
</script>

<svg
	style={`width:${size};height:${size};`}
	viewBox="0 0 {100} {100}"
	fill="none"
	stroke="var(--text)"
>
	{@html displayIcon?.svg ?? icons[0].svg}
</svg>

<style>
	svg {
		display: block;
		margin: auto;
		stroke: currentColor;
	}
</style>
