export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const GRAVITY = 240; // px/s² — slight downward drift for sparks

export class Particles {
  private pool: Particle[] = [];

  get active(): readonly Particle[] {
    return this.pool;
  }

  emitBurst(x: number, y: number, color: string, count: number, speed: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const mag = speed * (0.4 + Math.random() * 0.6);
      const life = 0.4 + Math.random() * 0.5;
      this.pool.push({
        x,
        y,
        vx: Math.cos(angle) * mag,
        vy: Math.sin(angle) * mag,
        life,
        maxLife: life,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  emitTrail(x: number, y: number, color: string): void {
    const life = 0.25;
    this.pool.push({
      x,
      y,
      vx: (Math.random() * 2 - 1) * 20,
      vy: (Math.random() * 2 - 1) * 20,
      life,
      maxLife: life,
      color,
      size: 2,
    });
  }

  update(dt: number): void {
    for (const p of this.pool) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += GRAVITY * dt;
      p.life -= dt;
    }
    this.pool = this.pool.filter((p) => p.life > 0);
  }

  clear(): void {
    this.pool.length = 0;
  }
}
