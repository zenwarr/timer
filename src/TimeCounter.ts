export interface NotifyPoint {
  msLeft: number;
  pointID: string;
  triggered: boolean;
}


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
  protected notifyPoints: NotifyPoint[] = [];


  public addNotifyPoint(msLeft: number, pointID: string): void {
    this.notifyPoints.push({
      msLeft: msLeft,
      pointID: pointID,
      triggered: false
    });
  }


  public stop(): void {
    this.stopRequested = true;
    this.msLeft = 0;
    this.setDuration(this.lastDuration);
  }


  private reschedule() {
    this.calculatedEnd = performance.now() + this.msLeft;
    for (const point of this.notifyPoints) {
      point.triggered = point.msLeft >= this.msLeft;
    }
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


  public tick(): [TimerAction, NotifyPoint[]] {
    let left = Math.max(this.calculatedEnd - performance.now(), 0);

    const triggeredPoints: NotifyPoint[] = [];
    for (const point of this.notifyPoints) {
      if (left <= point.msLeft && !point.triggered) {
        point.triggered = true;
        triggeredPoints.push(point);
      }
    }

    if (left <= 0) {
      this.running = false;
      this.msLeft = 0;
      return [TimerAction.Elapsed, triggeredPoints];
    } else if (this.stopRequested) {
      this.running = false;
      return [TimerAction.Stopped, triggeredPoints];
    } else if (this.pauseRequested) {
      this.running = false;
      this.msLeft = left;
      return [TimerAction.Paused, triggeredPoints];
    } else {
      this.msLeft = left;
      return [TimerAction.Continue, triggeredPoints];
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
