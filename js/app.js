/**
 * HelpPilot — app.js
 * Main application entry point: auth gate, routing, navigation
 */

import { initStore, isAuthenticated, logout, getDashboardData } from './store.js';
import { defineRoutes, initRouter, navigate } from './router.js';

// Pages
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderClients } from './pages/clients.js';
import { renderClientDetail } from './pages/client-detail.js';
import { renderInterventions } from './pages/interventions.js';
import { renderInterventionForm } from './pages/intervention-form.js';
import { renderRecurrences } from './pages/recurrences.js';
import { renderRelances } from './pages/relances.js';
import { renderSettings } from './pages/settings.js';

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initStore();
  setupAuthGate();
  setupSidebar();
  setupQuickAdd();

  if (isAuthenticated()) {
    showAppLayout();
    setupRoutes();
    initRouter();
  } else {
    showLoginScreen();
  }

  // Init Lucide icons
  if (window.lucide) lucide.createIcons();
});

// ── Auth Gate ─────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById('login-screen')?.classList.remove('hidden');
  document.getElementById('app-layout')?.classList.add('hidden');

  renderLogin(() => {
    showAppLayout();
    setupRoutes();
    initRouter();
    // Navigate to dashboard after login
    window.location.hash = '/dashboard';
  });

  if (window.lucide) lucide.createIcons();
}

function showAppLayout() {
  document.getElementById('login-screen')?.classList.add('hidden');
  document.getElementById('app-layout')?.classList.remove('hidden');
}

// ── Logout ─────────────────────────────────────────────────
document.getElementById('logout-btn')?.addEventListener('click', () => {
  logout();
  window.location.hash = '';
  showLoginScreen();
  document.getElementById('login-screen')?.classList.remove('hidden');
  document.getElementById('app-layout')?.classList.add('hidden');
});

// ── Routes ─────────────────────────────────────────────────
function setupRoutes() {
  defineRoutes({
    '/dashboard':                  () => { setActive('dashboard'); setTitle('Tableau de bord'); renderDashboard(); },
    '/clients':                    () => { setActive('clients');   setTitle('Clients');          renderClients(); },
    '/clients/:id':                ({ params }) => { setActive('clients'); setTitle('Fiche client'); renderClientDetail({ params }); },
    '/interventions':              () => { setActive('interventions'); setTitle('Interventions');  renderInterventions(); },
    '/interventions/new':          ({ params }) => { setActive('interventions'); setTitle('Nouvelle intervention'); renderInterventionForm({ params: {} }); },
    '/interventions/:id/edit':     ({ params }) => { setActive('interventions'); setTitle('Modifier'); renderInterventionForm({ params }); },
    '/recurrences':                () => { setActive('recurrences'); setTitle('Récurrences');    renderRecurrences(); },
    '/relances':                   () => { setActive('relances');   setTitle('Relances');        renderRelances(); updateRelanceBadge(); },
    '/settings':                   () => { setActive('settings');   setTitle('Paramètres');      renderSettings(); },
  });
}

function setActive(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === route);
  });
  updateRelanceBadge();
}

function setTitle(title) {
  const el = document.getElementById('page-title');
  if (el) el.textContent = title;
}

function updateRelanceBadge() {
  try {
    const { stats } = getDashboardData();
    const badge = document.getElementById('relance-badge');
    if (!badge) return;
    if (stats.relancesCount > 0) {
      badge.textContent = stats.relancesCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch {}
}

// ── Sidebar (mobile) ───────────────────────────────────────
function setupSidebar() {
  const menuToggle   = document.getElementById('menu-toggle');
  const sidebarClose = document.getElementById('sidebar-close');
  const sidebar      = document.getElementById('sidebar');
  const overlay      = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    sidebar?.classList.add('open');
    overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.add('hidden');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar on nav item click (mobile)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 768) closeSidebar();
    });
  });

  // Re-init Lucide whenever hash changes (page re-render)
  window.addEventListener('hashchange', () => {
    setTimeout(() => {
      if (window.lucide) lucide.createIcons();
      updateRelanceBadge();
    }, 50);
  });
}

// ── Quick Add Button ───────────────────────────────────────
function setupQuickAdd() {
  document.getElementById('quick-add-btn')?.addEventListener('click', () => {
    window.location.hash = '/interventions/new';
  });
}

// ── Handle direct hash on load ─────────────────────────────
window.addEventListener('load', () => {
  if (!window.location.hash || window.location.hash === '#') {
    if (isAuthenticated()) {
      window.location.hash = '/dashboard';
    }
  }
});
