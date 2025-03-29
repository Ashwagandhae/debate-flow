import { settings } from './settings';
import type { TimerSpeech } from './timer';

export const debateStyleMap = [
	'policy',
	'publicForum',
	'lincolnDouglas',
	'congress',
	'worldSchools',
	'bigQuestions',
	'nofSpar',
	'parli',
	'classic'
] as const;

export type DebateStyleKey = (typeof debateStyleMap)[number];

export const debateTemplateMap = [
	'primary',
	'secondary',
	'tertiary',
	'quaternary'
] as const;

export type DebateTemplateKey = (typeof debateTemplateMap)[number];

export function getDebateStyle(): DebateStyle {
	return debateStyles[debateStyleMap[settings.data.debateStyle.value as number]];
}
export function getAllDebateStyleFlows(): DebateStyleFlow[] {
	let debateStyle = getDebateStyle();
	if (debateStyle.alternativeFlowSelectorSettingName && debateStyle.alternativeFlowSelectorSettingName in settings.data) {
		const subflow = debateStyle[`alternativeFlows${settings.data[debateStyle.alternativeFlowSelectorSettingName].value as number}`];
		if (subflow) return subflow;
	}
	return debateStyle.flows;
}
export function getDebateStyleFlow(flowPostion: DebateTemplateKey | number): DebateStyleFlow | null {
	let debateFlows = getAllDebateStyleFlows();

	let index;
	if (typeof flowPostion == "number") {
		index = flowPostion;
	} else {
		index = debateTemplateMap.indexOf(flowPostion);
	}

	if (index === -1) {
		return null;
	}

	return debateFlows[index] || null;
}

