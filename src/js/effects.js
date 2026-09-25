/**
 * Atmosphere: the sparkle canvas (prism light by day, dead pixels by night) and
 * the butterfly / moth that follows the cursor.
 *
 * Performance budget (carried over from the v4 mockup):
 *  1. The canvas renders at 1x: the glows are soft blurs, so 2x/3x screens
 *     would just burn 4–9x the pixels.
 *  2. Glows, flares and caustic streaks are pre-rendered ONCE into small
 *     sprites; each frame is only drawImage().
 *  3. The canvas is capped at 30fps; the butterfly still moves at full rate.
 *  4. Particle count scales with screen area, and halves on low-power hints
 *     (≤4 cores, ≤4GB RAM, Save-Data) — which also switch off backdrop blurs
 *     via the .low-power class.
 *  5. requestAnimationFrame pauses by itself in background tabs; with motion
 *     off (footer toggle or prefers-reduced-motion) the loop is cancelled and
 *     one still frame is drawn.
 */
import { motionEnabled, onMotionChange } from "./motion.js";

const root = document.documentElement;
const R = Math.random;

function isLowPower() {
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  return cores <= 4 || memory <= 4 || Boolean(navigator.connection?.saveData);
}

function sprite(w, h, paint) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  paint(canvas.getContext("2d"), w, h);
  return canvas;
}

