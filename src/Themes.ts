const DEFAULT_LIGHT_THEME = "light";
const DEFAULT_DARK_THEME = "dark";


const LIGHT_THEME_KEY = "light-theme";
const DARK_THEME_KEY = "dark-theme";
const AUTO_THEME = "auto";


export class ThemeManager {
  public constructor() {
    const mediaQuery = matchMedia("(prefers-color-scheme: dark)");
    this.currentSystemThemeIsDark = mediaQuery.matches;
    mediaQuery.addEventListener("change", value => {
      this.currentSystemThemeIsDark = value.matches;
      console.log(this.currentTheme);
      if (this.currentTheme === AUTO_THEME) {
        this.setTheme(AUTO_THEME);
      }
    });

    const savedTheme = localStorage.getItem("theme-selected");
    if (savedTheme === AUTO_THEME || !savedTheme) {
      this.setTheme(AUTO_THEME);
      this.setThemeSelectorValue(AUTO_THEME);
    } else {
      this.setTheme(savedTheme);
      this.setThemeSelectorValue(savedTheme);
    }

    const themeSelector = document.querySelector("[name=color_theme]");
    if (themeSelector) {
      themeSelector.addEventListener("change", event => {
        if (event.target) {
          this.onThemeSwitch((event.target as HTMLSelectElement).value);
        }
      });
    }
  }


  private currentSystemThemeIsDark: boolean;
  private currentTheme!: string;


  private setTheme(name: string) {
    const themeName = name === AUTO_THEME ? this.getCurrentDefaultTheme() : name;

    document.documentElement.classList.forEach(className => {
      if (className.startsWith("theme--")) {
        document.documentElement.classList.remove(className);
      }
    });

    document.documentElement.classList.add(`theme--${ themeName }`);
    this.currentTheme = name;
  }


  private setThemeSelectorValue(name: string) {
    const select = document.querySelector<HTMLSelectElement>("select[name=color_theme]");
    if (select) {
      select.value = name;
    }
  }


  private getCurrentDefaultTheme(): string {
    const lightTheme = localStorage.getItem(LIGHT_THEME_KEY) || DEFAULT_LIGHT_THEME;
    const darkTheme = localStorage.getItem(DARK_THEME_KEY) || DEFAULT_DARK_THEME;
    return this.currentSystemThemeIsDark ? darkTheme : lightTheme;
  }


  private onThemeSwitch(selectedTheme: string) {
    this.setTheme(selectedTheme);

    if (selectedTheme !== AUTO_THEME) {
      const isSelectedThemeDark = this.isThemeDark(selectedTheme);
      localStorage.setItem(isSelectedThemeDark ? DARK_THEME_KEY : LIGHT_THEME_KEY, selectedTheme);
    }

    localStorage.setItem("theme-selected", selectedTheme);
  }


  private isThemeDark(name: string): boolean {
    const option = document.querySelector<HTMLOptionElement>(`select[name=color_theme] option[value=${ name }]`);
    if (!option) {
      throw new Error(`Theme ${ name } not found`);
    }

    const rawIsDark = option.dataset["isDark"];
    if (rawIsDark !== "true" && rawIsDark !== "false") {
      throw new Error(`Configuration for theme ${ name } is invalid: data-is-dark is missing`);
    }

    return JSON.parse(rawIsDark);
  }
}
