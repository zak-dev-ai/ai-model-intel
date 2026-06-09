// Sponsor Carousel — shared across all pages
// Rotates 3 sponsor slots every 20s. Loads live data from /api/sponsorship/active.
(() => {
  const SLIDE_INTERVAL = 20000;
  let sponsorSlots = [null, null, null];
  let currentSlide = 0;
  let carouselTimer = null;
  let carouselPaused = false;

  function getSponsorUrl(index) {
    const s = sponsorSlots[index];
    if (s && s.website_url) return s.website_url;
    return '/sponsor';
  }

  async function loadSponsors() {
    try {
      const res = await fetch('/api/sponsorship/active');
      if (!res.ok) { renderCarousel(); startCarousel(); return; }
      const data = await res.json();
      const arr = Array.isArray(data.sponsorships) ? data.sponsorships : [];
      sponsorSlots = [arr[0] || null, arr[1] || null, arr[2] || null];
      renderCarousel();
      startCarousel();
    } catch(e) {
      renderCarousel();
      startCarousel();
    }
  }

  function renderCarousel() {
    const container = document.getElementById('sponsorCarousel');
    if (!container) return;

    container.innerHTML = sponsorSlots.map((s, i) => {
      const url = s && s.website_url ? s.website_url : '/sponsor';
      if (s) {
        const logoUrl = s.logo_url || `https://www.google.com/s2/favicons?domain=${(s.website_url||'').replace(/https?:\\/\\//,'').replace(/\\/.*$/,'')}&sz=64`;
        return `<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="${i}" onclick="window.open('${url}','_blank')">
          <div class="absolute top-0 right-0 bg-matrix-green text-deep-charcoal text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">SPONSORED</div>
          <div>
            <div class="font-data-label text-data-label text-primary uppercase">Featured</div>
            <div class="font-data-tabular text-body-lg text-on-surface font-bold leading-tight mt-1 truncate">${s.model_name || ''}</div>
            <div class="text-text-muted text-[10px] mt-0.5 truncate">${s.company_name || ''}</div>
          </div>
          <div class="flex items-center justify-between w-full mt-1">
            <span class="font-data-tabular text-[10px] text-text-muted">${s.company_name || ''}</span>
            <span class="text-matrix-green font-bold text-[10px]">Learn More →</span>
          </div>
        </div>`;
      } else {
        const copies = [
          { badge:'SLOT 1', h:'Advertise Here', s:'Reach 10K+ AI engineers daily', cta:'Claim Slot →' },
          { badge:'SLOT 2', h:'Get Featured', s:'Prime placement for 30 days', cta:'Go Live →' },
          { badge:'SLOT 3', h:'Your Brand Here', s:'CTOs, devs & founders see this', cta:'Sponsor Now →' }
        ];
        const c = copies[i % 3];
        return `<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="${i}" onclick="window.location.href='/sponsor'">
          <div class="absolute top-0 right-0 bg-primary/20 text-on-surface text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">${c.badge}</div>
          <div>
            <div class="font-data-label text-data-label text-primary uppercase">Featured</div>
            <div class="font-data-tabular text-body-lg text-on-surface font-bold leading-tight mt-1 truncate">${c.h}</div>
            <div class="text-text-muted text-[10px] mt-0.5">${c.s}</div>
          </div>
          <div class="flex items-center justify-between w-full mt-1">
            <span class="font-data-tabular font-bold text-on-surface text-[11px]">$99/30d</span>
            <span class="text-primary font-bold text-[10px]">${c.cta}</span>
          </div>
        </div>`;
      }
    }).join('');

    showSlide(0, false);
  }

  function showSlide(index, animate = true) {
    const slides = document.querySelectorAll('#sponsorCarousel .carousel-slide');
    if (!slides.length) return;
    slides.forEach((el, i) => {
      el.classList.remove('carousel-slide-active', 'carousel-slide-inactive');
      if (!animate) el.style.transition = 'none';
      el.classList.add(i === index ? 'carousel-slide-active' : 'carousel-slide-inactive');
      if (!animate) setTimeout(() => el.style.transition = '', 50);
    });
    currentSlide = index;
    updateDots(index);
    updateLabel(index);
    if (animate) resetProgress();
  }

  function nextSlide() {
    let next = (currentSlide + 1) % 3;
    const start = next;
    while (!sponsorSlots[next] && (next = (next + 1) % 3) !== start) {}
    showSlide(next);
  }

  function updateDots(index) {
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function updateLabel(index) {
    const label = document.getElementById('carouselLabel');
    if (!label) return;
    if (sponsorSlots[index]) {
      label.textContent = 'SPONSORED';
      label.className = 'font-data-label text-[8px] text-matrix-green tracking-wider';
    } else {
      label.textContent = 'AVAILABLE';
      label.className = 'font-data-label text-[8px] text-text-muted tracking-wider';
    }
  }

  function resetProgress() {
    const bar = document.getElementById('carouselProgress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${SLIDE_INTERVAL}ms linear`;
      bar.style.width = '100%';
    });
  }

  function startCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
    resetProgress();
    carouselTimer = setInterval(() => {
      if (!carouselPaused) nextSlide();
    }, SLIDE_INTERVAL);
  }

  function pauseCarousel() {
    carouselPaused = true;
    const bar = document.getElementById('carouselProgress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = getComputedStyle(bar).width;
  }

  function resumeCarousel() {
    carouselPaused = false;
    resetProgress();
  }

  // Init
  loadSponsors();

  // Pause/resume on hover
  setTimeout(() => {
    const card = document.getElementById('sponsorCarouselCard');
    if (card) {
      card.addEventListener('mouseenter', pauseCarousel);
      card.addEventListener('mouseleave', resumeCarousel);
    }
  }, 200);

  // Dot clicks
  document.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-dot');
    if (dot) {
      const idx = parseInt(dot.dataset.dot);
      if (!isNaN(idx)) showSlide(idx);
    }
  });
})();
