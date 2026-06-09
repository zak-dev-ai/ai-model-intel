// Shared navigation utilities — included on all pages
(function() {
  // Mobile menu toggle
  window.toggleMenu = function() {
    var menu = document.getElementById('mobileMenu');
    var overlay = document.getElementById('overlay');
    if (menu) menu.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  };

  // Partner/Sponsor modal
  window.openPartnerModal = function() {
    var m = document.getElementById('partnerModal');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  };
  window.closePartnerModal = function() {
    var m = document.getElementById('partnerModal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  };

  // Inject partner modal HTML if not already present
  if (!document.getElementById('partnerModal')) {
    var modal = document.createElement('div');
    modal.id = 'partnerModal';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] hidden items-center justify-center p-4';
    modal.innerHTML = '<div class="glass-panel rounded-lg p-8 w-full max-w-lg relative" onclick="event.stopPropagation()">'+
      '<button onclick="closePartnerModal()" class="absolute top-4 right-4 text-text-muted hover:text-on-surface text-2xl">&times;</button>'+
      '<div class="text-center mb-6">'+
        '<span class="material-symbols-outlined text-4xl text-bloomberg-orange">handshake</span>'+
        '<h2 class="text-2xl font-bold mt-3">Partner with AI Model Ranks</h2>'+
        '<p class="text-text-muted text-sm mt-2">Reach 10,000+ AI engineers daily. Native integrations, category sponsorships, and API routing partnerships.</p>'+
      '</div>'+
      '<div class="space-y-3">'+
        '<button onclick="closePartnerModal();window.location.href=\'/sponsor\'" class="w-full bg-bloomberg-orange text-deep-charcoal py-3 rounded font-bold hover:opacity-90 transition-opacity">Featured Model Sponsorship — $99/30d</button>'+
        '<button onclick="closePartnerModal()" class="w-full bg-surface-container-high text-on-surface py-3 rounded font-bold hover:bg-surface-container transition-colors">API Partnership — Contact Us</button>'+
      '</div>'+
    '</div>';
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closePartnerModal();
    });
    document.body.appendChild(modal);
  }
})();
