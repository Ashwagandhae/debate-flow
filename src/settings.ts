type SettingBasic = {
  name: string;
  value: any;
  auto: any;
  type: string;
  info?: string;
};
type ToggleSetting = SettingBasic & {
  type: 'toggle';
  value: boolean;
  auto: boolean;
};
type RadioSetting = SettingBasic & {
  type: 'radio';
  value: number;
  auto: number;
  detail: {
    options: string[];
    customOption?: boolean;
    customOptionValue?: string;
  };
};
type SliderSetting = SettingBasic & {
  type: 'slider';
  value: number;
  auto: number;
  detail: {
    min: number;
    max: number;
    step: number;
    hue?: boolean;
  };
};
export type Setting = ToggleSetting | RadioSetting | SliderSetting;
class Settings {
  data: { [key: string]: Setting };
  callbacks: { [key: string]: ((key: string) => void)[] } = { any: [] };
  constructor(settings: { [key: string]: Setting }) {
    this.data = settings;
    this.loadFromLocalStorage();
  }
  setValue(key: string, value: any): void {
    this.data[key].value = value;
    if (this.callbacks[key]) {
      for (let callback of this.callbacks[key]) {
        callback(key);
      }
    }
    for (let callback of this.callbacks['any']) {
      callback(key);
    }
  }
  subscribe(keys: string[], callback: (key: string) => void): () => void {
    for (let key of keys) {
      if (!this.callbacks[key]) {
        this.callbacks[key] = [];
      }
      this.callbacks[key].push(callback);
      callback(key);
    }
    return () => {
      for (let key of keys) {
        this.callbacks[key] = this.callbacks[key].filter(
          (el) => el != callback
        );
      }
    };
  }
  saveToLocalStorage() {
    let jsonData: { [key: string]: number } = {};
    for (var key in this.data) {
      if (this.data[key].value != this.data[key].auto) {
        jsonData[key] = this.data[key].value;
      }
    }
    localStorage.setItem('settings', JSON.stringify(jsonData));
  }
  loadFromLocalStorage() {
    if (localStorage.getItem('settings')) {
      let jsonData = JSON.parse(localStorage.getItem('settings'));
      try {
        for (var key in jsonData) {
          this.setValue(key, jsonData[key]);
        }
      } catch (e) {
        localStorage.setItem('settings', JSON.stringify({}));
        this.resetToAuto();
      }
    }
  }
  resetToAuto() {
    for (var key in this.data) {
      this.setValue(key, this.data[key].auto);
    }
  }
}
export let settings: Settings = new Settings({
  debateStyle: {
    name: 'Debate Style',
    type: 'radio',
    value: 0,
    auto: 0,
    detail: {
      options: ['Policy', 'Public forum', 'Lincoln douglass'],
    },
    info: "Already created flows won't be affected by this setting",
  },
  colorTheme: {
    name: 'Color theme',
    type: 'radio',
    value: 0,
    auto: 0,
    detail: {
      options: ['System default', 'Light theme', 'Dark theme'],
    },
  },
  columnWidth: {
    name: 'Column width',
    type: 'slider',
    value: 150,
    auto: 150,
    detail: {
      min: 50,
      max: 300,
      step: 1,
    },
  },
  accentHue: {
    name: 'Primary color hue',
    type: 'slider',
    value: 192,
    auto: 192,
    detail: {
      min: 0,
      max: 360,
      step: 1,
      hue: true,
    },
    info: 'This color will be used for aff',
  },
  accentSecondaryHue: {
    name: 'Secondary color hue',
    type: 'slider',
    value: 26,
    auto: 26,
    detail: {
      min: 0,
      max: 360,
      step: 1,
      hue: true,
    },
    info: 'This color will be used for neg',
  },
  transitionSpeed: {
    name: 'Transition duration',
    type: 'slider',
    value: 300,
    auto: 300,
    detail: {
      min: 0,
      max: 1000,
      step: 1,
    },
  },
  useTooltips: {
    name: 'Use tooltips',
    type: 'toggle',
    value: true,
    auto: true,
  },
  fontSize: {
    name: 'Font size',
    type: 'slider',
    value: 0.9,
    auto: 0.9,
    detail: {
      min: 0.2,
      max: 2,
      step: 0.01,
    },
  },
  fontWeight: {
    name: 'Font weight',
    type: 'slider',
    value: 300,
    auto: 300,
    detail: {
      min: 100,
      max: 900,
      step: 50,
    },
  },
  fontFamily: {
    name: 'Font',
    type: 'radio',
    value: 0,
    auto: 0,
    detail: {
      options: ['Merriweather Sans', 'Helvetica', 'Georgia', 'Courier New'],
      customOption: true,
      customOptionValue: '',
    },
    info: 'Type in a custom font name if it is installed on your computer',
  },
  borderRadius: {
    name: 'Border radius',
    type: 'slider',
    value: 12,
    auto: 12,
    detail: {
      min: 0,
      max: 30,
      step: 1,
    },
  },
  padding: {
    name: 'Padding',
    value: 8,
    auto: 8,
    type: 'slider',
    detail: {
      min: 0,
      max: 30,
      step: 1,
    },
  },
  gap: {
    name: 'Grid Gap',
    value: 12,
    auto: 12,
    type: 'slider',
    detail: {
      min: 0,
      max: 30,
      step: 1,
    },
  },
});
