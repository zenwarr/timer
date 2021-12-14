<script lang="ts">
  import { createEventDispatcher } from "svelte";


  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();
</script>


<button disabled={disabled} on:click={() => dispatch("click")}>
  <slot/>
</button>


<style>
  button {
    background-color: var(--control-background-color);
    border: 1px solid var(--control-border-color);
    padding: 10px 15px;
    color: var(--text-color);
  }

  button:disabled {
    opacity: 0.4;
  }

  button:focus {
    outline: 1px dotted var(--control-focus-color);
    outline-offset: -5px;
  }

  button::-moz-focus-inner {
    border: 0;
  }
</style>
