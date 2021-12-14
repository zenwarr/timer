<script lang="ts">

  import ThemeSwitcher from "./ThemeSwitcher.svelte";
  import TimeInput from "./TimeInput.svelte";
  import Button from "./Button.svelte";
  import { beep, parseTemplate, TimerUI, scheduleNextStep, formatTime } from "./TimerUI";
  import { TimerAction } from "./TimeCounter";


  const controller = TimerUI.instance;
  let msLeft = controller.counter.msLeft;


  $: {
    if (msLeft > 0) {
      document.title = `${ formatTime(msLeft, false) } - Timer`;
    } else {
      document.title = "Timer";
    }
  }

  function setTime(template: string) {
    controller.counter.setDuration(parseTemplate(template));
  }


  function onIteration() {
    let action = controller.counter.tick();
    msLeft = controller.counter.msLeft;

    switch (action) {
      case TimerAction.Elapsed:
        beep();
        break;

      case TimerAction.Continue:
        scheduleNextStep(onIteration);
    }
  }


  function onToggle() {
    let action = controller.counter.toggle();
    if (action === TimerAction.Continue) {
      scheduleNextStep(onIteration);
    }
  }

</script>

<div class="container">
  <TimeInput time={msLeft}
             readOnly={controller.counter.msLeft}
             on:change={value => controller.counter.setDuration(value)}/>

  <div class="button-group">
    <div class="button">
      <Button disabled={!controller.counter.canToggle} on:click={onToggle}>
        {#if controller.counter.running}
          Stop
        {:else}
          Start
        {/if}
      </Button>
    </div>

    <div class="button">
      <Button disabled={!controller.counter.canStop} on:click={() => controller.counter.stop()}>
        Stop
      </Button>
    </div>
  </div>

  <div class="button-group">
    <div class="button">
      <Button on:click={() => setTime("1m")}>
        1 minute
      </Button>
    </div>

    <div class="button">
      <Button on:click={() => setTime("5m")}>
        5 minutes
      </Button>
    </div>

    <div class="button">
      <Button on:click={() => setTime("10m")}>
        10 minutes
      </Button>
    </div>

    <div class="button">
      <Button on:click={() => setTime("15m")}>
        15 minutes
      </Button>
    </div>

    <div class="button">
      <Button on:click={() => setTime("30m")}>
        30 minutes
      </Button>
    </div>

    <div class="button">
      <Button on:click={() => setTime("1h")}>
        1 hour
      </Button>
    </div>
  </div>

  <div class="theme-picker" id="theme-picker">
    <ThemeSwitcher/>
  </div>

</div>

<style>
  .container {
    padding: 10px;
    text-align: center;
    display: flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;
  }

  .button-group {
    margin: 20px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .button {
    margin: 5px 10px;
    width: 110px;
  }

  .theme-picker {
    position: absolute;
    right: 40px;
    top: 40px;
    text-align: center;
    text-align-last: center;
  }

  @media (min-width: 500px) {
    .container {
      padding: 40px;
    }
  }

  @media (max-width: 790px) {
    .theme-picker {
      position: static;
    }
  }
</style>
