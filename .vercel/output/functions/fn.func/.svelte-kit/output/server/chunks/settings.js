class Settings {
  data;
  callbacks = { any: [] };
  constructor(settings2) {
    this.data = settings2;
  }
  init() {
    this.loadFromLocalStorage();
  }
  setValue(key, value) {
    this.data[key].value = value;
    if (this.callbacks[key]) {
      for (const callback of this.callbacks[key]) {
        callback(key);
      }
    }
    for (const callback of this.callbacks["any"]) {
      callback(key);
    }
  }
  subscribe(keys, callback) {
    for (const key of keys) {
      if (!this.callbacks[key]) {
        this.callbacks[key] = [];
      }
      this.callbacks[key].push(callback);
      callback(key);
    }
    return () => {
      for (const key of keys) {
        this.callbacks[key] = this.callbacks[key].filter((el) => el != callback);
      }
    };
  }
  saveToLocalStorage() {
    const jsonData = {};
    for (const key in this.data) {
      if (this.data[key].value != this.data[key].auto) {
        jsonData[key] = this.data[key].value;
      }
    }
    localStorage.setItem("settings", JSON.stringify(jsonData));
  }
  loadFromLocalStorage() {
    const settingsObj = localStorage.getItem("settings");
    if (settingsObj) {
      const jsonData = JSON.parse(settingsObj);
      try {
        for (const key in jsonData) {
          this.setValue(key, jsonData[key]);
        }
      } catch (e) {
        localStorage.setItem("settings", JSON.stringify({}));
        this.resetToAuto();
      }
    }
  }
  resetToAuto() {
    for (const key in this.data) {
      this.setValue(key, this.data[key].auto);
    }
  }
  randomize() {
    for (const key in this.data) {
      const setting = this.data[key];
      if (setting.type == "slider") {
        this.setValue(
          key,
          setting.detail.min + Math.random() * (setting.detail.max - setting.detail.min)
        );
      } else if (setting.type == "radio") {
        this.setValue(key, Math.floor(Math.random() * setting.detail.options.length));
      } else if (setting.type == "toggle") {
        this.setValue(key, Math.random() < 0.5);
      }
    }
  }
}
const settings = new Settings({
  debateStyle: {
    name: "Debate style",
    type: "radio",
    value: 0,
    auto: 0,
    detail: {
      options: ["Policy", "Public Forum", "Lincoln Douglas", "Congress"]
    },
    info: "Already created flows won't be affected by this setting"
  },
  colorTheme: {
    name: "Color theme",
    type: "radio",
    value: 0,
    auto: 0,
    detail: {
      options: ["System default", "Light theme", "Dark theme"]
    }
  },
  columnWidth: {
    name: "Column width",
    type: "slider",
    value: 150,
    auto: 150,
    detail: {
      min: 50,
      max: 300,
      step: 1
    }
  },
  accentHue: {
    name: "Primary color hue",
    type: "slider",
    value: 192,
    auto: 192,
    detail: {
      min: 0,
      max: 360,
      step: 1,
      hue: true
    },
    info: "This color will be used for aff"
  },
  accentSecondaryHue: {
    name: "Secondary color hue",
    type: "slider",
    value: 26,
    auto: 26,
    detail: {
      min: 0,
      max: 360,
      step: 1,
      hue: true
    },
    info: "This color will be used for neg"
  },
  transitionSpeed: {
    name: "Transition duration",
    type: "slider",
    value: 300,
    auto: 300,
    detail: {
      min: 0,
      max: 1e3,
      step: 1
    }
  },
  useTooltips: {
    name: "Use tooltips",
    type: "toggle",
    value: true,
    auto: true
  },
  fontSize: {
    name: "Font size",
    type: "slider",
    value: 0.9,
    auto: 0.9,
    detail: {
      min: 0.2,
      max: 2,
      step: 0.01
    }
  },
  fontWeight: {
    name: "Font weight",
    type: "slider",
    value: 300,
    auto: 300,
    detail: {
      min: 100,
      max: 900,
      step: 50
    }
  },
  fontFamily: {
    name: "Font",
    type: "radio",
    value: 0,
    auto: 0,
    detail: {
      options: ["Merriweather Sans", "Helvetica", "Georgia", "Courier New"],
      customOption: true,
      customOptionValue: ""
    },
    info: "Type in a custom font name if it is installed on your computer"
  },
  buttonSize: {
    name: "Button size",
    type: "slider",
    value: 20,
    auto: 20,
    detail: {
      min: 10,
      max: 50,
      step: 1
    }
  },
  lineWidth: {
    name: "Line width",
    type: "slider",
    value: 4,
    auto: 4,
    detail: {
      min: 0,
      max: 8,
      step: 1
    }
  },
  borderRadius: {
    name: "Border radius",
    type: "slider",
    value: 8,
    auto: 8,
    detail: {
      min: 0,
      max: 30,
      step: 1
    }
  },
  padding: {
    name: "Padding",
    value: 8,
    auto: 8,
    type: "slider",
    detail: {
      min: 0,
      max: 30,
      step: 1
    }
  },
  gap: {
    name: "Grid gap",
    value: 8,
    auto: 8,
    type: "slider",
    detail: {
      min: 0,
      max: 30,
      step: 1
    }
  }
});
export {
  settings as s
};
