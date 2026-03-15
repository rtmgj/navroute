/* ============================================================
   pages/login.js — Login Page
   ============================================================ */

function renderLogin() {
    const T = AppState.t;
    return `
  <div class="page page-login">
    <div class="login-wrapper">
      <div class="login-logo">
        <div class="login-logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3l5 10H9L14 3z" fill="white"/>
            <circle cx="14" cy="22" r="3" fill="rgba(255,255,255,0.7)"/>
          </svg>
        </div>
        <span class="login-logo-text">NavRoute</span>
      </div>

      <div class="login-card">
        <h2 data-i18n="login_title">${T.login_title}</h2>
        <p class="subtitle" data-i18n="login_sub">${T.login_sub}</p>

        <div class="form-group">
          <label data-i18n="login_email">${T.login_email}</label>
          <input type="email" id="login-email" class="form-input" 
                 placeholder="ornek@email.com" autocomplete="email" />
        </div>

        <div class="form-group">
          <label data-i18n="login_password">${T.login_password}</label>
          <input type="password" id="login-password" class="form-input" 
                 placeholder="••••••••" autocomplete="current-password" />
        </div>

        <button class="btn-primary" id="login-submit-btn" style="margin-top:8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span data-i18n="login_btn">${T.login_btn}</span>
        </button>

        <p class="login-error" id="login-error" data-i18n="login_error">${T.login_error}</p>

        <div class="login-hint" data-i18n="login_hint">${T.login_hint}</div>
      </div>
    </div>
  </div>`;
}

function initLogin() {
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('login-submit-btn');

    function doLogin() {
        const email = emailEl.value.trim();
        const pass = passEl.value;
        if (!email || !pass) {
            errEl.style.display = 'block';
            errEl.textContent = AppState.t.login_error;
            return;
        }
        if (login(email, pass)) {
            errEl.style.display = 'none';
            navigate('map');
        } else {
            errEl.style.display = 'block';
            errEl.textContent = AppState.t.login_error;
            passEl.value = '';
            passEl.focus();
        }
    }

    btn.addEventListener('click', doLogin);
    [emailEl, passEl].forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    });
    emailEl.focus();
}
