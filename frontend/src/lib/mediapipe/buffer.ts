import type { FrameV1 } from "@/lib/mediapipe/schema";

/** Rolling temporal buffer. Never classifies a single frame on its own. */
export class RollingBuffer {
  private frames: FrameV1[] = [];

  constructor(private maxLength: number = 45) {
    if (!Number.isFinite(maxLength) || maxLength < 1) {
      this.maxLength = 45;
    }
  }

  get capacity(): number {
    return this.maxLength;
  }

  get size(): number {
    return this.frames.length;
  }

  push(frame: FrameV1): void {
    this.frames.push(frame);
    while (this.frames.length > this.maxLength) {
      this.frames.shift();
    }
  }

  window(count?: number): FrameV1[] {
    const n = count ?? this.maxLength;
    if (!Number.isFinite(n) || n <= 0) {
      return [];
    }
    return this.frames.slice(Math.max(0, this.frames.length - Math.floor(n)));
  }

  clear(): void {
    this.frames = [];
  }
}
