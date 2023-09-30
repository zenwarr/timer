export class VoiceNotifier {
  private readonly hasSpeechSynthesis = this.getHasSpeechSynthesis();
  private readonly notifications = new Map<string, string>();

  private getHasSpeechSynthesis() {
    return window.SpeechSynthesisUtterance && window.speechSynthesis && speechSynthesis.getVoices().length !== 0;
  }

  prepareNotification(text: string, fallbackURL: string): string {
    const id = getIdForText(text);
    this.notifications.set(id, text);

    if (!this.hasSpeechSynthesis && document.getElementById(id) == null) {
      this.createAudioElement(fallbackURL, id);
    }

    return id;
  }

  private createAudioElement(url: string, id: string): HTMLAudioElement {
    const audio = document.createElement("audio");
    audio.id = id;
    audio.src = url;
    audio.preload = "auto";
    document.body.appendChild(audio);
    return audio;
  }

  async notifyByID(id: string) {
    const text = this.notifications.get(id);
    if (!text) {
      throw new Error("No voice notification registered for id: " + id)
    }

    if (this.hasSpeechSynthesis) {
      let utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }

    let audio = document.getElementById(id) as HTMLAudioElement | null;
    if (audio == null) {
      throw new Error("No audio element found for id: " + id);
    }

    return playSound(audio);
  }
}


function getIdForText(text: string): string {
  return "voice-" + text.replace(/[^a-z0-9]/gi, "_");
}

export function playSound(audio: HTMLAudioElement) {
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
