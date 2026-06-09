// Sponsor Carousel — rotating featured model cards
(() => {
  const SLIDE_INTERVAL = 20000;
  let sponsorSlots = [null, null, null];
  let currentSlide = 0;
  let carouselTimer = null;
  let carouselPaused = false;

  async function loadSponsors() {
    try {
      const res = await fetch('/api/sponsorship/active');
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data.sponsorships) ? data.sponsorships : [];
      sponsorSlots = [arr[0] || null, arr[1] || null, arr[2] || null];
      renderCarousel();
      startCarousel();
    } catch(e) {
      // silent
    }
  }

  function renderCarousel() {
    const container = document.getElementById('sponsorCarousel');
    if (!container) return;

    container.innerHTML = sponsorSlots.map((s, i) => {
      if (!s) {
        return `<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="${i}">
          <div class="absolute top-0 right-0 bg-primary/30 text-on-surface text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">SLOT ${i+1}</div>
          <div>
            <div class="font-data-label text-data-label text-primary uppercase">Available</div>
            <div class="font-data-tabular text-base text-on-surface font-bold leading-tight mt-1">Your model here</div>
            <div class="font-data-label text-[10px] text-text-muted mt-0.5">Sponsor this slot</div>
          </div>
        </div>`;
      }
      const logoUrl = s.logo_url || `https://www.google.com/s2/favicons?domain=${s.website_url?.replace(/https?:\/\//,'').replace(/\/.*$/,'')}&sz=64`;
      return `<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="${i}" onclick="window.open('${s.website_url || '#'}','_blank')">
        <div class="absolute top-0 right-0 bg-primary/30 text-on-surface text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">FEATURED</div>
        <div class="flex items-start gap-2">
          <img src="${logoUrl}" alt="" class="w-6 h-6 rounded mt-0.5" onerror="this.style.display='none'" loading="lazy" crossorigin="anonymous">
          <div class="min-w-0">
            <div class="font-data-label text-data-label text-primary uppercase truncate">${s.company_name || 'Sponsor'}</div>
            <div class="font-data-tabular text-headline-md text-on-surface font-bold leading-tight mt-0.5 truncate">${s.model_name || ''}</div>
          </div>
        </div>
        <div class="font-data-label text-[10px] text-text-muted leading-tight line-clamp-2">${(s.description || '').substring(0, 80)}</div>
      </div>`;
    }).join('');
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
    // Skip empty slots if possible
    const start = next;
    while (!sponsorSlots[next] && next !== currentSlide) {
      next = (next + 1) % 3;
      if (next === start) break;
    }
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
    const s = sponsorSlots[index];
    label.textContent = s ? s.company_name?.substring(0, 12).toUpperCase() + ' · SPONSORED' : 'SLOT ' + (index + 1);
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

  // Init
  loadSponsors();

  // Click on dots
  document.addEventListener('click', (e) => {
    const dot = e.target.closest('.carousel-dot');
    if (dot) {
      const idx = parseInt(dot.dataset.dot);
      if (!isNaN(idx)) showSlide(idx);
    }
  });
})();
