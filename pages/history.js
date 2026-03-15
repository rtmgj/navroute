/* ============================================================
   pages/history.js — Route History Page
   ============================================================ */

function renderHistory() {
    const T = AppState.t;
    return `
  <div class="page" id="page-history">
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1 data-i18n="history_title">${T.history_title}</h1>
          <p class="subtitle" data-i18n="history_sub">${T.history_sub}</p>
        </div>
        <button class="btn-success" id="export-pdf-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span data-i18n="export_pdf">${T.export_pdf}</span>
        </button>
      </div>

      <div class="card">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <label data-i18n="filter_from">${T.filter_from}:</label>
          <input type="date" id="filter-start" />
          <label data-i18n="filter_to">${T.filter_to}:</label>
          <input type="date" id="filter-end" />
          <button class="btn-secondary btn-sm" id="filter-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span data-i18n="filter_btn">${T.filter_btn}</span>
          </button>
          <button class="btn-secondary btn-sm" id="reset-filter-btn" data-i18n="reset">${T.reset}</button>
        </div>

        <!-- Table -->
        <div class="table-wrap" id="history-table-wrap">
        </div>
      </div>
    </div>
  </div>`;
}

function initHistory() {
    renderHistoryTable(AppState.getRoutes());

    document.getElementById('filter-btn').addEventListener('click', () => {
        const start = document.getElementById('filter-start').value;
        const end = document.getElementById('filter-end').value;
        let routes = AppState.getRoutes();

        if (start || end) {
            routes = routes.filter(r => {
                const parts = r.date.split('.'); // DD.MM.YYYY
                if (parts.length < 3) return true;
                const rDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                if (start) {
                    const s = new Date(start);
                    if (rDate < s) return false;
                }
                if (end) {
                    const e = new Date(end);
                    e.setHours(23, 59, 59);
                    if (rDate > e) return false;
                }
                return true;
            });
        }
        renderHistoryTable(routes);
    });

    document.getElementById('reset-filter-btn').addEventListener('click', () => {
        document.getElementById('filter-start').value = '';
        document.getElementById('filter-end').value = '';
        renderHistoryTable(AppState.getRoutes());
    });

    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);
}

function renderHistoryTable(routes) {
    const T = AppState.t;
    const wrap = document.getElementById('history-table-wrap');

    if (!routes.length) {
        wrap.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        <h3 data-i18n="no_history">${T.no_history}</h3>
        <p data-i18n="no_history_sub">${T.no_history_sub}</p>
      </div>`;
        return;
    }

    const rows = routes.map(r => `
    <tr>
      <td>${r.date || '—'}</td>
      <td>${truncate(r.from, 32)}</td>
      <td>${truncate(r.to, 32)}</td>
      <td><span class="badge badge-blue">${r.distance || '—'}</span></td>
      <td><span class="badge badge-green">${r.duration || '—'}</span></td>
      <td>
        <button class="btn-danger" onclick="deleteHistoryRow(${r.id})" data-i18n="delete">${T.delete}</button>
      </td>
    </tr>`).join('');

    wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th data-i18n="col_date">${T.col_date}</th>
          <th data-i18n="col_from">${T.col_from}</th>
          <th data-i18n="col_to">${T.col_to}</th>
          <th data-i18n="col_dist">${T.col_dist}</th>
          <th data-i18n="col_dur">${T.col_dur}</th>
          <th data-i18n="col_actions">${T.col_actions}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function deleteHistoryRow(id) {
    AppState.deleteRoute(id);
    renderHistoryTable(AppState.getRoutes());
}

function truncate(str, len) {
    if (!str) return '—';
    return str.length > len ? str.substring(0, len) + '…' : str;
}

function exportPDF() {
    const routes = AppState.getRoutes();
    const T = AppState.t;

    if (typeof window.jspdf === 'undefined') {
        // Fallback: print dialog
        window.print();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('NavRoute — ' + T.history_title, 15, 18);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString(), 15, 25);

    doc.autoTable({
        startY: 32,
        head: [[T.col_date, T.col_from, T.col_to, T.col_dist, T.col_dur]],
        body: routes.map(r => [r.date || '—', truncate(r.from, 30), truncate(r.to, 30), r.distance || '—', r.duration || '—']),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save('navroute_gecmis.pdf');
}
