const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
   Ambient node-graph canvas: drifting dots with faint connections,
   echoing embedding/vector-search space.
--------------------------------------------------------------- */
(function nodeField() {
  const canvas = document.getElementById('nodeField');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width, height, nodes;
  const DENSITY = 18000; // px^2 per node — keep it sparse
  const LINK_DIST = 130;
  const PALETTE = [
    [180, 170, 255], // violet
    [232, 170, 255], // pink
    [150, 230, 255], // cyan
    [180, 245, 220], // mint
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = Math.min(window.innerHeight * 1.1, 900);
    const count = Math.max(18, Math.floor((width * height) / DENSITY));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const [r, g, bch] = a.color;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${bch}, ${0.14 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    nodes.forEach((n) => {
      const [r, g, b] = n.color;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.65)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.7, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(step);
})();

/* ---------------------------------------------------------------
   Mobile nav toggle
--------------------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinksEl.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------------
   Scroll-to-reveal
--------------------------------------------------------------- */
const revealTargets = document.querySelectorAll('.reveal-el');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('in-view'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach((el, i) => {
    if (el.classList.contains('mini-card') || el.classList.contains('card')) {
      el.style.transitionDelay = `${(i % 3) * 0.07}s`;
    }
    revealObserver.observe(el);
  });
}

/* ---------------------------------------------------------------
   Active nav-link highlighting
--------------------------------------------------------------- */
const navLinks = document.querySelectorAll('.nav-links a[data-nav]');
const sections = Array.from(navLinks)
  .map((link) => document.getElementById(link.dataset.nav))
  .filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`.nav-links a[data-nav="${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => navObserver.observe(section));
}
