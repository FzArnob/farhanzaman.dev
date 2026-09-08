/**
 * Particle network animation (port of the old pna.js).
 * Draws drifting dots on a canvas and links the close ones; the pointer becomes
 * an extra particle and clicking/tapping spawns more.
 */

interface Options {
  velocity: number; // the higher the faster
  density: number; // the lower the denser
  netLineDistance: number;
  netLineColor: string;
  netLineWidth: number;
  particleColors: string[];
  /** ms between the staggered initial spawns. Lower fills the net in sooner. */
  spawnInterval: number;
}

const getLimitedRandom = (min: number, max: number, roundToInteger?: boolean): number => {
  let number = Math.random() * (max - min) + min;
  if (roundToInteger) number = Math.round(number);
  return number;
};

const returnRandomArrayitem = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

class Particle {
  network: ParticleNetwork;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particleColor: string;
  radius: number;
  opacity = 0;
  x: number;
  y: number;
  velocity: { x: number; y: number };

  constructor(parent: ParticleNetwork, x?: number, y?: number) {
    this.network = parent;
    this.canvas = parent.canvas;
    this.ctx = parent.ctx;
    this.particleColor = returnRandomArrayitem(parent.options.particleColors);
    this.radius = getLimitedRandom(1.5, 2.5);
    this.x = x || Math.random() * this.canvas.width;
    this.y = y || Math.random() * this.canvas.height;
    this.velocity = {
      x: (Math.random() - 0.5) * parent.options.velocity,
      y: (Math.random() - 0.5) * parent.options.velocity,
    };
  }

  update(): void {
    if (this.opacity < 1) {
      this.opacity += 0.01;
    } else {
      this.opacity = 1;
    }
    // Change direction when outside the map
    if (this.x > this.canvas.width + 100 || this.x < -100) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y > this.canvas.height + 100 || this.y < -100) {
      this.velocity.y = -this.velocity.y;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  draw(): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.particleColor;
    this.ctx.globalAlpha = this.opacity;
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

class ParticleNetwork {
  options: Options = {
    velocity: 1,
    density: 15000,
    netLineDistance: 200,
    netLineColor: '#9a9a9a',
    netLineWidth: 0.7,
    particleColors: ['#9a9a9a'],
    spawnInterval: 250,
  };
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  particles: Particle[] = [];
  interactionParticle?: Particle;
  animationFrame = 0;
  createIntervalId?: number;
  spawnQuantity = 3;
  mouseIsDown = false;
  touchIsMoving = false;
  stopped = false;

  private listeners: [string, EventListener][] = [];

  interactive = true;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    overrides?: Partial<Options> & { interactive?: boolean }
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    if (overrides) {
      const { interactive, ...rest } = overrides;
      Object.assign(this.options, rest);
      if (interactive === false) this.interactive = false;
    }
    this.createParticles(true);
    this.animationFrame = requestAnimationFrame(this.update.bind(this));
    // The 3D shell puts this layer behind a canvas that owns the pointer, so it
    // opts out of the mouse handlers rather than fighting for the same events.
    if (this.interactive) this.bindUiActions();
  }

  createParticles(isInitial?: boolean): void {
    this.particles = [];
    const quantity = (this.canvas.width * this.canvas.height) / this.options.density;

    if (isInitial) {
      let counter = 0;
      clearInterval(this.createIntervalId);
      this.createIntervalId = window.setInterval(() => {
        if (counter < quantity - 1) {
          this.particles.push(new Particle(this));
        } else {
          clearInterval(this.createIntervalId);
        }
        counter++;
      }, this.options.spawnInterval);
    } else {
      for (let i = 0; i < quantity; i++) {
        this.particles.push(new Particle(this));
      }
    }
  }

  createInteractionParticle(): Particle {
    this.interactionParticle = new Particle(this);
    this.interactionParticle.velocity = { x: 0, y: 0 };
    this.particles.push(this.interactionParticle);
    return this.interactionParticle;
  }

  removeInteractionParticle(): void {
    if (!this.interactionParticle) return;
    const index = this.particles.indexOf(this.interactionParticle);
    if (index > -1) {
      this.interactionParticle = undefined;
      this.particles.splice(index, 1);
    }
  }

  update(): void {
    if (this.stopped) {
      cancelAnimationFrame(this.animationFrame);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;

    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = this.particles.length - 1; j > i; j--) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        // Cheap rejection before measuring precisely
        let distance = Math.min(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
        if (distance > this.options.netLineDistance) continue;

        distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        if (distance > this.options.netLineDistance) continue;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.options.netLineColor;
        this.ctx.globalAlpha =
          ((this.options.netLineDistance - distance) / this.options.netLineDistance) *
          p1.opacity *
          p2.opacity;
        this.ctx.lineWidth = this.options.netLineWidth;
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    }

    // Draw particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
      this.particles[i].draw();
    }

    if (this.options.velocity !== 0) {
      this.animationFrame = requestAnimationFrame(this.update.bind(this));
    }
  }

