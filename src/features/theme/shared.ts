import { getColorPalette, getRgb, transformColorWithOpacity } from '@sa/color';
import type { ConfigProviderProps } from 'antd';
import { theme as antdTheme } from 'antd';

import { globalConfig } from '@/config';
import { DARK_CLASS } from '@/constants/app';
import { overrideThemeSettings, themeSettings } from '@/theme/settings';
import { themeVars } from '@/theme/vars';
import { toggleHtmlClass } from '@/utils/common';
import { localStg } from '@/utils/storage';

/** Init theme settings */
export function initThemeSettings() {
  // if it is development mode, the theme settings will not be cached, by update `themeSettings` in `src/theme/settings.ts` to update theme settings
  if (globalConfig.isDev) return themeSettings;

  // if it is production mode, the theme settings will be cached in localStorage
  // if want to update theme settings when publish new version, please update `overrideThemeSettings` in `src/theme/settings.ts`

  const settings = localStg.get('themeSettings') || themeSettings;

  const isOverride = localStg.get('overrideThemeFlag') === BUILD_TIME;

  if (!isOverride) {
    Object.assign(settings, overrideThemeSettings);
    localStg.set('overrideThemeFlag', BUILD_TIME);
  }

  return settings;
}

/**
 * Get css var by tokens
 *
 * @param tokens Theme base tokens
 */
function getCssVarByTokens(tokens: App.Theme.BaseToken) {
  const styles: string[] = [];

  function removeVarPrefix(value: string) {
    return value.replace('var(', '').replace(')', '');
  }

  function removeRgbPrefix(value: string) {
    return value.replace('rgb(', '').replace(')', '');
  }

  for (const [key, tokenValues] of Object.entries(themeVars)) {
    for (const [tokenKey, tokenValue] of Object.entries(tokenValues)) {
      let cssVarsKey = removeVarPrefix(tokenValue);
      let cssValue = tokens[key][tokenKey];

      if (key === 'colors') {
        cssVarsKey = removeRgbPrefix(cssVarsKey);
        const { b, g, r } = getRgb(cssValue);
        cssValue = `${r} ${g} ${b}`;
      }

      styles.push(`${cssVarsKey}: ${cssValue}`);
    }
  }

  const styleStr = styles.join(';');

  return styleStr;
}

/**
 * Add theme vars to global
 *
 * @param tokens
 */
export function addThemeVarsToGlobal(tokens: App.Theme.BaseToken, darkTokens: App.Theme.BaseToken) {
  const cssVarStr = getCssVarByTokens(tokens);
  const darkCssVarStr = getCssVarByTokens(darkTokens);

  const css = `
   :root {
      ${cssVarStr}
    }
  `;

  const darkCss = `
    html.${DARK_CLASS} {
      ${darkCssVarStr}
    }
  `;

  const styleId = 'theme-vars';

  const style = document.querySelector(`#${styleId}`) || document.createElement('style');

  style.id = styleId;

  style.textContent = css + darkCss;

  document.head.appendChild(style);
}
/**
 * Create theme palette colors
 *
 * @param colors Theme colors
 * @param [recommended=false] Use recommended color. Default is `false`
 */
function createThemePaletteColors(colors: App.Theme.ThemeColor, recommended = false) {
  const colorKeys = Object.keys(colors) as App.Theme.ThemeColorKey[];
  const colorPaletteVar = {} as App.Theme.ThemePaletteColor;

  colorKeys.forEach(key => {
    const colorMap = getColorPalette(colors[key], recommended);

    colorPaletteVar[key] = colorMap.get(500)!;

    colorMap.forEach((hex, number) => {
      colorPaletteVar[`${key}-${number}`] = hex;
    });
  });

  return colorPaletteVar;
}

/**
 * create theme token css vars value by theme settings
 *
 * @param colors Theme colors
 * @param tokens Theme setting tokens
 * @param [recommended=false] Use recommended color. Default is `false`
 */
function createThemeToken(
  colors: App.Theme.ThemeColor,
  tokens?: App.Theme.ThemeSetting['tokens'],
  recommended = false
) {
  const paletteColors = createThemePaletteColors(colors, recommended);

  const { dark, light } = tokens || themeSettings.tokens;

  const themeTokens: App.Theme.ThemeTokenCSSVars = {
    boxShadow: {
      ...light.boxShadow
    },
    colors: {
      ...paletteColors,
      nprogress: paletteColors.primary,
      ...light.colors
    }
  };

  const darkThemeTokens: App.Theme.ThemeTokenCSSVars = {
    boxShadow: {
      ...themeTokens.boxShadow,
      ...dark?.boxShadow
    },
    colors: {
      ...themeTokens.colors,
      ...dark?.colors
    }
  };

  return {
    darkThemeTokens,
    themeTokens
  };
}

/**
 * Get antd theme
 *
 * @param colors Theme colors
 * @param darkMode Is dark mode
 */
export function getAntdTheme(
  colors: App.Theme.ThemeColor,
  darkMode: boolean,
  tokens: App.Theme.ThemeSetting['tokens']
) {
  const { darkAlgorithm, defaultAlgorithm } = antdTheme;

  const { error, info, primary, success, warning } = colors;

  const bgColor = transformColorWithOpacity(primary, darkMode ? 0.3 : 0.1, darkMode ? '#000000' : '#fff');
  const containerBgColor = darkMode ? tokens.dark?.colors?.container : tokens.light?.colors.container;

  const theme: ConfigProviderProps['theme'] = {
    algorithm: [darkMode ? darkAlgorithm : defaultAlgorithm],
    components: {
      Button: {
        controlHeightSM: 28
      },
      Collapse: {
        contentPadding: '16px 16px 24px 16px',
        headerBg: containerBgColor
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        itemMarginInline: 8,
        itemSelectedBg: bgColor,
        subMenuItemBg: 'transparent'
      }
    },
    cssVar: true,
    token: {
      colorBgContainer: containerBgColor,
      colorError: error,
      colorInfo: info,
      colorPrimary: primary,
      colorSuccess: success,
      colorWarning: warning
    }
  };

  return theme;
}

/**
 * Toggle auxiliary color modes
 *
 * @param grayscaleMode
 * @param colourWeakness
 */
export function toggleAuxiliaryColorModes(colourWeakness = false) {
  const htmlElement = document.documentElement;
  htmlElement.style.filter = colourWeakness ? 'invert(80%)' : '';
}

/** Setup theme vars to html */
export function setupThemeVarsToHtml(
  themeColors: App.Theme.ThemeColor,
  tokens?: App.Theme.ThemeSetting['tokens'],
  recommended = false
) {
  const { darkThemeTokens, themeTokens } = createThemeToken(themeColors, tokens, recommended);
  addThemeVarsToGlobal(themeTokens, darkThemeTokens);
}

export function toggleGrayscaleMode(grayscaleMode = false) {
  const GRAYSCALE_CLASS = 'grayscale';

  const { add, remove } = toggleHtmlClass(GRAYSCALE_CLASS);

  if (grayscaleMode) {
    add();
  } else {
    remove();
  }
}
