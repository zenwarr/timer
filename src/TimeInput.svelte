<script lang="ts">
  import { parseInput, formatTime } from "./TimerUI";
  import { createEventDispatcher } from "svelte";


  export let time: number;
  export let readOnly: boolean;

  let reducedMotion = false;
  const reducedMotionMedia = matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotionMedia.addEventListener("change", value => {
    reducedMotion = value.matches;
  });
  reducedMotion = reducedMotionMedia.matches;

  const dispatch = createEventDispatcher();

  let isValid = true;
  let isDirty = false;
  let value = "";

  function onChange(newValue: string) {
    value = newValue;
    isDirty = true;
  }

  function onBlur() {
    if (!isDirty) {
      return;
    }

    let { parsed, success } = parseInput(value);
    isValid = success;
    isDirty = false;

    if (parsed != null) {
      dispatch("change", { value: parsed });
    }
  }
</script>


<label aria-label="Time left">
  <input class:invalid={!isValid}
         on:blur={onBlur}
         value={formatTime(reducedMotion ? Math.ceil(time / 1000) * 1000 : time)}
         onChange={e => onChange(e.target.value)}
         autocomplete={false}
         readonly={readOnly}/>
</label>


<style>
  label {
    text-align: center;
    font-size: 18px;
    margin-bottom: 5px;
  }

  input {
    display: inline-block;
    max-width: 500px;
    font-size: 40px;
    font-weight: bold;
    padding: 10px;
    text-align: center;
    width: 100%;
    background: var(--control-background-color);
    border: 1px solid var(--control-border-color);
    color: var(--text-color);
    font-family: Share Tech Mono, monospace;
  }

  .invalid {
    box-shadow: 0px 1px 16px 0px red;
    border-color: red;
  }

  input::selection {
    background-color: var(--control-selection-color);
  }

  @media (min-width: 500px) {
    input {
      font-size: 65px;
      text-align: center;
    }
  }
</style>
