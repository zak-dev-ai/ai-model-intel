// Feedback Widget — aimodelranks.live
// Include this script on any page to add the floating feedback button

(function() {
  const SUPABASE_URL = 'https://jkoxrftlslylfmugjomd.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprb3hyZnRsc2x5bGZtdWdqb21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MjAzNTEsImV4cCI6MjA5MzM5NjM1MX0.1LVo1a2K2V8QZPX94bVTBmzIxUskKp0mR7RmNwgOdcI';

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    #feedback-widget-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 48px; height: 48px; border-radius: 50%;
      background: linear-gradient(135deg, #ff8800, #ff6600);
      border: none; color: #0a0a0a; font-size: 22px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(255,136,0,0.4);
      transition: all 0.25s ease;
      display: flex; align-items: center; justify-content: center;
    }
    #feedback-widget-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(255,136,0,0.55);
    }
    #feedback-widget-btn .label {
      display: none; position: absolute; right: 56px;
      background: rgba(15,15,15,0.95); color: #ffb781;
      padding: 6px 14px; border-radius: 6px; font-size: 13px;
      font-family: 'Geist', sans-serif; white-space: nowrap;
      border: 1px solid rgba(255,183,129,0.3);
    }
    #feedback-widget-btn:hover .label { display: block; }
    #feedback-modal-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
    }
    #feedback-modal-overlay.open {
      opacity: 1; pointer-events: auto;
    }
    #feedback-modal {
      background: rgba(19,19,19,0.98); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 28px; width: 90%; max-width: 420px;
      color: #e5e2e1; font-family: 'Geist', sans-serif;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    #feedback-modal h3 {
      margin: 0 0 8px; font-size: 18px; font-weight: 700;
      display: flex; align-items: center; gap: 8px;
    }
    #feedback-modal .sub { color: #888; font-size: 13px; margin-bottom: 16px; }
    #feedback-modal textarea {
      width: 100%; min-height: 100px; padding: 12px;
      background: rgba(26,26,26,0.8); border: 1px solid #1A1A1A;
      color: #e5e2e1; border-radius: 8px; font-family: 'Geist', sans-serif;
      font-size: 14px; resize: vertical; outline: none;
      transition: border-color 0.2s;
    }
    #feedback-modal textarea:focus { border-color: #ffb781; }
    #feedback-modal .row {
      display: flex; gap: 10px; margin-top: 16px;
    }
    #feedback-modal button {
      flex: 1; padding: 10px 20px; border-radius: 8px; border: none;
      font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s;
    }
    #feedback-modal button:hover { opacity: 0.85; }
    #feedback-submit { background: linear-gradient(135deg, #ff8800, #ff6600); color: #0a0a0a; }
    #feedback-cancel { background: rgba(255,255,255,0.06); color: #888; border: 1px solid rgba(255,255,255,0.1); }
    #feedback-modal .success { text-align: center; padding: 20px 0; display: none; }
    #feedback-modal .success .icon { font-size: 40px; margin-bottom: 10px; }
    #feedback-modal .success .msg { color: #00ff41; font-weight: 600; }
    #feedback-modal .error { color: #ff5500; font-size: 12px; margin-top: 6px; display: none; }
  `;
  document.head.appendChild(style);

  // Build DOM
  const btn = document.createElement('button');
  btn.id = 'feedback-widget-btn';
  btn.innerHTML = '<span class="label">Share feedback</span>💬';

  const overlay = document.createElement('div');
  overlay.id = 'feedback-modal-overlay';
  overlay.innerHTML = `
    <div id="feedback-modal">
      <div id="feedback-form-wrap">
        <h3>💬 What do you need?</h3>
        <p class="sub">What feature, model, or data would make this site more useful for you? No signup. Just tell us.</p>
        <textarea id="feedback-text" placeholder="e.g. 'I need to filter by coding benchmarks' or 'Add Mistral pricing'..." maxlength="1000"></textarea>
        <div class="error" id="feedback-error"></div>
        <div class="row">
          <button id="feedback-cancel">Close</button>
          <button id="feedback-submit">Send Feedback</button>
        </div>
      </div>
      <div class="success" id="feedback-success">
        <div class="icon">✅</div>
        <p class="msg">Got it — thank you!</p>
        <p style="color:#888;font-size:13px;margin-top:6px;">We read every submission. This helps us build what you actually need.</p>
      </div>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(overlay);

  // Events
  const textarea = document.getElementById('feedback-text');
  const errorEl = document.getElementById('feedback-error');
  const formWrap = document.getElementById('feedback-form-wrap');
  const successWrap = document.getElementById('feedback-success');

  function open() {
    overlay.classList.add('open');
    textarea.value = '';
    errorEl.style.display = 'none';
    formWrap.style.display = 'block';
    successWrap.style.display = 'none';
    setTimeout(() => textarea.focus(), 150);
  }

  function close() {
    overlay.classList.remove('open');
  }

  btn.addEventListener('click', open);
  document.getElementById('feedback-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.getElementById('feedback-submit').addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text || text.length < 3) {
      errorEl.textContent = 'Please write at least a few words.';
      errorEl.style.display = 'block';
      return;
    }

    errorEl.style.display = 'none';
    const btn = document.getElementById('feedback-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch(SUPABASE_URL + '/rest/v1/user_feedback', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          feedback: text,
          page_url: window.location.href,
          user_agent: navigator.userAgent.substring(0, 200)
        })
      });

      if (res.ok) {
        formWrap.style.display = 'none';
        successWrap.style.display = 'block';
        setTimeout(close, 2200);
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      errorEl.textContent = 'Something went wrong. Try again?';
      errorEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Feedback';
    }
  });

  // Keyboard shortcut: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();
