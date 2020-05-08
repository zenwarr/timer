enum TimerAction {
  Continue,
  Stopped,
  Paused,
  Elapsed
}

class TimeCounter {
  public constructor(msLeft: number) {
    this.msLeft = msLeft;
  }

  public calculatedEnd = 0;
  public msLeft = 0;
  public running = false;
  public stopRequested = false;
  public pauseRequested = false;
  public lastDuration = DEFAULT_DURATION;

  public stop(): void {
    this.stopRequested = true;
    this.msLeft = 0;
    this.setDuration(this.lastDuration);
  }

  private reschedule() {
    this.calculatedEnd = performance.now() + this.msLeft;
  }

  public toggle(): TimerAction {
    if (this.running) {
      this.pauseRequested = true;
      return TimerAction.Paused;
    } else {
      this.running = true;
      this.pauseRequested = false;
      this.stopRequested = false;
      this.reschedule();
      return TimerAction.Continue;
    }
  }

  public tick(): TimerAction {
    let left = Math.max(this.calculatedEnd - performance.now(), 0);

    if (left <= 0) {
      this.running = false;
      this.msLeft = 0;
      return TimerAction.Elapsed;
    } else if (this.stopRequested) {
      this.running = false;
      return TimerAction.Stopped;
    } else if (this.pauseRequested) {
      this.running = false;
      this.msLeft = left;
      return TimerAction.Paused;
    } else {
      this.msLeft = left;
      return TimerAction.Continue;
    }
  }

  public get canStop() {
    return (this.running || this.msLeft > 0) && this.msLeft !== this.lastDuration;
  }

  public get canToggle() {
    return this.running || this.msLeft > 0;
  }

  public setDuration(duration: number) {
    this.msLeft = duration;
    this.lastDuration = duration;
    this.reschedule();
  }
}


const DEFAULT_DURATION = 1000 * 60 * 10;
let counter = new TimeCounter(DEFAULT_DURATION);


class TimerUI {
  public constructor() {
    this._input = document.querySelector<HTMLInputElement>("#timer-input")!;
    this._input.addEventListener("blur", this.applyInputValue.bind(this));
    this._input.addEventListener("input", this.onInputChange.bind(this));

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
    if (counter.canStop) {
      e.preventDefault();
    }
  }

  private onInputChange(e: Event) {
    this._inputDirty = true;
  }

  public applyInputValue() {
    if (!this._inputDirty) {
      return;
    }

    let { parsed, success } = parseInput(this._input.value);
    this._setValidationStatus(success);
    this._inputDirty = false;

    if (parsed != null) {
      counter.setDuration(parsed);
      this.updateState();
    }
  }

  private _setValidationStatus(success: boolean) {
    if (success !== this._inputValid) {
      this._inputValid = success;
      this._input.classList.toggle("timer-input__time--invalid", !success);
    }
  }

  public onStop() {
    counter.stop();
    this.updateTimeDisplay();
  }

  public onToggle() {
    if (!this._inputValid) {
      return;
    }

    let action = counter.toggle();
    if (action === TimerAction.Continue) {
      scheduleNextStep(this.onTimerIteration.bind(this));
    }
  }

  public onChangeTemplate(template: string) {
    counter.setDuration(parseTemplate(template));
    this.updateTimeDisplay();
  }

  private onTimerIteration() {
    let action = counter.tick();

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
    let msLeft = counter.msLeft;

    this._input.value = formatTime(msLeft);
    this._inputDirty = false;
    this._setValidationStatus(true);

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
      toggle.textContent = counter.running ? "Pause" : "Start";
      toggle.disabled = !counter.canToggle;
    }

    let stop = document.querySelector<HTMLButtonElement>(".stop");
    if (stop) {
      stop.disabled = !counter.canStop;
    }

    this._input.readOnly = counter.running;
  }

  private readonly _input: HTMLInputElement;
  private _inputDirty = false;
  private _inputValid = true;
}


new TimerUI();


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
