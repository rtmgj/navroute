/* ============================================================
   app.js — NavRoute Client-Side Router & Global State
   ============================================================ */

// ─── i18n strings ───────────────────────────────────────────
const STRINGS = {
    TR: {
        nav_map: 'Harita', nav_history: 'Geçmiş', nav_settings: 'Ayarlar',
        logout: 'Çıkış Yap',
        login_title: 'Tekrar Hoş Geldiniz',
        login_sub: 'Hesabınıza giriş yapın',
        login_email: 'E-posta',
        login_password: 'Şifre',
        login_btn: 'Giriş Yap',
        login_error: 'E-posta veya şifre hatalı',
        login_hint: 'Demo: admin@navroute.com / 123456',
        origin_ph: 'Başlangıç noktası…',
        dest_ph: 'Varış noktası…',
        calc_route: 'Rota Hesapla',
        clear: 'Temizle',
        traffic: 'Trafik Durumu',
        saved_locs: 'Kayıtlı Konumlar',
        add_location: '+ Konum Ekle',
        distance: 'Mesafe',
        duration: 'Süre',
        save_route: '💾 Rotayı Kaydet',
        route_saved: 'Rota kaydedildi!',
        route_failed: 'Rota bulunamadı. Başka noktalar deneyin.',
        history_title: 'Rota Geçmişi',
        history_sub: 'Daha önce hesaplanan rotalarınız',
        col_date: 'Tarih', col_from: 'Başlangıç', col_to: 'Bitiş',
        col_dist: 'Mesafe', col_dur: 'Süre', col_actions: 'İşlem',
        export_pdf: '⬇ PDF İndir',
        filter_from: 'Başlangıç tarihi', filter_to: 'Bitiş tarihi',
        filter_btn: 'Filtrele', reset: 'Sıfırla',
        no_history: 'Henüz kaydedilmiş rota yok.',
        no_history_sub: 'Harita sayfasından rota hesaplayıp kaydedin.',
        settings_title: 'Ayarlar',
        settings_sub: 'Uygulama tercihlerinizi yönetin',
        lang_card: 'Dil Seçimi', map_style_card: 'Harita Stili',
        profile_card: 'Profil Bilgileri',
        std_map: 'Standart', sat_map: 'Uydu',
        ad: 'Ad', soyad: 'Soyad', email: 'E-posta',
        save_profile: 'Kaydet',
        profile_saved: 'Profil güncellendi!',
        poi_add_title: 'Konum Ekle',
        poi_name: 'Konum Adı',
        poi_name_ph: 'Ör: Ev, İş, Hastane…',
        poi_lat: 'Enlem',
        poi_lng: 'Boylam',
        poi_cat: 'Kategori',
        cancel: 'İptal',
        add: 'Ekle',
        poi_added: 'Konum eklendi!',
        poi_removed: 'Konum silindi',
        delete: 'Sil',
        traffic_green: 'Akıcı trafik',
        traffic_yellow: 'Yoğun trafik',
        traffic_red: 'Çok yoğun trafik',
        steps_title: 'Rota Adımları',
    },
    EN: {
        nav_map: 'Map', nav_history: 'History', nav_settings: 'Settings',
        logout: 'Log Out',
        login_title: 'Welcome Back',
        login_sub: 'Sign in to your account',
        login_email: 'Email',
        login_password: 'Password',
        login_btn: 'Sign In',
        login_error: 'Invalid email or password',
        login_hint: 'Demo: admin@navroute.com / 123456',
        origin_ph: 'Starting point…',
        dest_ph: 'Destination…',
        calc_route: 'Calculate Route',
        clear: 'Clear',
        traffic: 'Traffic Status',
        saved_locs: 'Saved Locations',
        add_location: '+ Add Location',
        distance: 'Distance',
        duration: 'Duration',
        save_route: '💾 Save Route',
        route_saved: 'Route saved!',
        route_failed: 'Route not found. Try different points.',
        history_title: 'Route History',
        history_sub: 'Your previously calculated routes',
        col_date: 'Date', col_from: 'From', col_to: 'To',
        col_dist: 'Distance', col_dur: 'Duration', col_actions: 'Actions',
        export_pdf: '⬇ Export PDF',
        filter_from: 'Start date', filter_to: 'End date',
        filter_btn: 'Filter', reset: 'Reset',
        no_history: 'No saved routes yet.',
        no_history_sub: 'Calculate a route on the map page and save it.',
        settings_title: 'Settings',
        settings_sub: 'Manage your application preferences',
        lang_card: 'Language', map_style_card: 'Map Style',
        profile_card: 'Profile Info',
        std_map: 'Standard', sat_map: 'Satellite',
        ad: 'First Name', soyad: 'Last Name', email: 'Email',
        save_profile: 'Save',
        profile_saved: 'Profile updated!',
        poi_add_title: 'Add Location',
        poi_name: 'Location Name',
        poi_name_ph: 'e.g. Home, Office, Hospital…',
        poi_lat: 'Latitude',
        poi_lng: 'Longitude',
        poi_cat: 'Category',
        cancel: 'Cancel',
        add: 'Add',
        poi_added: 'Location added!',
        poi_removed: 'Location removed',
        delete: 'Delete',
        traffic_green: 'Clear traffic',
        traffic_yellow: 'Moderate traffic',
        traffic_red: 'Heavy traffic',
        steps_title: 'Route Steps',
    }
};

