/* ════════════════════════════════════════════════════════════════
   Credit Analysis Platform — Serasa Experian
   Application Script
   ════════════════════════════════════════════════════════════════ */


/* ────────────────────────────────────────────────
   CONFIGURATION
   ──────────────────────────────────────────────── */
const API = 'http://localhost:8080/api/v1/proposals';

let currentPage = 0;
let currentRisk = '';
let currentName = '';
const pageSize  = 10;

/** Risk level code → Portuguese label */
const RISK_LABELS = {
  LOW:      'Baixo',
  MEDIUM:   'Médio',
  HIGH:     'Alto',
  REJECTED: 'Reprovado'
};


/* ────────────────────────────────────────────────
   UTILITY FUNCTIONS
   ──────────────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} msg   - Message to display
 * @param {string} type  - 'success' or 'error'
 */
function toast(msg, type = 'success') {
  const icon = type === 'success' ? '✓' : '✕';
  const el   = document.createElement('div');

  el.className = 'toast-msg ' + type;
  el.innerHTML =
    '<span style="font-size:1.1rem">' + icon + '</span>' +
    '<span>' + msg + '</span>';

  document.getElementById('toastWrap').appendChild(el);

  setTimeout(function () {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(16px)';
    setTimeout(function () { el.remove(); }, 300);
  }, 3500);
}


/**
 * Render a risk badge HTML with Portuguese label.
 * @param {string} riskLevel - API risk level (LOW, MEDIUM, HIGH, REJECTED)
 * @returns {string} HTML string
 */
function riskBadge(riskLevel) {
  var label = RISK_LABELS[riskLevel] || riskLevel;
  return '<span class="risk-badge risk-' + riskLevel + '">' + label + '</span>';
}


/**
 * Get CSS color variable for a given score.
 * @param {number} score
 * @returns {string} CSS variable reference
 */
function scoreColor(score) {
  if (score >= 800) return 'var(--low)';
  if (score >= 600) return 'var(--medium)';
  if (score >= 400) return 'var(--high)';
  return 'var(--rejected)';
}


/**
 * Format ISO date string to Brazilian locale.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit'
  });
}


/**
 * Format a number as Brazilian Real (BRL) currency.
 * @param {number} value
 * @returns {string} Formatted currency string
 */
function fmtIncome(value) {
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL'
  }).format(value);
}


/**
 * Animate a number counting up from 0 to target.
 * @param {HTMLElement} el     - Element to update
 * @param {number}      target - Final number
 */
function animateNumber(el, target) {
  if (target === 0) {
    el.textContent = '0';
    return;
  }

  var current = 0;

  function step() {
    current += Math.ceil(target / 20);
    if (current >= target) {
      el.textContent = target;
      return;
    }
    el.textContent = current;
    requestAnimationFrame(step);
  }

  step();
}


/* ────────────────────────────────────────────────
   CPF INPUT MASK — auto-formats as 000.000.000-00
   ──────────────────────────────────────────────── */
document.getElementById('cpf').addEventListener('input', function () {
  var v = this.value.replace(/\D/g, '').slice(0, 11);

  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  this.value = v;
});


/* ────────────────────────────────────────────────
   LOAD DASHBOARD STATS
   ──────────────────────────────────────────────── */
async function loadStats() {
  try {
    var response = await fetch(API + '?size=10000');
    var data     = await response.json();
    var items    = data.content || [];

    animateNumber(document.getElementById('statTotal'),    items.length);
    animateNumber(document.getElementById('statLow'),      items.filter(function (i) { return i.riskLevel === 'LOW'; }).length);
    animateNumber(document.getElementById('statMedium'),   items.filter(function (i) { return i.riskLevel === 'MEDIUM'; }).length);
    animateNumber(document.getElementById('statHigh'),     items.filter(function (i) { return i.riskLevel === 'HIGH'; }).length);
    animateNumber(document.getElementById('statRejected'), items.filter(function (i) { return i.riskLevel === 'REJECTED'; }).length);
  } catch (err) {
    /* Stats are secondary — fail silently */
  }
}


/* ────────────────────────────────────────────────
   LOAD TABLE DATA
   ──────────────────────────────────────────────── */
