<script lang="ts">
  import { ThemeManager, AUTO_THEME, THEMES } from "./Themes";


  const manager = new ThemeManager();

  function setTheme({ currentTarget }: { currentTarget: HTMLSelectElement }) {
    manager.onThemeChange(currentTarget.value);
  }
</script>

<label aria-label="Theme picker">
  <select name="color_theme" on:change={setTheme} value={manager.isCurrentThemeAuto ? AUTO_THEME : manager.currentThemeName}>
    <option value={AUTO_THEME}>Auto</option>
    {#each THEMES as theme}
      <option value={theme.name}>{theme.title}</option>
    {/each}
  </select>
</label>

<style>
  select {
    background: var(--control-background-color);
    border: 1px solid var(--control-border-color);
    appearance: none;
    padding: 6px 10px;
    color: var(--text-color);
    text-align: center;
  }
</style>
