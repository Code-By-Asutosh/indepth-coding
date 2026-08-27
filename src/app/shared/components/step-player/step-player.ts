import { Component, computed, input, OnDestroy, signal } from '@angular/core';
import { StepPlayerSpec } from '../../../core/models/content.model';

@Component({
  selector: 'app-step-player',
  imports: [],
  templateUrl: './step-player.html',
  styleUrl: './step-player.scss'
})
export class StepPlayer implements OnDestroy {
  readonly spec = input.required<StepPlayerSpec>();

  protected readonly currentFrameIndex = signal(0);
  protected readonly isPlaying = signal(false);
  protected readonly speed = signal(1); // 1, 1.5, 2, 0.5

  private timerId: any = null;

  protected readonly currentFrame = computed(() => {
    const s = this.spec();
    const idx = Math.max(0, Math.min(s.frames.length - 1, this.currentFrameIndex()));
    return s.frames[idx];
  });

  protected readonly totalFrames = computed(() => this.spec().frames.length);

  protected readonly activeCodeLine = computed(() => this.currentFrame()?.codeLine ?? -1);

  protected jump(index: number): void {
    const clamped = Math.max(0, Math.min(this.totalFrames() - 1, index));
    this.currentFrameIndex.set(clamped);
  }

  protected step(delta: number): void {
    const next = this.currentFrameIndex() + delta;
    if (next >= this.totalFrames()) {
      this.currentFrameIndex.set(0);
      if (this.isPlaying()) {
        this.stopPlay();
      }
    } else if (next < 0) {
      this.currentFrameIndex.set(this.totalFrames() - 1);
    } else {
      this.currentFrameIndex.set(next);
    }
  }

  protected togglePlay(): void {
    if (this.isPlaying()) {
      this.stopPlay();
    } else {
      this.startPlay();
    }
  }

  private startPlay(): void {
    this.isPlaying.set(true);
    this.scheduleNextTick();
  }

  private stopPlay(): void {
    this.isPlaying.set(false);
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNextTick(): void {
    if (!this.isPlaying()) return;
    const interval = Math.max(250, 1600 / this.speed());
    this.timerId = setTimeout(() => {
      if (this.isPlaying()) {
        const next = this.currentFrameIndex() + 1;
        if (next >= this.totalFrames()) {
          this.currentFrameIndex.set(0);
          this.stopPlay();
        } else {
          this.currentFrameIndex.set(next);
          this.scheduleNextTick();
        }
      }
    }, interval);
  }

  protected cycleSpeed(): void {
    const current = this.speed();
    if (current === 1) this.speed.set(1.5);
    else if (current === 1.5) this.speed.set(2);
    else if (current === 2) this.speed.set(0.5);
    else this.speed.set(1);

    if (this.isPlaying()) {
      if (this.timerId) clearTimeout(this.timerId);
      this.scheduleNextTick();
    }
  }

  ngOnDestroy(): void {
    this.stopPlay();
  }
}