  private add(type: string, listener: EventListener): void {
    this.canvas.addEventListener(type, listener);
    this.listeners.push([type, listener]);
  }

  bindUiActions(): void {
    this.add('mousemove', (event) => {
      const e = event as MouseEvent;
      if (!this.interactionParticle) this.createInteractionParticle();
      this.interactionParticle!.x = e.offsetX;
      this.interactionParticle!.y = e.offsetY;
    });

    this.add('touchmove', (event) => {
      const e = event as TouchEvent;
      e.preventDefault();
      this.touchIsMoving = true;
      if (!this.interactionParticle) this.createInteractionParticle();
      this.interactionParticle!.x = e.changedTouches[0].clientX;
      this.interactionParticle!.y = e.changedTouches[0].clientY;
    });

    this.add('mousedown', () => {
      this.mouseIsDown = true;
      let counter = 0;
      let quantity = this.spawnQuantity;
      const intervalId = window.setInterval(() => {
        if (this.mouseIsDown) {
          if (counter === 1) quantity = 1;
          for (let i = 0; i < quantity; i++) {
            if (this.interactionParticle) {
              this.particles.push(
                new Particle(this, this.interactionParticle.x, this.interactionParticle.y)
              );
            }
          }
        } else {
          clearInterval(intervalId);
        }
        counter++;
      }, 50);
    });

    this.add('touchstart', (event) => {
      const e = event as TouchEvent;
      e.preventDefault();
      setTimeout(() => {
        if (!this.touchIsMoving) {
          for (let i = 0; i < this.spawnQuantity; i++) {
            this.particles.push(
              new Particle(this, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
            );
          }
        }
      }, 200);
    });

    this.add('mouseup', () => {
      this.mouseIsDown = false;
    });

    this.add('mouseout', () => {
      this.removeInteractionParticle();
    });

    this.add('touchend', (event) => {
      event.preventDefault();
      this.touchIsMoving = false;
      this.removeInteractionParticle();
    });
  }

  destroy(): void {
    this.stopped = true;
    cancelAnimationFrame(this.animationFrame);
    clearInterval(this.createIntervalId);
    for (const [type, listener] of this.listeners) {
      this.canvas.removeEventListener(type, listener);
    }
    this.listeners = [];
  }
}

/**
 * Mounts the animation inside `element`. Returns a teardown function.
 *
 * `overrides` was added for v1.09: the 3D shell reuses this exact animation as its
 * background net and needs it in the brand colours at a lower density. The flat site
 * passes nothing and keeps the original grey.
 */
export function initParticleNetwork(
  element: HTMLElement,
  overrides?: Partial<Options> & { interactive?: boolean }
): () => void {
  const canvas = document.createElement('canvas');
  const sizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  sizeCanvas();
  element.appendChild(canvas);

  const ctx = canvas.getContext('2d')!;
  const network = new ParticleNetwork(canvas, ctx, overrides);

  const onResize = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sizeCanvas();
    network.createParticles();
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    network.destroy();
    canvas.remove();
  };
}