export type DebateStyleFlow = {
	name: string;
	columns: string[];
	columnsSwitch?: string[];
	invert: boolean;
	starterBoxes?: string[];
};
export type DebateStyle = {
	flows: DebateStyleFlow[];
	alternativeFlowSelectorSettingName?: string;
	timerSpeeches: TimerSpeech[];
	prepTime?: number;
} & {
	[K in `alternativeFlows${number}`]?: DebateStyleFlow[];
};
export const debateStyles: {
	[key in DebateStyleKey]: DebateStyle;
} = {
	policy: {
		flows: [
			{
				name: 'aff',
				columns: ['1AC', '1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
				invert: false
			},
			{
				name: 'neg',
				columns: ['1NC', '2AC', '2NC/1NR', '1AR', '2NR', '2AR'],
				invert: true
			}
		],
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
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: '2NC',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
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
		flows: [
			{
				name: 'aff',
				columns: ['AC', 'NC', 'AR', 'NR', 'AS', 'NS', 'AFF', 'NFF'],
				columnsSwitch: ['AC', 'NR', 'AR', 'NS', 'AS', 'NFF', 'AFF'],
				invert: false
			},
			{
				name: 'neg',
				columns: ['NC', 'AR', 'NR', 'AS', 'NS', 'AFF', 'NFF'],
				columnsSwitch: ['NC', 'AC', 'NR', 'AR', 'NS', 'AS', 'NFF', 'AFF'],
				invert: true
			}
		],
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
		flows: [
			{
				name: 'aff',
				columns: ['AC', 'NR', '1AR', '2NR', '2AR'],
				starterBoxes: ["Value", "Criterion"],
				invert: false
			},
			{
				name: 'neg',
				columns: ['NC', '1AR', '2NR', '2AR'],
				starterBoxes: ["Value", "Criterion"],
				invert: true
			},
		],
		alternativeFlowSelectorSettingName: "LDSubstyle",
		alternativeFlows1: [
			{
				name: 'aff',
				columns: ['AC', 'NR', '1AR', '2NR', '2AR'],
				starterBoxes: ["type here"],
				invert: false
			},
			{
				name: 'neg',
				columns: ['NC', '1AR', '2NR', '2AR'],
				starterBoxes: ["type here"],
				invert: true
			},
			{
				name: '1ar',
				columns: ['1AR', '2NR', '2AR'],
				starterBoxes: ["type here"],
				invert: false
			},
			{
				name: '2nr',
				columns: ['2NR', '2AR'],
				starterBoxes: ["type here"],
				invert: true
			}
		],
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
		flows: [
			{
				name: 'bill',
				columns: [
					'1A',
					'Q/1N',
					'Q/2A',
					'Q/2N',
					'Q/3A',
					'Q/3N',
					'Q/4A',
					'Q/4N',
					'Q/5A',
					'Q/5N',
					'Q/6A',
					'Q/6N',
					'Q/7A',
					'Q/7N',
					'Q/8A',
					'Q/8N',
					'Q/9A',
					'Q/9N',
					'Q/10A',
					'Q/10N',
					'Q/11A',
					'Q/11N',
					'Q/12A',
					'Q/12N',
					'Q/13A',
					'Q/13N',
					'Q/14A',
					'Q/14N',
					'Q/15A',
					'Q/15N',
					'Q/16A',
					'Q/16N',
					'Q/17A',
					'Q/17N',
					'Q/18A',
					'Q/18N',
					'Q/19A',
					'Q/19N',
					'Q/20A',
					'Q/20N',
					'Q/20A',
					'Q/20N',
					'Q/21A',
					'Q/21N',
					'Q/22A',
					'Q/22N',
					'Q/23A',
					'Q/23N',
					'Q/24A',
					'Q/24N',
					'Q/25A',
					'Q/25N'
				],
				invert: false
			},
		],
		timerSpeeches: [
			{
				name: 'speech',
				time: 3 * 60 * 1000,
				secondary: false
			}
		]
	},
	worldSchools: {
		flows: [
			{
				name: 'prop',
				columns: ['P1', 'O1', 'P2', 'O2', 'PW', 'OW', 'OR', 'PR'],
				invert: false
			},
			{
				name: 'opp',
				columns: ['O1', 'P2', 'O2', 'PW', 'OW', 'OR', 'PR'],
				invert: true
			},
		],
		timerSpeeches: [
			{
				name: 'P1',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: 'O1',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'P2',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: 'O2',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'PW',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: 'OW',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'OR',
				time: 4 * 60 * 1000,
				secondary: true
			},
			{
				name: 'PR',
				time: 4 * 60 * 1000,
				secondary: false
			}
		]
	},
	bigQuestions: {
		flows: [
			{
			name: 'aff',
			columns: ['AC', 'NC', 'ARb', 'NRb', 'A3', 'N3', 'ARt', 'NRt'],
			invert: false
			},
			{
				name: 'neg',
				columns: ['NC', 'ARb', 'NRb', 'A3', 'N3', 'ARt', 'NRt'],
				invert: true
			}
		],
		timerSpeeches: [
			{
				name: 'AC',
				time: 5 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NC',
				time: 5 * 60 * 1000,
				secondary: true
			},
			{
				name: 'QS',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'ARb',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NRb',
				time: 4 * 60 * 1000,
				secondary: true
			},
			{
				name: 'QS',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'A3',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'N3',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: 'ARt',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'NRt',
				time: 3 * 60 * 1000,
				secondary: true
			}
		],
		prepTime: 3 * 60 * 1000
	},
	nofSpar: {
		flows: [
			{
				name: 'pro',
				columns: ['PC', 'CC', 'PR', 'CR'],
				invert: false
			},
			{
				name: 'con',
				columns: ['CC', 'PR', 'CR'],
				invert: true
			},
		],
		timerSpeeches: [
			{
				name: 'PREP',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: 'PC',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CC',
				time: 2 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'PR',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CR',
				time: 2 * 60 * 1000,
				secondary: true
			}
		]
	},
	parli: {
		flows: [
			{
				name: 'pro',
				columns: ['1PC', '1OC', '2PC', '2OC/OR', 'PR'],
				invert: false
			},
			{
				name: 'opp',
				columns: ['1OC', '2PC', '2OC/OR', 'PR'],
				invert: true
			}
		],
		timerSpeeches: [
			{
				name: '1PC',
				time: 7 * 60 * 1000,
				secondary: false
			},
			{
				name: '1OC',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: '2PC',
				time: 8 * 60 * 1000,
				secondary: false
			},
			{
				name: '2OC',
				time: 8 * 60 * 1000,
				secondary: true
			},
			{
				name: 'OR',
				time: 4 * 60 * 1000,
				secondary: true
			},
			{
				name: 'PR',
				time: 5 * 60 * 1000,
				secondary: false
			}
		]
	},
	classic: {
		flows: [
			{
				name: 'aff',
				columns: ['AC', 'NC/1NR', '1AR', '2NR', '2AR', 'NS', 'AS'],
				invert: false
			},
			{
				name: 'neg',
				columns: ['NC/1NR', '1AR', '2NR', '2AR', 'AS', 'NS'],
				invert: true
			}
		],
		timerSpeeches: [
			{
				name: 'AC',
				time: 6 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: 'NC',
				time: 6 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: '1NR',
				time: 5 * 60 * 1000,
				secondary: true
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: false
			},
			{
				name: 'prep',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: '1AR',
				time: 7 * 60 * 1000,
				secondary: false
			},
			{
				name: 'CX',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: 'prep',
				time: 2 * 60 * 1000,
				secondary: true
			},
			{
				name: '2NR',
				time: 6 * 60 * 1000,
				secondary: true
			},
			{
				name: 'prep',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: '2AR',
				time: 4 * 60 * 1000,
				secondary: false
			},
			{
				name: 'prep',
				time: 2 * 60 * 1000,
				secondary: true
			},
			{
				name: 'NS',
				time: 3 * 60 * 1000,
				secondary: true
			},
			{
				name: 'prep',
				time: 2 * 60 * 1000,
				secondary: false
			},
			{
				name: 'AS',
				time: 3 * 60 * 1000,
				secondary: false
			}
		]
	}
};
