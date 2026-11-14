export class Gate {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(
    readonly limit: number,
    readonly queue: number
  ) {}

  get load() {
    return { active: this.active, waiting: this.waiting.length };
  }

  // null when the queue is full or no slot frees up within waitMs
  acquire(waitMs: number): Promise<(() => void) | null> {
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve(this.releaser());
    }

    if (this.waiting.length >= this.queue) return Promise.resolve(null);

    return new Promise((resolve) => {
      const wake = () => {
        clearTimeout(timer);
        this.active++;
        resolve(this.releaser());
      };

      const timer = setTimeout(() => {
        const at = this.waiting.indexOf(wake);
        if (at !== -1) this.waiting.splice(at, 1);
        resolve(null);
      }, waitMs);

      this.waiting.push(wake);
    });
  }

  private releaser() {
    let done = false;

    return () => {
      if (done) return;
      done = true;
      this.active--;
      this.waiting.shift()?.();
    };
  }
}
