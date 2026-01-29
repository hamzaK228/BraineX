/**
 * About Page Logic
 * Handles Particles, Animated Stats, Scroll Reveal
 */

(function () {
  'use strict';

  // State
  let canvas, ctx;
  let particles = [];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupScrollReveal();
    setupStatsCounter();
    setupParticles();

    window.addEventListener('resize', resizeCanvas);
  }

  // --- Scroll Reveal ---
  function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // only reveal once
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // --- Stats Counter ---
  function setupStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(s => observer.observe(s));
  }

  function startCount(el) {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '+';
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const inc = target / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
    }, stepTime);
  }

  // --- Particle System ---
  function setupParticles() {
    canvas = document.getElementById('heroParticles');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Create particles
    const count = window.innerWidth > 768 ? 100 : 50;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    animateParticles();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1; // velocity x
      this.vy = (Math.random() - 0.5) * 1; // velocity y
      this.size = Math.random() * 3 + 1;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function animateParticles() {
    if (!canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Connect nearby particles
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }

})();
