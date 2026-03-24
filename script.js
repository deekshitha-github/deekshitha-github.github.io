// ══════════════════════════════════════════════
// ASSET LOADER
// Tries each extension in order and loads the
// first one that exists from the assets/ folder.
//
// Expected file names:
//   assets/profile.jpg   (or .png / .webp)
//   assets/cv.pdf
//   assets/project1.jpg  (or .png / .webp)
//   assets/project2.jpg  (or .png / .webp)
//   assets/project3.jpg  (or .png / .webp)
// ══════════════════════════════════════════════

// Probe a URL — resolves true if the server
// returns a non-404 response (no data downloaded).
const probeAsset = (url) =>
  fetch(url, { method: 'HEAD' })
    .then(r => r.ok)
    .catch(() => false);

// Try each extension in sequence; return the
// first URL that resolves, or null if none found.
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
  // If no file found, fallback "DY" stays visible automatically
};

// ── CV download link ───────────────────────────
const loadCV = async () => {
  const link = document.getElementById('cv-link');
  if (!link) return;

  const exists = await probeAsset('assets/cv.pdf');
  if (exists) {
    link.href = 'assets/cv.pdf';
  } else {
    // Dim the button subtly to signal the file isn't there yet
    link.style.opacity = '0.45';
    link.title = 'CV not found — add assets/cv.pdf';
    link.removeAttribute('download');
    link.href = '#';
  }
};

// ── Project images ─────────────────────────────
const loadProjectImages = async () => {
  const imgs = document.querySelectorAll('img[data-asset]');
  await Promise.all([...imgs].map(async (img) => {
    const baseName = img.dataset.asset;
    const placeholder = img.nextElementSibling; // .p-img-placeholder
    const url = await resolveAsset(baseName, ['jpg', 'jpeg', 'png', 'webp']);
    if (url) {
      img.src = url;
      img.onload = () => {
        img.classList.add('loaded');
        if (placeholder) placeholder.classList.add('hidden');
      };
    }
    // If no file found, placeholder text stays visible
  }));
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
// INIT — run everything on DOM ready
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Asset loading runs in parallel — no blocking
  loadProfile();
  loadCV();
  loadProjectImages();

  fn_t();
  fn_m();
  fn_o();
  fn_s();
  fn_f();
});
