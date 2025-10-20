// Basic scaffold: name param, music toggle, and intro wiring placeholder

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function setRecipientName() {
  const el = document.getElementById('recipient-name');
  if (!el) return;
  const param = getQueryParam('to');
  const name = param ? decodeURIComponent(param) : 'Lê Minh Anh';
  el.textContent = name;
}

function setupMusic() {
  const audio = document.getElementById('bg-audio');
  if (!audio) return;

  let isPlaying = false;
  let hasStarted = false;

  const safePlay = async () => {
    try {
      await audio.play();
      isPlaying = true;
      hasStarted = true;
    } catch (e) {
      // Autoplay blocked until user interaction
    }
  };

  // Start music on first user interaction (ribbon click or any click)
  const startMusic = () => {
    if (!hasStarted) {
      safePlay();
    }
  };

  // Listen for ribbon reveal
  document.addEventListener('click', startMusic, { once: true, passive: true });
  
  // Also start on any user interaction
  document.addEventListener('touchstart', startMusic, { once: true, passive: true });
  document.addEventListener('keydown', startMusic, { once: true, passive: true });
}

function setupIntro() {
  const overlay = document.getElementById('intro-overlay');
  const handle = document.getElementById('ribbon-handle');
  if (!overlay || !handle) return;

  const open = () => {
    // Activate watermark heart and confetti, then fade overlay
    startWatermark();
    startConfetti();
    overlay.style.transition = 'opacity 600ms ease';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 650);
  };

  handle.addEventListener('click', open);
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setRecipientName();
  setupMusic();
  setupIntro();
  setupSlideshow();
});

// Watermark heart control
function startWatermark() {
  const root = document.documentElement;
  root.classList.add('wm-active');
  // ensure visible state only; no rotation
  setTimeout(() => { root.classList.add('wm-rotate'); }, 50);

  // build 3D heart slices once
  buildHeart3D();
  // add sparkles overlay
  buildSparkles();
}

function buildHeart3D() {
  const container = document.getElementById('heart-3d');
  if (!container || container.childElementCount) return;
  const slices = 54; // larger, thicker diamond
  const depth = 0.7; // thin steps but more layers
  for (let i = 0; i < slices; i++) {
    const slice = document.createElement('div');
    slice.className = 'slice' + (i === Math.floor(slices * 0.35) ? ' highlight' : '');
    const tz = (i - slices / 2) * depth;
    slice.style.transform = `translateZ(${tz}px)`;
    slice.style.setProperty('--depthRatio', (i / (slices - 1)).toFixed(3));
    container.appendChild(slice);
  }
  const edge = document.createElement('div');
  edge.className = 'edge';
  container.appendChild(edge);
}

function buildSparkles() {
  const layer = document.getElementById('heart-sparkles');
  if (!layer || layer.childElementCount) return;
  const sparkleCount = 18;
  for (let i = 0; i < sparkleCount; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    // random positions roughly within heart bounds
    const x = 20 + Math.random() * 60; // 20%..80%
    const y = 10 + Math.random() * 70; // 10%..80%
    s.style.left = x + '%';
    s.style.top = y + '%';
    s.style.animationDelay = (Math.random() * 2.5).toFixed(2) + 's';
    s.style.transformOrigin = 'center';
    layer.appendChild(s);
  }
}

