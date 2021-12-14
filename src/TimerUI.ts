import { TimeCounter, TimerAction } from "./TimeCounter";


export class TimerUI {
  public constructor() {
    this.counter = new TimeCounter();
    this.counter.addNotifyPoint(1000 * 30, "30 seconds left");
    this.counter.addNotifyPoint(1000 * 60, "1 minute left");
    this.counter.addNotifyPoint(1000 * 60 * 5, "5 minutes left");
    this.counter.addNotifyPoint(1000 * 60 * 10, "10 minutes left");
    this.counter.addNotifyPoint(1000 * 60 * 30, "30 minutes left");

    window.onbeforeunload = this.onBeforeUnload.bind(this);
  }


  private onBeforeUnload(e: Event) {
    if (this.counter.canStop) {
      e.preventDefault();
      return "Please don't"
    } else {
      return undefined;
    }
  }


  static instance = new TimerUI();


  readonly counter: TimeCounter;
}


export function scheduleNextStep(cb: () => void) {
  setTimeout(cb, 10);
}

export function formatTime(ms: number, showMs = true): string {
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

export function parseTemplate(template: string): number {
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

export async function beep(times: number = 2) {
  let audio = document.getElementById("beep-sound");
  if (audio && audio instanceof HTMLAudioElement) {
    for (let q = 0; q < times; ++q) {
      await playSound(audio);
    }
  }
}

export async function speak(text: string) {
  if (!window.SpeechSynthesisUtterance || !window.speechSynthesis) {
    return;
  }

  let utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
}

export function parseInput(value: string): { parsed: number, success: true } | { parsed: undefined, success: false } {
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
