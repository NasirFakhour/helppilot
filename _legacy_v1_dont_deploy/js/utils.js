/**
 * HelpPilot — utils.js
 * Helper functions: dates, formatting, templates, etc.
 */

// ── Date formatting ────────────────────────────────────────
export function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  const defaults = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return d.toLocaleDateString('fr-FR', { ...defaults, ...opts });
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} à ${formatTime(dateStr)}`;
}

export function formatDateInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
}

export function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

export function daysDiff(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

export function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

export function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Aujourd\'hui';
  if (d.toDateString() === tomorrow.toDateString()) return 'Demain';
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return formatDate(dateStr);
}

// ── Currency ───────────────────────────────────────────────
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0
  }).format(amount);
}

// ── Text helpers ───────────────────────────────────────────
export function initials(nom, prenom) {
  const n = (nom || '').trim();
  const p = (prenom || '').trim();
  if (!n && !p) return '?';
  return ((p[0] || '') + (n[0] || '')).toUpperCase();
}

export function fullName(client) {
  if (!client) return '—';
  return [client.prenom, client.nom].filter(Boolean).join(' ');
}

export function truncate(str, max = 60) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function slugify(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Status helpers ─────────────────────────────────────────
export const STATUTS = {
  planifiee:  { label: 'Planifiée',  color: 'primary' },
  'en-cours': { label: 'En cours',   color: 'warning' },
  terminee:   { label: 'Terminée',   color: 'success' },
  annulee:    { label: 'Annulée',    color: 'neutral' },
};

export const PAIEMENTS = {
  'non-paye':  { label: 'Non payé',    color: 'danger'  },
  'en-attente':{ label: 'En attente',  color: 'warning' },
  'paye':      { label: 'Payé',        color: 'success' },
};

export const PERIODICITES = {
  mensuelle:      { label: 'Mensuelle',      days: 30  },
  trimestrielle:  { label: 'Trimestrielle',  days: 91  },
  annuelle:       { label: 'Annuelle',       days: 365 },
};

export function statutBadge(statut) {
  const s = STATUTS[statut] || { label: statut, color: 'neutral' };
  return `<span class="badge badge-${s.color}">${s.label}</span>`;
}

export function paiementBadge(statut) {
  const s = PAIEMENTS[statut] || { label: statut, color: 'neutral' };
  return `<span class="badge badge-${s.color}">${s.label}</span>`;
}

// ── Email template ─────────────────────────────────────────
export function applyTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

// ── Search ─────────────────────────────────────────────────
export function searchFilter(items, query, fields) {
  if (!query || !query.trim()) return items;
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return items.filter(item =>
    fields.some(field => {
      const val = String(item[field] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return val.includes(q);
    })
  );
}

// ── DOM helpers ────────────────────────────────────────────
export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class') element.className = val;
    else if (key === 'style') Object.assign(element.style, val);
    else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), val);
    else element.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') element.insertAdjacentHTML('beforeend', child);
    else if (child instanceof Node) element.appendChild(child);
  }
  return element;
}

export function $  (sel, ctx = document) { return ctx.querySelector(sel); }
export function $$ (sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

export function setHTML(sel, html, ctx = document) {
  const el = ctx.querySelector(sel);
  if (el) el.innerHTML = html;
}

// ── Toast ──────────────────────────────────────────────────
export function toast(message, type = 'info') {
  const icons = {
    success: 'check-circle',
    error:   'x-circle',
    warning: 'alert-triangle',
    info:    'info',
  };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${message}</span>`;
  container.appendChild(t);

  if (window.lucide) lucide.createIcons({ context: t });

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(40px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ── Modal ──────────────────────────────────────────────────
export function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');
  if (!overlay || !container) return;
  container.innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons({ context: container });
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
});

// ── ID Generation ──────────────────────────────────────────
export function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Debounce ───────────────────────────────────────────────
export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Format duration ────────────────────────────────────────
export function formatDuration(minutes) {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${m.toString().padStart(2,'0')}` : `${h}h`;
}

// ── Periodicite label ──────────────────────────────────────
export function periodiciteLabel(p) {
  return PERIODICITES[p]?.label || p || '—';
}
