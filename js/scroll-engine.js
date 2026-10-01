/**
 * MISHIKA MENDIRATTA PORTFOLIO — SCROLL & ANIMATION ENGINE
 * Supports:
 * 1. Image Sequence Scrubber (Multiple photos rendered on HTML5 Canvas)
 * 2. Video Scrubber (Smooth MP4/WebM scrubbing)
 * 3. Procedural Vector Scenery (Interactive parallax, smiling clouds, sweeping lighthouse)
 */

class ScrollAnimationEngine {
  constructor(config = {}) {
    this.config = Object.assign({
      mode: 'vector', // Defaulted to the illustrated vector world
      canvasId: 'scroll-canvas',
      videoId: 'scroll-video',
      vectorId: 'vector-stage'
    }, config);

    this.canvas = document.getElementById(this.config.canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.video = document.getElementById(this.config.videoId);
    this.vectorStage = document.getElementById(this.config.vectorId);

    this.activeMode = 'vector';
    this.scrollFraction = 0;
    this.isTicking = false;

    // Parallax DOM elements for Vector mode
    this.waveRipples = document.querySelectorAll('.wave-ripple');
    this.sparkles = document.querySelectorAll('.sparkle');
    this.hillsBg = document.querySelector('.layer-hills-bg');
    this.hillsFg = document.querySelector('.layer-hills-fg');

    this.init();
  }

  async init() {
    this.setupResize();
    this.setupScrollListener();
    if (this.vectorStage) this.vectorStage.style.display = 'block';
    this.updateScene(0);
    this.setupUIInteractions();
  }

  /* Detect whether user provided photos in sequence or a video */
  async detectMedia() {
    const badgeText = document.getElementById('badge-mode-text');
    
    // 1. Check if first image of sequence exists
    const testImgUrl = `${this.config.sequenceFolder}${this.config.sequencePrefix}0001${this.config.sequenceExt}`;
    const sequenceAvailable = await this.checkFileExists(testImgUrl);

    if (sequenceAvailable) {
      console.log('✨ Image sequence detected in assets/sequence! Activating Canvas scrubber.');
      this.activeMode = 'sequence';
      if (this.canvas) this.canvas.style.display = 'block';
      if (this.vectorStage) this.vectorStage.style.opacity = '0.15'; // subtle backdrop
      if (badgeText) badgeText.textContent = '📸 Image Sequence Active';
      this.preloadSequence();
      return;
    }

    // 2. Check if video file exists
    const videoAvailable = await this.checkFileExists(this.config.videoSrc);
    if (videoAvailable) {
      console.log('🎬 Video file detected in assets/video! Activating Video scrubber.');
      this.activeMode = 'video';
      if (this.video) {
        this.video.style.display = 'block';
        this.video.src = this.config.videoSrc;
        this.video.load();
      }
      if (this.vectorStage) this.vectorStage.style.opacity = '0.15';
      if (badgeText) badgeText.textContent = '🎥 Video Scrubber Active';
      return;
    }

    // 3. Fallback: Seán Halpin illustrated vector art mode
    console.log('🎨 Using Whimsical Illustrated Scene with Parallax.');
    this.activeMode = 'vector';
    if (this.vectorStage) this.vectorStage.style.display = 'block';
    if (badgeText) badgeText.textContent = '🎨 Illustrated Mode (Scroll to animate)';
  }

  checkFileExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /* Preload sequence of photos */
  preloadSequence() {
    for (let i = 1; i <= this.config.totalFrames; i++) {
      const frameNum = String(i).padStart(4, '0');
      const img = new Image();
      img.src = `${this.config.sequenceFolder}${this.config.sequencePrefix}${frameNum}${this.config.sequenceExt}`;
      img.onload = () => {
        this.imagesLoaded++;
        if (i === 1) this.renderCanvasFrame(0);
      };
      this.images.push(img);
    }
  }

  setupResize() {
    const handleResize = () => {
      if (!this.canvas) return;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
      if (this.activeMode === 'sequence') {
        this.renderCanvasFrame(this.currentFrameIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      if (!this.isTicking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          this.isTicking = false;
        });
        this.isTicking = true;
      }
    }, { passive: true });
  }

  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    this.scrollFraction = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

    this.updateScene(this.scrollFraction);

    // Navbar appearance
    const nav = document.querySelector('.main-nav');
    if (nav) {
      if (scrollTop > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  }

  updateScene(progress) {
    if (this.activeMode === 'sequence') {
      const frameIndex = Math.min(
        this.config.totalFrames - 1,
        Math.floor(progress * this.config.totalFrames)
      );
      if (frameIndex !== this.currentFrameIndex) {
        this.currentFrameIndex = frameIndex;
        this.renderCanvasFrame(frameIndex);
      }
    } else if (this.activeMode === 'video') {
      if (this.video && this.video.duration) {
        this.video.currentTime = progress * this.video.duration;
      }
    }

    // Always update parallax in vector mode (or as background layer)
    this.updateVectorParallax(progress);
  }

  renderCanvasFrame(index) {
    if (!this.ctx || !this.images[index] || !this.images[index].complete) return;
    const img = this.images[index];
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Cover math
    const imgRatio = img.width / img.height;
    const screenRatio = w / h;
    let renderW, renderH, offsetX, offsetY;

    if (screenRatio > imgRatio) {
      renderW = w;
      renderH = w / imgRatio;
      offsetX = 0;
      offsetY = (h - renderH) / 2;
    } else {
      renderW = h * imgRatio;
      renderH = h;
      offsetX = (w - renderW) / 2;
      offsetY = 0;
    }

    this.ctx.clearRect(0, 0, w, h);
    this.ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  updateVectorParallax(progress) {
    // 1. Wave Ripples Parallax
    if (this.waveRipples.length > 0) {
      this.waveRipples.forEach((ripple, idx) => {
        const offset = Math.sin((progress * 10) + idx) * 20;
        ripple.style.transform = `translateX(${offset}px)`;
      });
    }

    // 2. Parallax shift for hills
    if (this.hillsBg) {
      this.hillsBg.style.transform = `translateY(${progress * 40}px)`;
    }
    if (this.hillsFg) {
      this.hillsFg.style.transform = `translateY(${progress * 20}px)`;
    }
  }

  setupUIInteractions() {

    // Mobile Navigation Hamburger
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });

      // Close menu on link click
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
        });
      });
    }
  }
}

// Instantiate engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollEngine = new ScrollAnimationEngine();
});