async function loadTable() {
  var tbody = document.getElementById('tableBody');

  tbody.innerHTML =
    '<tr><td colspan="8" class="empty-state">' +
    '<div class="spinner"></div></td></tr>';

  try {
    /* Build URL based on active filters */
    var url = API + '?page=' + currentPage + '&size=' + pageSize + '&sort=createdAt,desc';

    if (currentRisk) {
      url = API + '?riskLevel=' + currentRisk + '&page=' + currentPage + '&size=' + pageSize;
    }
    if (currentName) {
      url = API + '?name=' + encodeURIComponent(currentName) + '&page=' + currentPage + '&size=' + pageSize;
    }

    var response = await fetch(url);
    var data     = await response.json();
    var rows     = data.content || [];

    /* Empty state */
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="empty-state">' +
        '<div class="ico-big">📭</div>' +
        'Nenhuma proposta encontrada.</td></tr>';

      renderPagination(0, 0);
      return;
    }

    /* Render rows with staggered animation */
    tbody.innerHTML = rows.map(function (p, i) {
      return '' +
        '<tr style="animation: fadeSlide .3s ' + (i * 0.04) + 's both">' +
          '<td>' +
            '<span style="color:var(--text-muted); font-family:var(--mono); font-size:.78rem">' +
              '#' + p.id +
            '</span>' +
          '</td>' +
          '<td style="font-weight:600">' + p.fullName + '</td>' +
          '<td><span class="cpf-text">' + p.cpf + '</span></td>' +
          '<td>' + p.age + '</td>' +
          '<td style="font-weight:500">' + fmtIncome(p.monthlyIncome) + '</td>' +
          '<td>' +
            '<div class="score-wrap">' +
              '<div class="score-track" style="width:60px">' +
                '<div class="score-fill" style="width:' + (p.calculatedScore / 10) + '%; background:' + scoreColor(p.calculatedScore) + '"></div>' +
              '</div>' +
              '<span class="score-num" style="color:' + scoreColor(p.calculatedScore) + '">' + p.calculatedScore + '</span>' +
            '</div>' +
          '</td>' +
          '<td>' + riskBadge(p.riskLevel) + '</td>' +
          '<td style="font-size:.78rem; color:var(--text-muted)">' + fmtDate(p.createdAt) + '</td>' +
        '</tr>';
    }).join('');

    renderPagination(data.totalPages, data.number);

  } catch (err) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="empty-state" style="color:var(--rejected)">' +
      '<div class="ico-big">⚠</div>' +
      'Não foi possível conectar à API.<br/>' +
      '<span style="font-size:.8rem; color:var(--text-muted)">' +
      'Verifique se o servidor está rodando na porta 8080.</span>' +
      '</td></tr>';
  }
}


/* ────────────────────────────────────────────────
   PAGINATION
   ──────────────────────────────────────────────── */
function renderPagination(totalPages, currentPageNum) {
  var container = document.getElementById('pagination');
  container.innerHTML = '';

  if (totalPages <= 1) return;

  for (var i = 0; i < totalPages; i++) {
    var btn = document.createElement('button');

    btn.className   = 'pag-btn' + (i === currentPageNum ? ' active' : '');
    btn.textContent = i + 1;
    btn.dataset.page = i;

    btn.addEventListener('click', function () {
      currentPage = parseInt(this.dataset.page);
      loadTable();
    });

    container.appendChild(btn);
  }
}


/* ────────────────────────────────────────────────
   FILTER CHIPS — Risk level
   ──────────────────────────────────────────────── */
document.querySelectorAll('[data-risk]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('[data-risk]').forEach(function (b) {
      b.classList.remove('active');
    });
    this.classList.add('active');

    currentRisk = this.dataset.risk;
    currentName = '';
    currentPage = 0;
    document.getElementById('searchName').value = '';

    loadTable();
  });
});


/* ────────────────────────────────────────────────
   SEARCH BY NAME — Debounced input
   ──────────────────────────────────────────────── */
var searchTimer;

document.getElementById('searchName').addEventListener('input', function (e) {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(function () {
    currentName = e.target.value.trim();
    currentRisk = '';
    currentPage = 0;

    document.querySelectorAll('[data-risk]').forEach(function (b) {
      b.classList.remove('active');
    });
    document.querySelector('[data-risk=""]').classList.add('active');

    loadTable();
  }, 400);
});


