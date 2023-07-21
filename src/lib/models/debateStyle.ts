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
		}
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
		}
	},
	lincolnDouglas: {
		primary: {
			name: 'aff',
			columns: ['AC', 'NC', '1AR', '1NR', '2AR'],
			starterBoxes: ['value', 'criterion'],
			invert: false
		},
		secondary: {
			name: 'neg',
			columns: ['NC', '1AR', '1NR', '2AR'],
			starterBoxes: ['value', 'criterion'],
			invert: true
		}
	},
	congress: {
		primary: {
			name: 'bill',
			columns: ['1A', 'Q/1N', 'Q/2A', 'Q/2N', 'Q/3A', 'Q/3N', 'Q/4A', 'Q/4N', 'Q/5A', 'Q/5N'],
			invert: false
		}
	}
};
export const debateStyleMap: DebateStyleKey[] = [
	'policy',
	'publicForum',
	'lincolnDouglas',
	'congress'
];

export type DebateStyleKey = 'policy' | 'publicForum' | 'lincolnDouglas' | 'congress';