// Simple confetti system
function startConfetti() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const colors = ['#ff6f9c', '#ffd2e1', '#f4c06a', '#ffffff'];
  const TAU = Math.PI * 2;
  const particles = [];
  const PARTICLE_COUNT = Math.max(120, Math.min(240, Math.floor(width / 8)));

  function resetParticle(p) {
    p.x = Math.random() * width;
    p.y = -10 - Math.random() * height;
    p.vx = (Math.random() - 0.5) * 0.6;
    p.vy = 1.2 + Math.random() * 2.4;
    p.size = 4 + Math.random() * 6;
    p.color = colors[(Math.random() * colors.length) | 0];
    p.rot = Math.random() * TAU;
    p.rotSpeed = (Math.random() - 0.5) * 0.1;
    p.shape = Math.random(); // 0..1: rect/triangle/circle mix
    return p;
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(resetParticle({}));

  let rafId;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx + Math.sin((p.y + i) * 0.01) * 0.3;
      p.y += p.vy;
      p.rot += p.rotSpeed;

      if (p.y - p.size > height) resetParticle(p);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape < 0.33) {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
      } else if (p.shape < 0.66) {
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.6);
        ctx.lineTo(p.size * 0.6, p.size * 0.6);
        ctx.lineTo(-p.size * 0.6, p.size * 0.6);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    rafId = requestAnimationFrame(draw);
  }

  function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', onResize);
  draw();
}

// Slideshow functionality
function setupSlideshow() {
  const playBtn = document.getElementById('slideshow-play');
  const modal = document.getElementById('slideshow-modal');
  const closeBtn = document.getElementById('slideshow-close');
  const backdrop = modal?.querySelector('[data-close]');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const indicators = modal?.querySelectorAll('.indicator');
  const slideImage = document.getElementById('slide-image');

  if (!playBtn || !modal || !slideImage) return;

  // Image paths - assuming images are named image1.jpg, image2.jpg, etc.
  const images = [
    'assets/images/photo1.jpg',
    'assets/images/photo2.jpg',
    'assets/images/photo3.jpg',
    'assets/images/photo4.jpg',
    'assets/images/photo5.jpg',
    'assets/images/photo6.jpg'
  ];

  let currentSlide = 0;
  let autoPlayInterval = null;
  let isPlaying = false;
  let resumeTimeout = null;

  function showSlide(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    currentSlide = index;
    slideImage.src = images[currentSlide];

    // Update indicators
    indicators?.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(nextSlide, 1500); // 3 seconds per slide
    isPlaying = true;
  }

  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
    }
    isPlaying = false;
  }

  function scheduleResume(delayMs = 5000) {
    if (resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => {
      if (!modal.hidden && !isPlaying) startAutoPlay();
    }, delayMs);
  }

  function openSlideshow() {
    modal.hidden = false;
    showSlide(0);
    startAutoPlay();
    document.body.style.overflow = 'hidden';
  }

  function closeSlideshow() {
    modal.hidden = true;
    stopAutoPlay();
    if (resumeTimeout) clearTimeout(resumeTimeout);
    document.body.style.overflow = '';
  }

  // Event listeners
  playBtn.addEventListener('click', openSlideshow);
  closeBtn?.addEventListener('click', closeSlideshow);
  backdrop?.addEventListener('click', closeSlideshow);
  prevBtn?.addEventListener('click', () => {
    prevSlide();
    stopAutoPlay();
    scheduleResume();
  });
  nextBtn?.addEventListener('click', () => {
    nextSlide();
    stopAutoPlay();
    scheduleResume();
  });

  // Indicator clicks
  indicators?.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      showSlide(index);
      stopAutoPlay();
      scheduleResume();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;

    switch (e.key) {
      case 'Escape':
        closeSlideshow();
        break;
      case 'ArrowLeft':
        prevSlide();
        stopAutoPlay();
        scheduleResume();
        break;
      case 'ArrowRight':
        nextSlide();
        stopAutoPlay();
        scheduleResume();
        break;
      case ' ':
        e.preventDefault();
        if (isPlaying) {
          stopAutoPlay();
          scheduleResume();
        } else startAutoPlay();
        break;
    }
  });

  // Pause on hover, resume on leave
  const slideWrapper = modal.querySelector('.slide-wrapper');
  slideWrapper?.addEventListener('mouseenter', () => { stopAutoPlay(); });
  slideWrapper?.addEventListener('mouseleave', () => { scheduleResume(1000); });
}


