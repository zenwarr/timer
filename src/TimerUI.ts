import { TimeCounter, TimerAction } from "./TimeCounter";


export const DEFAULT_DURATION = 1000 * 60 * 10;


export class TimerUI {
  public constructor() {
    this.counter = new TimeCounter(DEFAULT_DURATION);

    this.input = document.querySelector<HTMLInputElement>("#timer-input")!;
    this.input.addEventListener("blur", this.applyInputValue.bind(this));
    this.input.addEventListener("input", this.onInputChange.bind(this));

    window.addEventListener("beforeunload", this.onBeforeUnload.bind(this));

    this.updateTimeDisplay();

    document.body.addEventListener("click", e => {
      let target = e.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.classList.contains("template-button")) {
        let template = target.dataset.template;
        if (template) {
          this.onChangeTemplate(template);
        }
      } else if (target.classList.contains("stop")) {
        this.onStop();
      } else if (target.classList.contains("toggle")) {
        this.onToggle();
      }
    });
  }


  private onBeforeUnload(e: Event) {
    if (this.counter.canStop) {
      e.preventDefault();
    }
  }


  private onInputChange(e: Event) {
    this.isInputDirty = true;
  }


  public applyInputValue() {
    if (!this.isInputDirty) {
      return;
    }

    let { parsed, success } = parseInput(this.input.value);
    this.setValidationStatus(success);
    this.isInputDirty = false;

    if (parsed != null) {
      this.counter.setDuration(parsed);
      this.updateState();
    }
  }


  private setValidationStatus(success: boolean) {
    if (success !== this.isInputValid) {
      this.isInputValid = success;
      this.input.classList.toggle("timer-input__time--invalid", !success);
    }
  }


  public onStop() {
    this.counter.stop();
    this.updateTimeDisplay();
  }


  public onToggle() {
    if (!this.isInputValid) {
      return;
    }

    let action = this.counter.toggle();
    if (action === TimerAction.Continue) {
      scheduleNextStep(this.onTimerIteration.bind(this));
    }
  }


  public onChangeTemplate(template: string) {
    this.counter.setDuration(parseTemplate(template));
    this.updateTimeDisplay();
  }


  private onTimerIteration() {
    let action = this.counter.tick();

    this.updateTimeDisplay();

    switch (action) {
      case TimerAction.Elapsed:
        beep();
        break;

      case TimerAction.Continue:
        scheduleNextStep(this.onTimerIteration.bind(this));
    }
  }


  private updateTimeDisplay() {
    let msLeft = this.counter.msLeft;

    this.input.value = formatTime(msLeft);
    this.isInputDirty = false;
    this.setValidationStatus(true);

    if (msLeft > 0) {
      document.title = `${ formatTime(msLeft, false) } - Timer`;
    } else {
      document.title = "Timer";
    }

    this.updateState();
  }


  private updateState() {
    let toggle = document.querySelector<HTMLButtonElement>(".toggle");
    if (toggle) {
      toggle.textContent = this.counter.running ? "Pause" : "Start";
      toggle.disabled = !this.counter.canToggle;
    }

    let stop = document.querySelector<HTMLButtonElement>(".stop");
    if (stop) {
      stop.disabled = !this.counter.canStop;
    }

    this.input.readOnly = this.counter.running;
  }


  private readonly input: HTMLInputElement;
  private readonly counter: TimeCounter;
  private isInputDirty = false;
  private isInputValid = true;
}


function scheduleNextStep(cb: () => void) {
  setTimeout(cb, 10);
}

function formatTime(ms: number, showMs = true): string {
  let hours = ("" + Math.floor(ms / (1000 * 60 * 60))).padStart(2, "0");
  let mins = ("" + Math.floor(ms / (1000 * 60) % 60)).padStart(2, "0");
  let sec = ("" + Math.floor(ms / 1000) % 60).padStart(2, "0");
  let sc = ("" + Math.floor((ms % 1000) / 10)).padStart(2, "0");

  if (showMs) {
    return `${ hours }:${ mins }:${ sec }.${ sc }`;
  } else {
    return `${ hours }:${ mins }:${ sec }`;
  }
}

function parseTemplate(template: string): number {
  let unit = template.slice(-1);
  let multiplier = 1;
  switch (unit) {
    case "s":
      multiplier = 1000;
      break;

    case "m":
      multiplier = 1000 * 60;
      break;

    case "h":
      multiplier = 1000 * 60 * 60;
      break;
  }

  let value = parseInt(template);
  if (isNaN(value)) {
    return 0;
  }

  return value * multiplier;
}

function playSound(audio: HTMLAudioElement) {
  return new Promise<void>((resolve, reject) => {
    function onEnd() {
      audio.removeEventListener("ended", onEnd);
      resolve();
    }

    audio.addEventListener("ended", onEnd);

    audio.play().catch(error => {
      removeEventListener("ended", onEnd);
      reject(error);
    });
  });
}

async function beep(times: number = 2) {
  let audio = document.getElementById("beep-sound");
  if (audio && audio instanceof HTMLAudioElement) {
    for (let q = 0; q < times; ++q) {
      await playSound(audio);
    }
  }
}

function parseInput(value: string): { parsed: number, success: true } | { parsed: undefined, success: false } {
  let qsSep = value.indexOf(".");
  if (qsSep < 0) {
    return { parsed: undefined, success: false };
  }

  let qsText = value.slice(qsSep + 1);
  if (qsText.length !== 2) {
    return { parsed: undefined, success: false };
  }

  let qs = parseInteger(qsText);
  if (qs == null) {
    return { parsed: undefined, success: false };
  }

  let textParts = value.slice(0, qsSep).split(":");
  if (textParts.some(x => x.length > 2)) {
    return { parsed: undefined, success: false };
  }

  let parts = textParts
  .map(x => parseInteger(x))
  .reverse();
  if (parts.some(x => x == null || x >= 60)) {
    return { parsed: undefined, success: false };
  }

  if (parts.length > 3 || parts.length < 1) {
    return { parsed: undefined, success: false };
  }

  let checkedParts = parts as number[];

  let result = qs * 10 + checkedParts[0] * 1000;
  if (checkedParts.length >= 2) {
    result += checkedParts[1] * 1000 * 60;
  }
  if (checkedParts.length >= 3) {
    result += checkedParts[2] * 1000 * 60 * 60;
  }

  return { parsed: result, success: true };
}

function parseInteger(input: string): number | undefined {
  return !/^[0-9]+$/.test(input) ? undefined : +input;
}
