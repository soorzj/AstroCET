/* ═══════════════════════════════════════════════════════════
   AstroCET — script.js
   Handles: custom cursor, landing canvas, hero canvas,
            enter transition, scroll reveals, navbar, mobile menu
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ──────────────────────────────────────────────────────────
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.className  = 'cursor-dot';
cursorRing.className = 'cursor-ring';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorRing);

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

// ──────────────────────────────────────────────────────────
// LANDING CANVAS — Stars + Orbiting solar system + mouse parallax
// ──────────────────────────────────────────────────────────
(function initLandingCanvas() {
  const canvas = document.getElementById('spaceCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H;
  let mx = 0, my = 0; // mouse relative -1..1
  let animFrame;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    initStars();
  }

  // ── Stars ──
  const STAR_COUNT = 320;
  let stars = [];
  function initStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.6 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.012 + 0.004,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.9 + 0.1,   // parallax depth
    }));
  }

  // ── Shooting stars ──
  let shooters = [];
  function spawnShooter() {
    shooters.push({
      x:     Math.random() * W * 0.8,
      y:     Math.random() * H * 0.4,
      len:   Math.random() * 120 + 60,
      speed: Math.random() * 14 + 10,
      alpha: 1,
      angle: Math.PI / 5 + (Math.random() - 0.5) * 0.4,
    });
    setTimeout(spawnShooter, Math.random() * 4000 + 2000);
  }
  spawnShooter();

  // ── Solar system ──
  const SUN_R = 28;
  const planets = [
    { r: 5,  orbitR: 90,  speed: 0.0055, angle: 0.8,  color: '#c8b89a', glowColor: '#c8b89a' },  // mercury-ish
    { r: 8,  orbitR: 150, speed: 0.0032, angle: 2.0,  color: '#e8c4a0', glowColor: '#e8d4b0' },  // venus-ish
    { r: 10, orbitR: 220, speed: 0.0021, angle: 4.2,  color: '#5a8fd0', glowColor: '#7aa8e8' },  // earth-ish
    { r: 7,  orbitR: 295, speed: 0.0015, angle: 1.1,  color: '#c06040', glowColor: '#e08060' },  // mars-ish
    { r: 20, orbitR: 400, speed: 0.0007, angle: 3.3,  color: '#d4a843', glowColor: '#f0c060', rings: true }, // jupiter-ish
  ];

  // nebula cloud backdrop
  function drawNebula() {
    const grd = ctx.createRadialGradient(W * 0.72, H * 0.38, 0, W * 0.72, H * 0.38, W * 0.45);
    grd.addColorStop(0,   'rgba(40, 30, 80, 0.25)');
    grd.addColorStop(0.5, 'rgba(20, 10, 50, 0.12)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    const grd2 = ctx.createRadialGradient(W * 0.2, H * 0.7, 0, W * 0.2, H * 0.7, W * 0.35);
    grd2.addColorStop(0,   'rgba(30, 60, 80, 0.18)');
    grd2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars(t) {
    const px = mx * 18;
    const py = my * 12;
    stars.forEach(s => {
      const twinkle = 0.6 + 0.4 * Math.sin(t * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(
        s.x + px * s.depth,
        s.y + py * s.depth,
        s.r, 0, Math.PI * 2
      );
      ctx.fillStyle = `rgba(232,228,216, ${s.alpha * twinkle})`;
      ctx.fill();
    });
  }

  function drawShooters() {
    shooters = shooters.filter(s => s.alpha > 0.01);
    shooters.forEach(s => {
      const ex = s.x + Math.cos(s.angle) * s.len;
      const ey = s.y + Math.sin(s.angle) * s.len;
      const grd = ctx.createLinearGradient(s.x, s.y, ex, ey);
      grd.addColorStop(0,   `rgba(255,240,200,0)`);
      grd.addColorStop(0.6, `rgba(255,240,200,${s.alpha * 0.6})`);
      grd.addColorStop(1,   `rgba(255,255,255,${s.alpha})`);
      ctx.beginPath();
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.2;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= 0.012;
    });
  }

  function drawSolarSystem(t) {
    const cx = W * 0.72 + mx * 25;
    const cy = H * 0.5  + my * 20;

    // orbit rings
    planets.forEach(p => {
      ctx.beginPath();
      ctx.arc(cx, cy, p.orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(212,168,67,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // sun glow
    const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN_R * 3.5);
    sunGlow.addColorStop(0,   'rgba(255,220,80,0.55)');
    sunGlow.addColorStop(0.4, 'rgba(255,160,30,0.2)');
    sunGlow.addColorStop(1,   'rgba(255,100,0,0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, SUN_R * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // sun core
    const sunCore = ctx.createRadialGradient(cx - SUN_R * 0.25, cy - SUN_R * 0.25, 0, cx, cy, SUN_R);
    sunCore.addColorStop(0,   '#fff8e0');
    sunCore.addColorStop(0.4, '#ffd050');
    sunCore.addColorStop(1,   '#e87020');
    ctx.beginPath();
    ctx.arc(cx, cy, SUN_R, 0, Math.PI * 2);
    ctx.fillStyle = sunCore;
    ctx.fill();

    // planets
    planets.forEach(p => {
      p.angle += p.speed;
      const px = cx + Math.cos(p.angle) * p.orbitR;
      const py = cy + Math.sin(p.angle) * p.orbitR;

      // planet glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3);
      glow.addColorStop(0,   hexToRgba(p.glowColor, 0.35));
      glow.addColorStop(1,   hexToRgba(p.glowColor, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, p.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // rings (jupiter-ish)
      if (p.rings) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(0.4);
        ctx.scale(1, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(p.glowColor, 0.3);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      // planet core
      const pCore = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
      pCore.addColorStop(0,   lightenHex(p.color, 50));
      pCore.addColorStop(1,   p.color);
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = pCore;
      ctx.fill();
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    drawStars(t * 0.001);
    drawShooters();
    drawSolarSystem(t * 0.001);
    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  resize();
  requestAnimationFrame(draw);

  window._stopLandingCanvas = () => { cancelAnimationFrame(animFrame); };
})();


// ──────────────────────────────────────────────────────────
// HERO CANVAS — subtle ambient star field
// ──────────────────────────────────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const stars = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    stars.length = 0;
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.5 + 0.1,
        sp: Math.random() * 0.008 + 0.002,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      const tw = 0.5 + 0.5 * Math.sin(t * 0.001 * s.sp * 1000 + s.ph);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,228,216,${s.a * tw})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();


// ──────────────────────────────────────────────────────────
// ENTER TRANSITION
// ──────────────────────────────────────────────────────────
function triggerEnter() {
  const landing  = document.getElementById('landing');
  const mainSite = document.getElementById('mainSite');

  landing.classList.add('exiting');

  setTimeout(() => {
    landing.style.display = 'none';
    if (window._stopLandingCanvas) window._stopLandingCanvas();

    mainSite.classList.remove('hidden');
    requestAnimationFrame(() => {
      mainSite.classList.add('visible');
      initScrollReveals();
      initNavbar();
    });
  }, 1200);
}

document.getElementById('enterBtn').addEventListener('click', triggerEnter);
document.addEventListener('keydown', (e) => {
  if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
    const landing = document.getElementById('landing');
    if (landing.style.display !== 'none' && !landing.classList.contains('exiting')) {
      triggerEnter();
    }
  }
});


// ──────────────────────────────────────────────────────────
// SCROLL REVEAL
// ──────────────────────────────────────────────────────────
function initScrollReveals() {
  const targets = document.querySelectorAll(
    '.about-card, .event-card, .announce-item, .gallery-item, ' +
    '.team-card, .hero-content, .section-title, .section-label, ' +
    '.about-text, .about-cards, .hero-stats, .hero-desc'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // slight stagger for sibling groups
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}


// ──────────────────────────────────────────────────────────
// NAVBAR SCROLL EFFECT
// ──────────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobLinks = document.querySelectorAll('.mob-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  });
}


// ──────────────────────────────────────────────────────────
// SUBSCRIBE FORM
// ──────────────────────────────────────────────────────────
document.getElementById('subscribeForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = '✓';
  btn.style.background = '#2a8a4a';
  setTimeout(() => {
    btn.textContent = '→';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});


// ──────────────────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenHex(hex, amount) {
  const r = Math.min(255, parseInt(hex.slice(1,3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3,5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5,7), 16) + amount);
  return `rgb(${r},${g},${b})`;
}
