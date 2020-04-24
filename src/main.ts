function getInput() {
  let input = document.getElementById("timer-input");
  if (!input || !(input instanceof HTMLInputElement)) {
    return undefined;
  }

  return input;
}

function scheduleNextStep(cb: () => void) {
  if (document.hidden) {
    setTimeout(cb, 100);
  } else {
    requestAnimationFrame(cb);
  }
}

function startTimer() {
  let input = getInput();
  if (input) {
    input.readOnly = true;
  }

  timeStart = performance.now();
  scheduleNextStep(timerIteration);
}

function stopTimer() {
  let input = getInput();
  if (input) {
    input.readOnly = false;
    input.value = formatTime(0);
  }
}

function updateTimeDisplay(msLeft: number) {
  let input = getInput();
  if (input) {
    input.value = formatTime(msLeft);
  }

  if (msLeft > 0) {
    document.title = `${ formatTime(msLeft, false) } - Timer`;
  } else {
    document.title = "Timer";
  }
}

function formatTime(ms: number, showMs = true): string {
  let hours = ("" + Math.floor(ms / (1000 * 60 * 60))).padStart(2, "0");
  let mins = ("" + Math.floor(ms / (1000 * 60) % 60)).padStart(2, "0");
  let sec = ("" + Math.floor(ms / 1000) % 60).padStart(2, "0");
  let sc = ("" + Math.floor(ms % 1000)).padStart(3, "0");

  if (showMs) {
    return `${ hours }:${ mins }:${ sec }.${ sc }`;
  } else {
    return `${ hours }:${ mins }:${ sec }`;
  }
}


let timerDuration = 1000 * 60;
let timeStart = performance.now();

function timerIteration() {
  let left = timerDuration - (performance.now() - timeStart);
  if (left <= 0) {
    updateTimeDisplay(0);
    beep();
    stopTimer();
  } else {
    updateTimeDisplay(left);
    scheduleNextStep(timerIteration);
  }
}

updateTimeDisplay(timerDuration);

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

function changeToTemplate(template: string) {
  stopTimer();
  timerDuration = parseTemplate(template);
  updateTimeDisplay(timerDuration);
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

document.body.addEventListener("click", e => {
  let target = e.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.classList.contains("template-button")) {
    let template = target.dataset.template;
    if (template) {
      changeToTemplate(template);
    }
  } else if (target.classList.contains("start")) {
    startTimer();
  }
});
