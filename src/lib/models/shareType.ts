export type SheetsMessage =
	| InitMessage
	| ReadCellMessage
	| WriteCellMessage
	| ResizeMoveMessage
	| CloseMessage;
export type SheetsResponse =
	| InitResponse
	| ReadCellResponse
	| WriteCellResponse
	| ResizeMoveResponse;
export type InitMessage = {
	message: 'flower:init';
	data: null;
};
export type InitResponse = {
	message: 'flower:init';
	data: {
		ready: boolean;
		version: string;
		url: string;
	};
};
export type CloseMessage = {
	message: 'flower:close';
	data: null;
};
export type ReadCellMessage = {
	message: 'flower:readCell';
	data: {
		row: number;
		col: number;
	}[];
};
export type ReadCellResponse = {
	message: 'flower:readCell';
	data: {
		value: string;
	}[];
};
export type WriteCellMessage = {
	message: 'flower:writeCell';
	data: {
		row: number;
		col: number;
		value: string;
	}[];
};
export type WriteCellResponse = {
	message: 'flower:writeCell';
	data: null;
};
export type ResizeMoveMessage = {
	message: 'flower:resizeMove';
	data: {
		width?: string;
		height?: string;
		top?: string;
		left?: string;
	};
};
export type ResizeMoveResponse = {
	message: 'flower:resizeMove';
	data: null;
};
