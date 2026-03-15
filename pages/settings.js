/* ============================================================
   pages/settings.js — Settings Page
   ============================================================ */

function renderSettings() {
    const T = AppState.t;
    const profile = AppState.getProfile();
    const isEN = AppState.lang === 'EN';
    const isStd = AppState.mapStyle === 'standard';

    return `
  <div class="page" id="page-settings">
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 data-i18n="settings_title">${T.settings_title}</h1>
          <p class="subtitle" data-i18n="settings_sub">${T.settings_sub}</p>
        </div>
      </div>

      <div class="settings-grid">

        <!-- Language Card -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 data-i18n="lang_card">${T.lang_card}</h3>
          </div>
          <div class="settings-card-body">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">${AppState.lang === 'TR' ? 'Türkçe' : 'Turkish'} / English</div>
                <div class="settings-row-sub">${AppState.lang === 'TR' ? 'Uygulama dili' : 'Application language'}</div>
              </div>
              <div class="lang-toggle">
                <button id="lang-tr" class="lang-btn ${!isEN ? 'active' : ''}">TR</button>
                <button id="lang-en" class="lang-btn ${isEN ? 'active' : ''}">EN</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Style Card -->
        <div class="settings-card">
          <div class="settings-card-header">
            <div class="settings-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
            </div>
            <h3 data-i18n="map_style_card">${T.map_style_card}</h3>
          </div>
          <div class="settings-card-body">
            <div class="map-style-grid">
              <div class="map-style-option ${isStd ? 'selected' : ''}" id="style-standard" data-style="standard">
                <div class="map-style-preview style-standard"></div>
                <div class="map-style-name" data-i18n="std_map">${T.std_map}</div>
              </div>
              <div class="map-style-option ${!isStd ? 'selected' : ''}" id="style-satellite" data-style="satellite">
                <div class="map-style-preview style-satellite"></div>
                <div class="map-style-name" data-i18n="sat_map">${T.sat_map}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Card -->
        <div class="settings-card" style="grid-column: 1 / -1;">
          <div class="settings-card-header">
            <div class="settings-card-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 data-i18n="profile_card">${T.profile_card}</h3>
          </div>
          <div class="settings-card-body">
            <div class="profile-form" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
              <div class="form-group-light">
                <label data-i18n="ad">${T.ad}</label>
                <input type="text" id="profile-ad" class="form-input-light" value="${profile.ad}" />
              </div>
              <div class="form-group-light">
                <label data-i18n="soyad">${T.soyad}</label>
                <input type="text" id="profile-soyad" class="form-input-light" value="${profile.soyad}" />
              </div>
              <div class="form-group-light">
                <label data-i18n="email">${T.email}</label>
                <input type="email" id="profile-email" class="form-input-light" value="${profile.email}" />
              </div>
            </div>
            <div style="margin-top:16px;">
              <button class="btn-primary" id="save-profile-btn" style="width:auto;padding:10px 24px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span data-i18n="save_profile">${T.save_profile}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

function initSettings() {
    // Language
    document.getElementById('lang-tr').addEventListener('click', () => {
        AppState.setLang('TR');
        navigate('settings');
    });
    document.getElementById('lang-en').addEventListener('click', () => {
        AppState.setLang('EN');
        navigate('settings');
    });

    // Map Style
    document.querySelectorAll('.map-style-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.map-style-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            AppState.setMapStyle(opt.dataset.style);
        });
    });

    // Profile
    document.getElementById('save-profile-btn').addEventListener('click', () => {
        const profile = {
            ad: document.getElementById('profile-ad').value.trim(),
            soyad: document.getElementById('profile-soyad').value.trim(),
            email: document.getElementById('profile-email').value.trim(),
        };
        AppState.saveProfile(profile);
        showToast(AppState.t.profile_saved, 'success');
    });
}
