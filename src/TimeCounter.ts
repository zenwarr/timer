export class TimeCounter {
  public constructor(msLeft: number) {
    this.msLeft = msLeft;
    this.lastDuration = msLeft;
  }


  public calculatedEnd = 0;
  public msLeft = 0;
  public running = false;
  public stopRequested = false;
  public pauseRequested = false;
  public lastDuration: number;


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


export enum TimerAction {
  Continue,
  Stopped,
  Paused,
  Elapsed
}
