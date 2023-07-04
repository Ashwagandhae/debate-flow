import { c as create_ssr_component } from "../../chunks/ssr.js";
import { s as settings } from "../../chunks/settings.js";
const global = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const colorThemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  if (colorThemeMediaQuery.matches) {
    document.body.classList.add("dark");
  }
  settings.init();
  function updateColorTheme() {
    if (settings.data.colorTheme.value == 0) {
      document.body.classList.toggle("dark", colorThemeMediaQuery.matches);
    }
  }
  colorThemeMediaQuery.addEventListener("change", updateColorTheme);
  settings.subscribe(["colorTheme"], function() {
    if (settings.data.colorTheme.value == 1) {
      document.body.classList.remove("dark");
    } else if (settings.data.colorTheme.value == 2) {
      document.body.classList.add("dark");
    } else {
      updateColorTheme();
    }
  });
  const cssVarIndex = {
    accentHue: { name: "accent-hue", unit: "" },
    accentSecondaryHue: { name: "accent-secondary-hue", unit: "" },
    transitionSpeed: { name: "transition-speed", unit: "ms" },
    columnWidth: { name: "column-width", unit: "px" },
    borderRadius: { name: "border-radius", unit: "px" },
    padding: { name: "padding", unit: "px" },
    fontSize: { name: "font-size", unit: "rem" },
    fontWeight: { name: "font-weight", unit: "" },
    gap: { name: "gap", unit: "px" }
  };
  settings.subscribe(["fontFamily"], function(key) {
    const setting = settings.data.fontFamily;
    if (setting.type != "radio")
      return;
    const index = setting.value;
    let chosenFont = void 0;
    if (setting.detail.customOption && setting.detail.options.length == index) {
      chosenFont = setting.detail.customOptionValue;
    } else if (setting.detail.options[index]) {
      chosenFont = setting.detail.options[index];
    }
    if (chosenFont) {
      document.body.style.setProperty("--font-family", `'${chosenFont}', 'Merriweather Sans', sans-serif`);
    } else {
      document.body.style.setProperty("--font-family", `'Merriweather Sans', sans-serif`);
    }
  });
  settings.subscribe(Object.keys(cssVarIndex), function(key) {
    const name = cssVarIndex[key].name;
    const value = settings.data[key].value;
    const unit = cssVarIndex[key].unit;
    document.body.style.setProperty(`--${name}`, `${value}${unit}`);
  });
  return `${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
