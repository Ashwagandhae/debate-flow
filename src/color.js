function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hslToCss(h, s, l) {
  return `rgb(${hslToRgb(h, s, l).join(',')})`;
}

function hToPalette(h) {
  if (h === undefined) {
    return '';
  }
  const yellow = 0.166;
  const purple = 0.666;
  let s;
  let range;
  let hueShift;
  function lToCss(l) {
    let middle = (range[0] + range[1]) / 2;
    let lDiff = (l - middle) / (range[1] - range[0]);
    if (h > yellow && h < purple) {
      lDiff *= -1;
    }
    let newH;
    newH = h + lDiff * hueShift;
    if (h > yellow && h < purple) {
      if (newH < yellow) {
        newH = yellow;
      }
      if (newH > purple) {
        newH = purple;
      }
    } else {
      if (newH > yellow && newH < purple) {
        if (h < yellow) {
          newH = yellow;
        } else if (h > purple) {
          newH = purple;
        }
      }
    }
    if (newH > 1) {
      newH -= 1;
    }
    if (newH < 0) {
      newH += 1;
    }

    // fix lightness
    let yellowness;
    if (newH > yellow && newH < purple) {
      yellowness = purple - newH;
    } else {
      if (newH >= purple) {
        yellowness = newH - purple;
      } else if (newH <= yellow) {
        yellowness = newH + (1 - purple);
      }
    }
    return hslToCss(newH, s + yellowness * 0.1, l - yellowness * 0.05);
  }
  s = 0.6;
  range = [0.75, 1];
  hueShift = 0.2;
  let light = {
    'background-indent': lToCss(0.94),
    'background-active': lToCss(0.88),

    'background-two': lToCss(0.97),
    'background-two-indent': lToCss(0.91),
    'background-two-active': lToCss(0.85),
  };
  range = [0.4, 0.6];
  light = {
    ...light,
    'color-accent': lToCss(0.5),
  };

  s = 0.15;
  range = [0.25, 0.65];
  hueShift = 0.1;
  let dark = {
    'background-indent': lToCss(0.32),
    'background-active': lToCss(0.46),

    'background-two': lToCss(0.2),
    'background-two-indent': lToCss(0.39),
    'background-two-active': lToCss(0.53),
  };
  s = 0.5;
  range = [0.6, 0.8];
  dark = {
    ...dark,
    'color-accent': lToCss(0.7),
  };
  return [light, dark];
}
export function hToCss(h) {
  let light = '';
  let dark = '';
  let palette = hToPalette(h);
  for (var key in palette[0]) {
    light += `--${key}:${palette[0][key]};`;
  }
  for (var key in palette[1]) {
    dark += `--${key}:${palette[1][key]};`;
  }
  let ret = [light, dark];
  return ret;
}