/* ────────────────────────────────────────────────
   REFRESH BUTTON
   ──────────────────────────────────────────────── */
document.getElementById('refreshBtn').addEventListener('click', function () {
  loadTable();
  loadStats();
});


/* ────────────────────────────────────────────────
   FORM SUBMISSION
   ──────────────────────────────────────────────── */
document.getElementById('proposalForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  var btn    = document.getElementById('submitBtn');
  var fields = {
    fullName:      document.getElementById('fullName'),
    cpf:           document.getElementById('cpf'),
    monthlyIncome: document.getElementById('monthlyIncome'),
    age:           document.getElementById('age')
  };

  /* Read values */
  var fullName      = fields.fullName.value.trim();
  var cpf           = fields.cpf.value.trim();
  var monthlyIncome = parseFloat(fields.monthlyIncome.value);
  var age           = parseInt(fields.age.value);

  /* Clear previous validation errors */
  Object.values(fields).forEach(function (el) {
    el.classList.remove('is-invalid');
  });

  /* Client-side validation */
  var valid = true;

  if (!fullName || fullName.length < 3) {
    fields.fullName.classList.add('is-invalid');
    valid = false;
  }
  if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
    fields.cpf.classList.add('is-invalid');
    valid = false;
  }
  if (!monthlyIncome || monthlyIncome <= 0) {
    fields.monthlyIncome.classList.add('is-invalid');
    valid = false;
  }
  if (!age || age < 18 || age > 120) {
    fields.age.classList.add('is-invalid');
    valid = false;
  }

  if (!valid) return;

  /* Disable button & show loading */
  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span> Avaliando…';

  try {
    var res = await fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fullName: fullName, cpf: cpf, monthlyIncome: monthlyIncome, age: age })
    });

    /* Duplicate CPF */
    if (res.status === 409) {
      var errData = await res.json();
      toast(errData.error || 'CPF já cadastrado.', 'error');
      fields.cpf.classList.add('is-invalid');
      return;
    }

    /* Validation error from backend */
    if (res.status === 400) {
      var errData2 = await res.json();
      var msg = errData2.details
        ? Object.values(errData2.details).join(' · ')
        : 'Erro de validação.';
      toast(msg, 'error');
      return;
    }

    if (!res.ok) throw new Error();

    /* Success */
    var data = await res.json();
    showResult(data);
    toast('Proposta de ' + data.fullName + ' enviada com sucesso!', 'success');

    document.getElementById('proposalForm').reset();
    loadTable();
    loadStats();

  } catch (err) {
    toast('Falha na conexão. O servidor está rodando?', 'error');

  } finally {
    btn.disabled  = false;
    btn.innerHTML =
      '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">' +
        '<path d="M22 2L11 13"/>' +
        '<path d="M22 2L15 22l-4-9-9-4z"/>' +
      '</svg> ' +
      'Avaliar Proposta';
  }
});


/* ────────────────────────────────────────────────
   SHOW RESULT PANEL
   ──────────────────────────────────────────────── */
function showResult(data) {
  var panel = document.getElementById('resultPanel');

  document.getElementById('rName').textContent  = data.fullName;
  document.getElementById('rCpf').textContent   = data.cpf;
  document.getElementById('rScore').textContent = data.calculatedScore;
  document.getElementById('rDate').textContent  = fmtDate(data.createdAt);

  /* Score bar */
  var pct = data.calculatedScore / 10;
  var bar = document.getElementById('rScoreBar');
  bar.style.width      = pct + '%';
  bar.style.background = scoreColor(data.calculatedScore);

  /* Risk badge */
  document.getElementById('rRisk').innerHTML = riskBadge(data.riskLevel);

  /* Show & scroll */
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}


/* ────────────────────────────────────────────────
   CLEAR FORM BUTTON
   ──────────────────────────────────────────────── */
document.getElementById('clearBtn').addEventListener('click', function () {
  document.getElementById('proposalForm').reset();
  document.getElementById('resultPanel').classList.remove('show');

  ['fullName', 'cpf', 'monthlyIncome', 'age'].forEach(function (id) {
    document.getElementById(id).classList.remove('is-invalid');
  });
});


/* ────────────────────────────────────────────────
   INIT — Load data when page opens
   ──────────────────────────────────────────────── */
loadStats();
loadTable();