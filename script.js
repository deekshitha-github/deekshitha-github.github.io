// ══════════════════════════════════════════════
// ASSET LOADER
// ══════════════════════════════════════════════

const probeAsset = (url) =>
  fetch(url, { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);

const resolveAsset = async (baseName, exts) => {
  for (const ext of exts) {
    const url = `assets/${baseName}.${ext}`;
    if (await probeAsset(url)) return url;
  }
  return null;
};

// ── Profile image ──────────────────────────────
const loadProfile = async () => {
  const img = document.getElementById('profile-img');
  const fallback = document.getElementById('img-fallback');
  if (!img) return;

  const url = await resolveAsset('profile', ['jpg', 'jpeg', 'png', 'webp']);
  if (url) {
    img.src = url;
    img.onload = () => {
      img.classList.add('loaded');
      fallback.classList.add('hidden');
    };
  }
};

// ── CV download link ───────────────────────────
const loadCV = async () => {
  const link = document.getElementById('cv-link');
  if (!link) return;

  const exists = await probeAsset('assets/cv.pdf');
  if (exists) {
    link.href = 'assets/cv.pdf';
  } else {
    link.style.opacity = '0.45';
    link.title = 'CV not found — add assets/cv.pdf';
    link.removeAttribute('download');
    link.href = '#';
  }
};

// ── Carousel project images ────────────────────
const loadCarouselImages = async () => {
  const slides = document.querySelectorAll('.carousel-slide[data-asset]');
  await Promise.all([...slides].map(async (slide) => {
    const baseName = slide.dataset.asset;
    const img = slide.querySelector('.p-img');
    const placeholder = slide.querySelector('.p-img-placeholder');
    const url = await resolveAsset(baseName, ['jpg', 'jpeg', 'png', 'webp']);
    if (url && img) {
      img.src = url;
      img.onload = () => {
        img.classList.add('loaded');
        if (placeholder) placeholder.classList.add('hidden');
      };
    }
  }));
};

// ══════════════════════════════════════════════
// CAROUSEL LOGIC
// click once → start auto-sliding every 1.5s
// double-click → pause/freeze on current slide
// ══════════════════════════════════════════════
const initCarousels = () => {
  const carousels = document.querySelectorAll('.p-carousel');

  carousels.forEach(carousel => {
    const projectId = carousel.dataset.project;
    const track = document.getElementById(`carousel-${projectId}`);
    const hint = document.getElementById(`hint-${projectId}`);
    const status = document.getElementById(`status-${projectId}`);
    const dotsContainer = document.getElementById(`dots-${projectId}`);
    const dots = dotsContainer ? [...dotsContainer.querySelectorAll('.dot')] : [];
    const slides = carousel.querySelectorAll('.carousel-slide');
    const total = slides.length;

    let currentIdx = 0;
    let intervalId = null;
    let isRunning = false;
    let isPaused = false;
    let clickTimer = null;

    const goTo = (idx) => {
      currentIdx = (idx + total) % total;
      track.style.transform = `translateX(-${currentIdx * (100 / total)}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIdx));
    };

    const startSliding = () => {
      if (intervalId) clearInterval(intervalId);
      isRunning = true;
      isPaused = false;
      hint.classList.add('hidden');
      status.textContent = '▶ playing';
      status.classList.add('visible');
      intervalId = setInterval(() => {
        goTo(currentIdx + 1);
      }, 1500);
    };

    const pauseSliding = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
      isRunning = false;
      isPaused = true;
      status.textContent = '⏸ paused';
      status.classList.add('visible');
      // Auto-hide status after 2s
      setTimeout(() => { if (isPaused) status.classList.remove('visible'); }, 2000);
    };

    // Single click → start; if already running, advance one step
    // Double click → pause
    carousel.addEventListener('click', (e) => {
      // debounce double-click
      if (clickTimer) {
        // second click = double-click
        clearTimeout(clickTimer);
        clickTimer = null;
        if (isRunning) {
          pauseSliding();
        }
        return;
      }

      clickTimer = setTimeout(() => {
        clickTimer = null;
        if (!isRunning) {
          startSliding();
        } else {
          // single click while running → advance manually
          goTo(currentIdx + 1);
        }
      }, 220);
    });

    // Also open lightbox on double-click if image is loaded
    carousel.addEventListener('dblclick', (e) => {
      const activeSlide = slides[currentIdx];
      const img = activeSlide.querySelector('.p-img.loaded');
      if (img) {
        openLightbox(img.src, img.alt);
      }
    });
  });
};

// ══════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════
const openLightbox = (src, caption) => {
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  lbImg.src = src;
  lbCaption.textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
};

const initLightbox = () => {
  const overlay = document.getElementById('lb-overlay');
  const closeBtn = document.getElementById('lb-close');
  if (overlay) overlay.addEventListener('click', closeLightbox);
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
};

// ══════════════════════════════════════════════
// TYPING EFFECT
// ══════════════════════════════════════════════
const fn_t = () => {
  const el = document.getElementById('t-eff');
  const wrds = ["AI Engineer", "ML Enthusiast", "Algorithm Expert", "Problem Solver"];
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  let w_idx = 0;

  const dec = () => {
    const w = wrds[w_idx];
    let iter = 0;
    const int = setInterval(() => {
      el.innerText = w.split('').map((l, idx) => {
        if (idx < iter) return l;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= w.length) {
        clearInterval(int);
        setTimeout(() => { w_idx = (w_idx + 1) % wrds.length; dec(); }, 2500);
      }
      iter += 1 / 3;
    }, 30);
  };
  dec();
};

// ══════════════════════════════════════════════
// 3D MOUSE PARALLAX
// ══════════════════════════════════════════════
const fn_m = () => {
  document.querySelectorAll('.gl').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / 15;
      const y = -(e.clientY - r.top - r.height / 2) / 15;
      c.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`;
    });
    c.addEventListener('mouseleave', () => {
      c.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });
};

// ══════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════
const fn_o = () => {
  const obs = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = 1;
        e.target.style.transform = 'translateY(0)';
        e.target.style.filter = 'blur(0px)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(s => {
    s.style.opacity = 0;
    s.style.transform = 'translateY(40px)';
    s.style.filter = 'blur(5px)';
    s.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    obs.observe(s);
  });
};

// ══════════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════════
const fn_s = () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
};

// ══════════════════════════════════════════════
// CONTACT FORM
// ══════════════════════════════════════════════
const fn_f = () => {
  const f = document.getElementById('f1');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = f.querySelector('button');
    btn.textContent = 'Message Sent!';
    btn.style.background = 'var(--ac)';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.style.color = '';
      f.reset();
    }, 3000);
  });
};

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadCV();
  loadCarouselImages();

  initCarousels();
  initLightbox();

  fn_t();
  fn_m();
  fn_o();
  fn_s();
  fn_f();
});