// ─── Global State ────────────────────────────────────────────
const AppState = {
    currentPage: null,
    lang: localStorage.getItem('nr_lang') || 'TR',
    mapStyle: localStorage.getItem('nr_mapstyle') || 'standard',
    user: null,

    get t() { return STRINGS[this.lang]; },

    setLang(lang) {
        this.lang = lang;
        localStorage.setItem('nr_lang', lang);
        applyI18n();
    },

    setMapStyle(style) {
        this.mapStyle = style;
        localStorage.setItem('nr_mapstyle', style);
    },

    getPOIs() {
        return JSON.parse(localStorage.getItem('nr_pois') || '[]');
    },
    savePOI(poi) {
        const pois = this.getPOIs();
        poi.id = Date.now();
        pois.push(poi);
        localStorage.setItem('nr_pois', JSON.stringify(pois));
        return poi;
    },
    removePOI(id) {
        const pois = this.getPOIs().filter(p => p.id !== id);
        localStorage.setItem('nr_pois', JSON.stringify(pois));
    },

    getRoutes() {
        return JSON.parse(localStorage.getItem('nr_routes') || '[]');
    },
    saveRoute(route) {
        const routes = this.getRoutes();
        route.id = Date.now();
        route.date = new Date().toLocaleDateString('tr-TR');
        routes.unshift(route);
        localStorage.setItem('nr_routes', JSON.stringify(routes));
    },
    deleteRoute(id) {
        const routes = this.getRoutes().filter(r => r.id !== id);
        localStorage.setItem('nr_routes', JSON.stringify(routes));
    },

    getProfile() {
        const saved = localStorage.getItem('nr_profile');
        return saved ? JSON.parse(saved) : { ad: 'Admin', soyad: 'User', email: 'admin@navroute.com' };
    },
    saveProfile(p) { localStorage.setItem('nr_profile', JSON.stringify(p)); },
};

// ─── Session ─────────────────────────────────────────────────
function isLoggedIn() {
    return !!sessionStorage.getItem('nr_session');
}

function login(email, password) {
    const demo = { email: 'admin@navroute.com', password: '123456' };
    if (email === demo.email && password === demo.password) {
        sessionStorage.setItem('nr_session', JSON.stringify({ email, name: 'Admin' }));
        AppState.user = { email, name: 'Admin' };
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('nr_session');
    AppState.user = null;
    navigate('login');
}

// ─── Router ──────────────────────────────────────────────────
function navigate(page) {
    if (page !== 'login' && !isLoggedIn()) { page = 'login'; }

    AppState.currentPage = page;
    const topnav = document.getElementById('topnav');
    const app = document.getElementById('app');

    if (page === 'login') {
        topnav.classList.add('hidden');
        app.innerHTML = renderLogin();
        initLogin();
    } else {
        topnav.classList.remove('hidden');
        updateNavActive(page);

        if (page === 'map') {
            app.innerHTML = renderMap();
            initMap();
        } else if (page === 'history') {
            app.innerHTML = renderHistory();
            initHistory();
        } else if (page === 'settings') {
            app.innerHTML = renderSettings();
            initSettings();
        }
        applyI18n();

        // update user avatar
        const session = JSON.parse(sessionStorage.getItem('nr_session') || '{}');
        const avatar = document.getElementById('user-avatar');
        if (avatar && session.email) {
            avatar.textContent = session.email[0].toUpperCase();
        }
    }
}

function updateNavActive(page) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
    });
}

// ─── i18n ────────────────────────────────────────────────────
function applyI18n() {
    const T = AppState.t;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (T[key] !== undefined) el.textContent = T[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (T[key] !== undefined) el.placeholder = T[key];
    });
}

// ─── Toast ───────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

// ─── Nav Listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.page));
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Initialize seed data
    if (!localStorage.getItem('nr_pois')) {
        const pois = [
            { id: 1, name: 'Atatürk Havalimanı', lat: 40.9769, lng: 28.8146, cat: 'star' },
            { id: 2, name: 'İstanbul Üniversitesi Hastanesi', lat: 41.0136, lng: 28.9550, cat: 'hospital' },
            { id: 3, name: 'Şişli McDonald\'s', lat: 41.0602, lng: 28.9877, cat: 'restaurant' },
            { id: 4, name: 'BP Benzin — Maslak', lat: 41.1082, lng: 29.0211, cat: 'gas' },
        ];
        localStorage.setItem('nr_pois', JSON.stringify(pois));
    }

    navigate(isLoggedIn() ? 'map' : 'login');
});
