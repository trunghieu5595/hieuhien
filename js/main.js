/**
 * メインロジック — 全体の流れを制御
 */

(() => {
  'use strict';

  // ===== DOM =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const loadingScreen = $('#loading-screen');
  const introScreen = $('#intro-screen');
  const celebrationScreen = $('#celebration-screen');
  const mainContent = $('#main-content');
  const musicToggle = $('#music-toggle');
  const musicGate = $('#music-gate');
  const particleCanvas = $('#particle-canvas');

  let particles = null;
  let noHoverCount = 0;
  let carouselIndex = 0;
  let heartClickCount = 0;
  let lastWishIndex = -1;
  let appStarted = false;

  // ===== ユーティリティ =====

  /** タイピングエフェクト（既存テキストに追記も可能） */
  function typeText(element, text, speed = 45, startFrom = 0) {
    return new Promise((resolve) => {
      const prefix = text.slice(0, startFrom);
      const toType = text.slice(startFrom);
      element.textContent = prefix;
      let i = 0;
      const tick = () => {
        if (i < toType.length) {
          element.textContent = prefix + toType.slice(0, i + 1);
          i++;
          setTimeout(tick, speed);
        } else {
          resolve();
        }
      };
      tick();
    });
  }

  /** 複数行を順番にタイピング */
  async function typeLines(element, lines, speed = 45, pause = 600) {
    element.textContent = '';
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        element.textContent += '\n';
        await sleep(pause);
      }
      const base = element.textContent;
      await typeText(element, base + lines[i], speed, base.length);
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function showScreen(screen) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    screen.classList.add('active');
  }

  function randomCaption() {
    const caps = CONFIG.carouselCaptions;
    return caps[Math.floor(Math.random() * caps.length)];
  }

  // ===== 音楽ゲート =====
  function setupMusicGate() {
    const btn = $('#gate-start');

    btn.addEventListener('click', async () => {
      if (appStarted) return;
      btn.disabled = true;
      btn.textContent = 'Đang mở...';

      const ok = await softMusic.start();
      if (!ok) {
        btn.disabled = false;
        btn.textContent = '🎵 Bật nhạc & Bắt đầu';
        return;
      }

      appStarted = true;
      document.body.classList.remove('gate-locked');
      document.body.classList.add('unlocked');
      updateMusicUI(true);
      musicToggle.classList.add('visible');
      setupMusic();

      musicGate.classList.add('fade-out');
      await sleep(1000);
      musicGate.classList.remove('active');

      await runLoading();
    });
  }

  // ===== ローディング =====
  async function runLoading() {
    if (!particles) {
      particles = new ParticleSystem(particleCanvas);
      particles.start();
    }

    showScreen(loadingScreen);
    await sleep(2200);
    loadingScreen.classList.remove('active');
    showScreen(introScreen);
    await runIntro();
  }

  // ===== イントロ =====
  async function runIntro() {
    const line1 = $('#intro-line1');
    const line2 = $('#intro-line2');
    const buttons = $('#question-buttons');

    await typeLines(line1, [
      'Hôm nay trước khi đi ngủ...',
      'Anh muốn hỏi em một câu nho nhỏ.',
    ], 42, 400);

    await sleep(1200);

    line2.classList.remove('hidden');
    await typeText(line2, 'Em có yêu anh không? 🥺👉👈', 50);

    await sleep(400);
    buttons.classList.remove('hidden');
    setupQuestionButtons();
  }

  // ===== 質問ボタン =====
  function setupQuestionButtons() {
    const btnYes = $('#btn-yes');
    const btnNo = $('#btn-no');
    const noMessage = $('#no-message');
    const container = $('.question-buttons');

    // 「Có」ボタン
    btnYes.addEventListener('click', () => runCelebration());

    // 「Không」ボタン — 逃げる
    const dodge = (e) => {
      e.preventDefault();
      e.stopPropagation();

      noHoverCount++;
      const msgIndex = Math.min(noHoverCount - 1, CONFIG.noButtonMessages.length - 1);
      noMessage.classList.remove('hidden');
      noMessage.textContent = CONFIG.noButtonMessages[msgIndex];

      btnNo.classList.add('dodging');
      setTimeout(() => btnNo.classList.remove('dodging'), 400);

      // 8回以上で縮小→消滅
      if (noHoverCount >= 8) {
        const shrinkLevel = Math.min((noHoverCount - 7) * 0.15, 1);
        btnNo.style.transform = `scale(${1 - shrinkLevel * 0.8})`;
        btnNo.style.opacity = String(1 - shrinkLevel);
        if (noHoverCount >= 10) {
          btnNo.style.display = 'none';
          noMessage.textContent = 'Thôi, anh biết câu trả lời rồi 😌';
          return;
        }
      }

      // ランダム位置（画面内）
      const rect = container.getBoundingClientRect();
      const btnRect = btnNo.getBoundingClientRect();
      const maxX = window.innerWidth - btnRect.width - 20;
      const maxY = window.innerHeight - btnRect.height - 20;

      let newX, newY, attempts = 0;
      do {
        newX = 10 + Math.random() * maxX;
        newY = 10 + Math.random() * maxY;
        attempts++;
      } while (
        attempts < 20 &&
        Math.abs(newX - btnRect.left) < 80 &&
        Math.abs(newY - btnRect.top) < 60
      );

      btnNo.style.position = 'fixed';
      btnNo.style.left = `${newX}px`;
      btnNo.style.top = `${newY}px`;
      btnNo.style.zIndex = '200';
    };

    btnNo.addEventListener('mouseenter', dodge);
    btnNo.addEventListener('touchstart', dodge, { passive: false });

    // タッチデバイス用：近づいたら逃げる
    document.addEventListener('touchmove', (e) => {
      if (!btnNo.offsetParent && btnNo.style.display === 'none') return;
      const touch = e.touches[0];
      const rect = btnNo.getBoundingClientRect();
      const dist = Math.hypot(
        touch.clientX - (rect.left + rect.width / 2),
        touch.clientY - (rect.top + rect.height / 2)
      );
      if (dist < 80) dodge(e);
    }, { passive: false });
  }

  // ===== セレブレーション =====
  async function runCelebration() {
    document.body.classList.add('celebrating');
    showScreen(celebrationScreen);

    particles.burstHearts(40);
    particles.burstConfetti(60);

    const text = $('#celebration-text');
    const lines = [
      'Anh biết mà... ❤️',
      'Cảm ơn em vì đã xuất hiện trong cuộc đời anh.',
      'Anh yêu em nhiều lắm.',
    ];

    for (const line of lines) {
      await typeText(text, line, 48);
      await sleep(1500);
    }

    await sleep(800);
    celebrationScreen.classList.remove('active');
    celebrationScreen.style.display = 'none';

    mainContent.classList.remove('hidden');
    mainContent.classList.add('visible');
    $('#scroll-hint').classList.remove('hidden');

    buildScenes();
    setupSceneObserver();
    setupEasterEgg();

    setTimeout(() => $('#scroll-hint').classList.add('hidden'), 5000);
  }

  // ===== シーン構築 =====
  function buildScenes() {
    buildScene1();
    buildTimeline();
    buildCarousel();
    setupChoiceButtons();
    startCounter();
    setupWishJar();
    setupEndingObserver();
  }

  // Scene 1
  function buildScene1() {
    const grid = $('#scene1-photos');
    CONFIG.scene1Photos.forEach((photo, i) => {
      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid';
      polaroid.style.setProperty('--delay', `${i * 0.5}s`);

      const imgWrap = document.createElement('div');
      imgWrap.className = 'polaroid-img';

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.onerror = () => {
        img.remove();
        imgWrap.textContent = '💕';
      };
      imgWrap.appendChild(img);

      const cap = document.createElement('p');
      cap.className = 'polaroid-caption';
      cap.textContent = photo.caption || '';

      polaroid.appendChild(imgWrap);
      polaroid.appendChild(cap);
      grid.appendChild(polaroid);
    });
  }

  // Scene 2
  function buildTimeline() {
    const timeline = $('#timeline');
    CONFIG.timeline.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'timeline-item';
      el.innerHTML = `
        <div class="timeline-icon">${item.icon}</div>
        <span class="timeline-label">${item.label}</span>
      `;
      el.addEventListener('click', () => {
        el.classList.add('bounce');
        setTimeout(() => el.classList.remove('bounce'), 400);
      });
      timeline.appendChild(el);
    });
  }

  // Scene 3
  function buildCarousel() {
    const track = $('#carousel-track');
    const dots = $('#carousel-dots');

    CONFIG.carouselPhotos.forEach((photo, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.onerror = () => {
        const ph = document.createElement('div');
        ph.className = 'placeholder-img';
        ph.textContent = '🌸';
        slide.innerHTML = '';
        slide.appendChild(ph);
      };
      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Ảnh ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dots.appendChild(dot);
    });

    updateCarouselCaption();
    $('.carousel-prev').addEventListener('click', () => goToSlide(carouselIndex - 1));
    $('.carousel-next').addEventListener('click', () => goToSlide(carouselIndex + 1));

    // 自動スライド（5秒ごと）
    let autoTimer = setInterval(() => goToSlide(carouselIndex + 1), 5000);
    const carouselEl = $('.scene-3');
    const pauseAuto = () => clearInterval(autoTimer);
    carouselEl.addEventListener('touchstart', pauseAuto, { once: true });
    carouselEl.addEventListener('click', pauseAuto, { once: true });

    // スワイプ対応
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(carouselIndex + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  function goToSlide(index) {
    const total = CONFIG.carouselPhotos.length;
    carouselIndex = ((index % total) + total) % total;
    $('#carousel-track').style.transform = `translateX(-${carouselIndex * 100}%)`;
    $$('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
    updateCarouselCaption();
  }

  function updateCarouselCaption() {
    const cap = $('#carousel-caption');
    cap.style.opacity = '0';
    setTimeout(() => {
      cap.textContent = randomCaption();
      cap.style.opacity = '1';
      cap.style.transition = 'opacity 0.4s ease';
    }, 200);
  }

  // Scene 4 — 手紙（Intersection Observerで開始）
  function startLetterTyping() {
    const container = $('#letter-content');
    if (container.dataset.started) return;
    container.dataset.started = 'true';

    CONFIG.letterLines.forEach((line, i) => {
      const el = document.createElement('p');
      el.className = 'letter-line';
      el.dataset.text = line;
      container.appendChild(el);
    });

    const lines = container.querySelectorAll('.letter-line');
    let delay = 0;
    lines.forEach((line, i) => {
      setTimeout(async () => {
        line.classList.add('typing');
        await typeText(line, line.dataset.text, 38);
        line.classList.remove('typing');
        line.classList.add('visible');
      }, delay);
      delay += line.dataset.text.length * 38 + 400;
    });
  }

  // Scene 5
  function setupChoiceButtons() {
    $$('.btn-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const result = $('#choice-result');
        result.classList.remove('hidden');
        result.textContent = '❤️ Quyết định đúng đắn rồi đó 😌';
        particles.burstHearts(25);
        particles.burstConfetti(30);
      });
    });
  }

  // Scene 6 — カウンター
  function startCounter() {
    const start = new Date(CONFIG.startDate);

    function update() {
      const now = new Date();
      const diff = now - start;
      if (diff < 0) return;

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      $('#count-days').textContent = days;
      $('#count-hours').textContent = hours;
      $('#count-minutes').textContent = minutes;
      $('#count-seconds').textContent = seconds;
    }

    update();
    setInterval(update, 1000);
  }

  // Scene 7 — 願い瓶
  function setupWishJar() {
    const jar = $('#wish-jar');
    const msg = $('#wish-message');

    jar.addEventListener('click', () => {
      jar.classList.add('shake');
      setTimeout(() => jar.classList.remove('shake'), 500);

      let idx;
      do {
        idx = Math.floor(Math.random() * CONFIG.wishMessages.length);
      } while (idx === lastWishIndex && CONFIG.wishMessages.length > 1);
      lastWishIndex = idx;

      msg.classList.remove('hidden');
      msg.textContent = CONFIG.wishMessages[idx];
      msg.style.animation = 'none';
      void msg.offsetWidth;
      msg.style.animation = '';

      particles.burstHearts(8);
    });
  }

  // ===== シーン表示アニメーション =====
  function setupSceneObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.dataset.scene === '4') startLetterTyping();
          }
        });
      },
      { threshold: 0.25 }
    );

    $$('.scene').forEach((scene) => observer.observe(scene));
  }

  // ===== エンディング =====
  function setupEndingObserver() {
    const ending = $('.scene-ending');
    let started = false;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          await runEnding();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ending);
  }

  async function runEnding() {
    document.body.classList.add('night-mode');
    $('#scroll-hint')?.classList.add('hidden');

    const endingText = $('#ending-text');
    const lines = [
      'Muộn rồi...',
      'Đi ngủ thôi nha bé.',
      'Chúc em có một giấc mơ thật đẹp.',
      'Và nhớ là...',
      'Anh yêu em rất nhiều. ❤️',
    ];

    endingText.textContent = '';
    for (const line of lines) {
      const prev = endingText.textContent;
      if (prev) endingText.textContent = prev + '\n';
      const base = endingText.textContent;
      await typeText(endingText, base + line, 45, base.length);
      await sleep(1200);
    }

    await sleep(600);
    $('#goodnight-title').classList.remove('hidden');
    $('#beating-heart').classList.remove('hidden');
  }

  // ===== 音楽トグル =====
  function updateMusicUI(playing) {
    musicToggle.classList.toggle('playing', playing);
    musicToggle.querySelector('.music-icon').textContent = playing ? '🎶' : '🎵';
    musicToggle.querySelector('.music-hint')?.classList.add('hidden');
  }

  function setupMusic() {
    musicToggle.addEventListener('click', async (e) => {
      e.stopPropagation();
      const playing = await softMusic.toggle();
      updateMusicUI(playing);
    });
  }

  // ===== イースターエッグ =====
  function setupEasterEgg() {
    const heart = $('#beating-heart');
    const popup = $('#easter-egg');

    heart.addEventListener('click', () => {
      heartClickCount++;
      particles.burstHearts(5);

      if (heartClickCount >= 10) {
        popup.classList.remove('hidden');
        popup.classList.add('show');
        particles.burstHearts(30);
        heartClickCount = 0;
      }
    });

    $('#close-easter-egg').addEventListener('click', () => {
      popup.classList.remove('show');
      setTimeout(() => popup.classList.add('hidden'), 400);
      particles.burstHearts(15);
    });
  }

  // ===== スクロールでヒント非表示 =====
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      $('#scroll-hint')?.classList.add('hidden');
    }
  }, { passive: true });

  // ===== 開始 =====
  document.addEventListener('DOMContentLoaded', () => {
    setupMusicGate();
  });
})();
