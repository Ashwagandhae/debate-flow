type RunningState = {
	name: 'running';
	startTime: number;
	ogTime: number;
};

type PausedState = {
	name: 'paused';
};

export type TimeState = RunningState | PausedState;

export type TimerState = {
	resetTime: number;
	time: number;
	state: TimeState;
};

export type SpeechTimerState = {
	resetTimeIndex: number;
	time: number;
	state: TimeState;
};

export type TimerSpeech = {
	name: string;
	time: number;
	secondary: boolean;
};
