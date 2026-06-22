// Sponsor Carousel — shared across all pages
// Rotates 3 sponsor slots every 20s. Loads live data from /api/sponsorship/active.
(function initSponsorCarousel() {
  var SLIDE_INTERVAL = 20000;
  var sponsorSlots = [null, null, null];
  var currentSlide = 0;
  var carouselTimer = null;
  var carouselPaused = false;

  function loadSponsors() {
    fetch('/api/sponsorship/active')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        var arr = (data && Array.isArray(data.sponsorships)) ? data.sponsorships : [];
        sponsorSlots = [arr[0] || null, arr[1] || null, arr[2] || null];
        renderCarousel();
        startCarousel();
      })
      .catch(function() {
        renderCarousel();
        startCarousel();
      });
  }

  function esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderCarousel() {
    var container = document.getElementById('sponsorCarousel');
    if (!container) return;

    var html = '';
    var copies = [
      { badge: 'HOT', h: 'GLM 5.2', s: 'Z.ai\'s top reasoning model — 1M context, ultra-budget pricing', cta: 'Try Now' },
      { badge: 'SLOT 2', h: 'Get Featured', s: 'Prime placement for 30 days', cta: 'Go Live' },
      { badge: 'SLOT 3', h: 'Your Brand Here', s: 'CTOs, devs &amp; founders see this', cta: 'Sponsor Now' }
    ];

    for (var i = 0; i < 3; i++) {
      var s = sponsorSlots[i];
      if (s) {
        var url = s.website_url || '/sponsor';
        html += '<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="' + i + '" onclick="window.open(\'' + esc(url) + '\',\'_blank\')">';
        html += '<div class="absolute top-0 right-0 bg-matrix-green text-deep-charcoal text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">SPONSORED</div>';
        html += '<div>';
        html += '<div class="font-data-label text-data-label text-primary uppercase">Featured</div>';
        html += '<div class="font-data-tabular text-body-lg text-on-surface font-bold leading-tight mt-1 truncate">' + esc(s.model_name || '') + '</div>';
        html += '<div class="text-text-muted text-[10px] mt-0.5 truncate">' + esc(s.company_name || '') + '</div>';
        html += '</div>';
        html += '<div class="flex items-center justify-between w-full mt-1">';
        html += '<span class="font-data-tabular text-[10px] text-text-muted">' + esc(s.company_name || '') + '</span>';
        html += '<span class="text-matrix-green font-bold text-[10px]">Learn More &rarr;</span>';
        html += '</div></div>';
      } else {
        var c = copies[i];
        html += '<div class="carousel-slide absolute inset-0 p-3 flex flex-col justify-between transition-all duration-700 ease-out cursor-pointer carousel-slide-inactive" data-slide="' + i + '" onclick="window.location.href=\'/sponsor\'">';
        html += '<div class="absolute top-0 right-0 bg-primary/20 text-on-surface text-[8px] font-bold px-1.5 py-0.5 rounded-bl font-data-label tracking-wider">' + c.badge + '</div>';
        html += '<div>';
        html += '<div class="font-data-label text-data-label text-primary uppercase">Featured</div>';
        html += '<div class="font-data-tabular text-body-lg text-on-surface font-bold leading-tight mt-1 truncate">' + c.h + '</div>';
        html += '<div class="text-text-muted text-[10px] mt-0.5">' + c.s + '</div>';
        html += '</div>';
        html += '<div class="flex items-center justify-between w-full mt-1">';
        html += '<span class="font-data-tabular font-bold text-on-surface text-[11px]">$99/30d</span>';
        html += '<span class="text-primary font-bold text-[10px]">' + c.cta + ' &rarr;</span>';
        html += '</div></div>';
      }
    }
    container.innerHTML = html;
    showSlide(0, false);
  }

  function showSlide(index, animate) {
    animate = animate !== false;
    var slides = document.querySelectorAll('#sponsorCarousel .carousel-slide');
    if (!slides.length) return;
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.remove('carousel-slide-active', 'carousel-slide-inactive');
      if (!animate) slides[i].style.transition = 'none';
      slides[i].classList.add(i === index ? 'carousel-slide-active' : 'carousel-slide-inactive');
      if (!animate) setTimeout(function(el) { el.style.transition = ''; }, 50, slides[i]);
    }
    currentSlide = index;
    updateDots(index);
    updateLabel(index);
    if (animate) resetProgress();
  }

  function nextSlide() {
    // Always advance, even when all slots are empty
    showSlide((currentSlide + 1) % 3);
  }

  function updateDots(index) {
    var dots = document.querySelectorAll('.carousel-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === index);
    }
  }

  function updateLabel(index) {
    var label = document.getElementById('carouselLabel');
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
    var bar = document.getElementById('carouselProgress');
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(function() {
      bar.style.transition = 'width ' + SLIDE_INTERVAL + 'ms linear';
      bar.style.width = '100%';
    });
  }

  function startCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
    resetProgress();
    carouselTimer = setInterval(function() {
      if (!carouselPaused) nextSlide();
    }, SLIDE_INTERVAL);
  }

  function pauseCarousel() {
    carouselPaused = true;
    var bar = document.getElementById('carouselProgress');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = getComputedStyle(bar).width;
    }
  }

  function resumeCarousel() {
    carouselPaused = false;
    resetProgress();
  }

  // Hover pause/resume
  setTimeout(function() {
    var card = document.getElementById('sponsorCarouselCard');
    if (card) {
      card.addEventListener('mouseenter', pauseCarousel);
      card.addEventListener('mouseleave', resumeCarousel);
    }
  }, 200);

  // Dot click navigation
  document.addEventListener('click', function(e) {
    var dot = e.target.closest('.carousel-dot');
    if (dot) {
      var idx = parseInt(dot.dataset.dot);
      if (!isNaN(idx)) showSlide(idx);
    }
  });

  // Start when DOM ready
  function start() {
    var el = document.getElementById('sponsorCarousel');
    if (!el) {
      setTimeout(function() {
        if (document.getElementById('sponsorCarousel')) loadSponsors();
      }, 500);
      return;
    }
    loadSponsors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
