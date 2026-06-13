/**
 * ハート・星・パーティクルエフェクト
 */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mode = 'ambient';
    this.raf = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // 通常の浮遊パーティクル
  initAmbient() {
    this.particles = [];
    this.mode = 'ambient';
    const count = Math.min(40, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.3 + 0.1,
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        type: Math.random() > 0.7 ? 'star' : 'dot',
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  // ハート大量発生
  burstHearts(count = 30) {
    this.mode = 'burst';
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + 20,
        size: Math.random() * 18 + 10,
        speedY: -(Math.random() * 3 + 2),
        speedX: (Math.random() - 0.5) * 4,
        opacity: 1,
        type: 'heart',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        life: 1,
      });
    }
  }

  // 紙吹雪
  burstConfetti(count = 50) {
    const colors = ['#ffb7c5', '#ffd6e0', '#e8d5f5', '#c9b1ff', '#fff5f0', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        size: 0,
        speedY: Math.random() * 3 + 2,
        speedX: (Math.random() - 0.5) * 3,
        opacity: 1,
        type: 'confetti',
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        life: 1,
      });
    }
  }

  drawHeart(x, y, size, opacity, rotation = 0) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ff8fab';
    this.ctx.beginPath();
    const s = size / 16;
    this.ctx.moveTo(0, s * 3);
    this.ctx.bezierCurveTo(-s * 5, -s * 2, -s * 10, s * 4, 0, s * 10);
    this.ctx.bezierCurveTo(s * 10, s * 4, s * 5, -s * 2, 0, s * 3);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawStar(x, y, size, opacity, twinkle) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity * (0.5 + 0.5 * Math.sin(twinkle));
    this.ctx.fillStyle = '#fff8e7';
    this.ctx.font = `${size}px serif`;
    this.ctx.fillText('✦', x, y);
    this.ctx.restore();
  }

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter((p) => {
      if (p.type === 'heart' || p.type === 'confetti') {
        p.life -= 0.005;
        return p.life > 0;
      }
      return true;
    });

    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.type === 'dot') {
        p.twinkle += 0.02;
        if (p.y < -10) p.y = this.canvas.height + 10;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 183, 197, ${p.opacity})`;
        this.ctx.fill();
      } else if (p.type === 'star') {
        p.twinkle += 0.04;
        this.drawStar(p.x, p.y, p.size * 4 + 6, p.opacity, p.twinkle);
      } else if (p.type === 'heart') {
        p.rotation += p.rotSpeed;
        this.drawHeart(p.x, p.y, p.size, p.opacity * p.life, p.rotation);
      } else if (p.type === 'confetti') {
        p.rotation += p.rotSpeed;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.globalAlpha = p.opacity * p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();
      }
    });

    if (this.mode === 'ambient' && this.particles.length < 40) {
      this.initAmbient();
    }

    this.raf = requestAnimationFrame(() => this.tick());
  }

  start() {
    this.initAmbient();
    if (!this.raf) this.tick();
  }

  stop() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }
}

window.ParticleSystem = ParticleSystem;
