const DEFAULT_LIGHT_THEME = "light";
const DEFAULT_DARK_THEME = "dark";


const LIGHT_THEME_KEY = "light-theme";
const DARK_THEME_KEY = "dark-theme";
export const AUTO_THEME = "auto";


export interface Theme {
  name: string;
  title: string;
  isDark: boolean;
}


export const THEMES: Theme[] = [
  { name: "dark", title: "Arc Dark", isDark: true },
  { name: "materia-dark", title: "Materia Dark", isDark: true },
  { name: "light", title: "Light", isDark: false },
  { name: "Solarized", title: "Solarized", isDark: false },
  { name: "Lucky", title: "Lucky", isDark: false }
];


export class ThemeManager {
  constructor() {
    const savedTheme = localStorage.getItem("theme-selected");
    if (savedTheme === AUTO_THEME || !savedTheme) {
      this.setTheme(this.getCurrentDefaultTheme());
      this.isCurrentThemeAuto = true;
    } else {
      this.setTheme(savedTheme);
      this.isCurrentThemeAuto = false;
    }
  }


  private setTheme(name: string) {
    const themeName = name === AUTO_THEME ? this.getCurrentDefaultTheme() : name;

    document.documentElement.classList.forEach(className => {
      if (className.startsWith("theme--")) {
        document.documentElement.classList.remove(className);
      }
    });

    document.documentElement.classList.add(`theme--${ themeName }`);
    this.currentThemeName = themeName;
  }


  private getCurrentDefaultTheme(): string {
    const lightTheme = localStorage.getItem(LIGHT_THEME_KEY) || DEFAULT_LIGHT_THEME;
    const darkTheme = localStorage.getItem(DARK_THEME_KEY) || DEFAULT_DARK_THEME;

    const mediaQuery = matchMedia("(prefers-color-scheme: dark)");
    return mediaQuery.matches ? darkTheme : lightTheme;
  }


  onThemeChange(selectedTheme: string) {
    this.setTheme(selectedTheme);
    this.isCurrentThemeAuto = false;

    if (selectedTheme !== AUTO_THEME) {
      const theme = THEMES.find(t => t.name === selectedTheme);
      if (theme) {
        localStorage.setItem(theme.isDark ? DARK_THEME_KEY : LIGHT_THEME_KEY, selectedTheme);
      }
    }

    localStorage.setItem("theme-selected", selectedTheme);
  }


  currentThemeName!: string;
  isCurrentThemeAuto: boolean;
}