function createSparkles(canvas, lowPower) {
  const ctx = canvas.getContext("2d");
  let W = 0;
  let H = 0;

  const resize = () => {
    W = innerWidth;
    H = innerHeight;
    canvas.width = W;
    canvas.height = H;
  };
  resize();

  const density = Math.min(1, (W * H) / (1440 * 900)) * (lowPower ? 0.5 : 1);
  const count = (n) => Math.max(14, Math.round(n * density));

  // --- sprites, built once ---
  const COLORS = ["255,246,232", "255,236,220", "232,242,255", "255,255,255"];
  const glowSprites = COLORS.map((c) =>
    sprite(64, 64, (g) => {
      const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, `rgba(${c},1)`);
      gradient.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gradient;
      g.fillRect(0, 0, 64, 64);
    })
  );
  const flareSprite = sprite(128, 128, (g) => {
    g.fillStyle = "#fff";
    const m = 64;
    const L = 62;
    const w = 2.7;
    g.beginPath();
    g.moveTo(m - L, m);
    g.lineTo(m, m - w);
    g.lineTo(m + L, m);
    g.lineTo(m, m + w);
    g.fill();
    g.beginPath();
    g.moveTo(m, m - L);
    g.lineTo(m - w, m);
    g.lineTo(m, m + L);
    g.lineTo(m + w, m);
    g.fill();
  });
  const streakSprites = Array.from({ length: 12 }, (_, i) =>
    sprite(128, 16, (g) => {
      const hue = i * 30;
      const gradient = g.createLinearGradient(0, 0, 128, 0);
      gradient.addColorStop(0, `hsla(${hue},90%,85%,0)`);
      gradient.addColorStop(0.5, `hsla(${hue},95%,88%,1)`);
      gradient.addColorStop(1, `hsla(${(hue + 60) % 360},90%,85%,0)`);
      g.fillStyle = gradient;
      g.beginPath();
      g.ellipse(64, 8, 64, 8, 0, 0, Math.PI * 2);
      g.fill();
    })
  );

  // --- particles ---
  const stars = Array.from({ length: count(110) }, () => ({
    x: R(),
    y: R(),
    r: R() * 1.4 + 0.4,
    s: R() * 6.28,
    sp: R() * 1.5 + 0.5,
    v: R() * 0.00024 + 0.00006,
    big: R() < 0.07,
    g: glowSprites[Math.floor(R() * 4)],
  }));
  const streaks = Array.from({ length: count(30) }, () => ({
    y: 0.64 + R() * 0.3,
    x: 0.28 + R() * 0.44,
    w: 0.04 + R() * 0.16,
    h: R() * 2.5 + 1,
    hue: R() * 360,
    p: R() * 6.28,
  }));
  const PIXEL_COLORS = ["rgb(231,231,238)", "rgb(255,42,79)", "rgb(25,227,240)"];
  const pixels = Array.from({ length: count(140) }, () => ({
    x: R(),
    y: R(),
    s: R() < 0.85 ? 2 : 3,
    c: R() < 0.8 ? 0 : R() < 0.5 ? 1 : 2,
    on: R(),
  })).sort((a, b) => a.c - b.c); // grouped by colour → fewer fillStyle changes

  function day(t) {
    ctx.globalCompositeOperation = "screen";
    for (const s of streaks) {
      const w = s.w * W;
      const x = (s.x + Math.sin(t * 0.0004 + s.p) * 0.02) * W - w / 2;
      const y = s.y * H - s.h;
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 0.0012 + s.p);
      ctx.drawImage(streakSprites[Math.floor(((s.hue + t * 0.01) % 360) / 30)], x, y, w, s.h * 2);
    }
    ctx.globalCompositeOperation = "source-over";
    for (const s of stars) {
      s.y -= s.v;
      if (s.y < -0.02) s.y = 1.02;
      const twinkle = Math.pow(Math.abs(Math.sin(t * 0.001 * s.sp + s.s)), 3);
      const a = 0.25 + 0.75 * twinkle;
      const r = s.r * (s.big ? 2 : 1);
      const x = s.x * W + Math.sin(t * 0.0003 + s.s) * 8;
      const y = s.y * H;
      const G = r * 7;
      ctx.globalAlpha = a;
      ctx.drawImage(s.g, x - G, y - G, G * 2, G * 2);
      if (s.big && a > 0.4) {
        const L = r * 14 * a;
        ctx.drawImage(flareSprite, x - L, y - L, L * 2, L * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  let glitchAt = -1e9; // no glitch band in the very first (or a paused) frame
  function night(t) {
    let current = -1;
    for (const p of pixels) {
      if (R() < 0.04) p.on = R();
      if (p.on < 0.55) continue;
      if (p.c !== current) {
        current = p.c;
        ctx.fillStyle = PIXEL_COLORS[current];
      }
      ctx.globalAlpha = 0.4 + R() * 0.6;
      ctx.fillRect(Math.round(p.x * W), Math.round(p.y * H), p.s, p.s);
    }
    ctx.globalAlpha = 1;
    if (t > glitchAt + 2600 && R() < 0.02) glitchAt = t;
    if (t - glitchAt < 140) {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = R() < 0.5 ? "rgba(255,42,79,.18)" : "rgba(25,227,240,.14)";
        ctx.fillRect(R() * W * 0.3, R() * H, W * (0.3 + R() * 0.7), 2 + R() * 14);
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    if (root.dataset.theme === "night") night(t);
    else day(t);
  }

  return {
    draw,
    resize,
    get width() {
      return W;
    },
    get height() {
      return H;
    },
  };
}

function createButterfly(el) {
  let mx = null;
  let my = null;
  let lastMove = -1e9;

  if (window.matchMedia("(pointer: fine)").matches) {
    addEventListener(
      "pointermove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        lastMove = performance.now();
      },
      { passive: true }
    );
    root.addEventListener("mouseleave", () => {
      mx = null;
    });
  }

  let fx = innerWidth * 0.15;
  let fy = innerHeight * 0.6;
  let vx = 0;
  let vy = 0;
  let angle = 0;

  return function update(t) {
    const W = innerWidth;
    const H = innerHeight;
    const following = mx !== null && t - lastMove < 4000; // idle 4s or touch device → wanders on its own
    let tx;
    let ty;
    if (following) {
      // hovers just off the cursor, circling a little
      tx = mx + 30 + Math.cos(t * 0.002) * 14;
      ty = my - 34 + Math.sin(t * 0.003) * 10;
    } else {
      tx = W * (0.5 + 0.38 * Math.sin(t * 0.00013));
      ty = H * (0.45 + 0.3 * Math.sin(t * 0.00021 + 1));
    }
    const k = following ? 0.03 : 0.008;
    vx = (vx + (tx - fx) * k) * 0.84;
    vy = (vy + (ty - fy) * k) * 0.84;
    fx += vx;
    fy += vy + Math.sin(t * 0.008) * 0.6; // little flutter bob
    angle += (Math.max(-35, Math.min(35, vx * 3)) - angle) * 0.1; // banks into turns
    el.style.transform = `translate3d(${fx}px,${fy}px,0) rotate(${angle}deg)`;
  };
}

export function initEffects() {
  const lowPower = isLowPower();
  root.classList.toggle("low-power", lowPower);

  const canvas = document.getElementById("fx");
  const flyEl = document.querySelector(".fly");
  const sparkles = canvas?.getContext ? createSparkles(canvas, lowPower) : null;
  const updateFly = flyEl ? createButterfly(flyEl) : null;

  let rafId = 0; // 0 = loop stopped
  let lastDraw = 0;
  const stillFrame = () => sparkles?.draw(0);

  function frame(t) {
    rafId = requestAnimationFrame(frame);
    updateFly?.(t);
    if (!sparkles || t - lastDraw < 33) return; // 30fps cap for the sparkle canvas
    lastDraw = t;
    sparkles.draw(t);
  }

  function setRunning(on) {
    if (on && !rafId) {
      rafId = requestAnimationFrame(frame);
    } else if (!on && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      stillFrame();
    }
  }

  if (sparkles) {
    let timer;
    addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Mobile URL bars resize the viewport on every scroll; ignore small
        // height-only changes rather than reallocating the canvas each time.
        if (innerWidth === sparkles.width && Math.abs(innerHeight - sparkles.height) < 120) return;
        sparkles.resize();
        if (!rafId) stillFrame();
      }, 150);
    });
    // While paused, redraw the still frame when the theme flips.
    new MutationObserver(() => {
      if (!rafId) stillFrame();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (motionEnabled()) setRunning(true);
  else stillFrame();
  onMotionChange(setRunning);
}
