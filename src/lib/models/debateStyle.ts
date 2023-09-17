import type { TimerSpeech } from './timer';

export type DebateStyle = {
	primary: {
		name: string;
		columns: string[];
		columnsSwitch?: string[];
		invert: boolean;
		starterBoxes?: string[];
	};
	secondary?: {
		name: string;
		columns: string[];
		columnsSwitch?: string[];
		invert: boolean;
		starterBoxes?: string[];
	};
	timerSpeeches: TimerSpeech[];
	prepTime?: number;
};
export const debateStyles: {
	[key in DebateStyleKey]: DebateStyle;
} = {
	policy: {
		primary: {
			name: 'aff',
			columns: ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
			invert: false
		},
		secondary: {
			name: 'neg',
			columns: ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
			invert: true
		},
		timerSpeeches: [
			{
				name: '1AC',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: '1NC',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: '2AC',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: '2NC',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: '1NR',
				time: 5 * 60 * 1000,
				secondary: true
			},
			{
				name: '1AR',
				time: 5 * 60 * 1000,
				secondary: false
			},
			{
				name: '2NR',
				time: 5 * 60 * 1000,
				secondary: true
			},
			{
				name: '2AR',
				time: 5 * 60 * 1000,
				secondary: false
			}
		],
		prepTime: 8 * 60 * 1000
	},
	publicForum: {
		primary: {
			name: 'aff',
			columns: ['AC', 'NC', 'AR', 'NR', 'AS', 'NS', 'AFF', 'NFF'],
			columnsSwitch: ['AC', 'NR', 'AR', 'NS', 'AS', 'NFF', 'AFF'],
			invert: false
		},
		secondary: {
			name: 'neg',
			columns: ['NC', 'AR', 'NR', 'AS', 'NS', 'AFF', 'NFF'],
			columnsSwitch: ['NC', 'AC', 'NR', 'AR', 'NS', 'AS', 'NFF', 'AFF'],
			invert: true
		},
		timerSpeeches: [
			{
				name: 'AC',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NC',
				time: 4 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'AR',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NR',
				time: 4 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'AS',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NS',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: 'GCX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'AFF',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NFF',
				time: 2 * 60 * 1000,
				secondary: true
			}
		],
		prepTime: 4 * 60 * 1000
	},
	lincolnDouglas: {
		primary: {
			name: 'aff',
			columns: ['AC', 'NC', '1AR', 'NR', '2AR'],
			starterBoxes: ['value', 'criterion'],
			invert: false
		},
		secondary: {
			name: 'neg',
			columns: ['NC', '1AR', 'NR', '2AR'],
			starterBoxes: ['value', 'criterion'],
			invert: true
		},
		timerSpeeches: [
			{
				name: 'AC',
				time: 6 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NC',
				time: 7 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: '1AR',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NR',
				time: 6 * 60 * 1000,
				secondary: true
			},
			{
				name: '2AR',
				time: 3 * 60 * 1000,
				secondary: false
			}
		],
		prepTime: 4 * 60 * 1000
	},
	congress: {
		primary: {
			name: 'bill',
			columns: ['1A', 'Q/1N', 'Q/2A', 'Q/2N', 'Q/3A', 'Q/3N', 'Q/4A', 'Q/4N', 'Q/5A', 'Q/5N'],
			invert: false
		},
		timerSpeeches: [
			{
				name: 'speech',
				time: 3 * 60 * 1000,
				secondary: false
			}
		]
	}
};
export const debateStyleMap: DebateStyleKey[] = [
	'policy',
	'publicForum',
	'lincolnDouglas',
	'congress'
];

export type DebateStyleKey = 'policy' | 'publicForum' | 'lincolnDouglas' | 'congress';
