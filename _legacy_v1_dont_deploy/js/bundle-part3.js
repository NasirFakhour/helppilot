/* ═══════════════════════════════════════════
   ROUTER - V1 Streamlined
═══════════════════════════════════════════ */
(function() {
  const routes = {};
  let currentRoute = null;

  window.defineRoutes = function(routeMap) {
    Object.assign(routes, routeMap);
  };

  window.navigate = function(path) {
    window.location.hash = path;
  };

  function parseHash() {
    const hash = window.location.hash.slice(1) || '/dashboard';
    const segments = hash.split('/').filter(Boolean);
    if (segments.length === 0) return { path: '/dashboard', params: {} };
    const exactPath = '/' + segments.join('/');
    if (routes[exactPath]) return { path: exactPath, params: {} };
    for (const pattern of Object.keys(routes)) {
      const patternSegments = pattern.split('/').filter(Boolean);
      if (patternSegments.length !== segments.length) continue;
      const params = {};
      let match = true;
      for (let i = 0; i < patternSegments.length; i++) {
        if (patternSegments[i].startsWith(':')) {
          params[patternSegments[i].slice(1)] = segments[i];
        } else if (patternSegments[i] !== segments[i]) {
          match = false;
          break;
        }
      }
      if (match) return { path: pattern, params };
    }
    return { path: '/dashboard', params: {} };
  }

  window.initRouter = function() {
    async function render() {
      const { path, params } = parseHash();
      const handler = routes[path];
      if (handler) {
        currentRoute = { path, params };
        await handler({ params, navigate: window.navigate });
      }
    }
    window.addEventListener('hashchange', render);
    render();
  };
})();

/* ═══════════════════════════════════════════
   APP ENTRY POINT - V1 Demo Focused
═══════════════════════════════════════════ */

function showLoginScreen() {
  document.getElementById('login-screen')?.classList.remove('hidden');
  document.getElementById('app-layout')?.classList.add('hidden');
  window.renderLogin(() => {
    showAppLayout();
    setupRoutes();
    window.initRouter();
    window.location.hash = '/dashboard';
  });
}

function showAppLayout() {
  document.getElementById('login-screen')?.classList.add('hidden');
  document.getElementById('app-layout')?.classList.remove('hidden');
}

function setupRoutes() {
  window.defineRoutes({
    '/dashboard':              () => { setActive('dashboard'); window.renderDashboard(); },
    '/clients':                () => { setActive('clients');   window.renderClients(); },
    '/clients/:id':            ({ params }) => { setActive('clients'); window.renderClientDetail({ params }); },
    '/interventions':          () => { setActive('interventions'); window.renderInterventions(); },
    '/interventions/new':      ({ params }) => { setActive('interventions'); window.renderInterventionForm({ params: {} }); },
    '/interventions/:id/edit': ({ params }) => { setActive('interventions'); window.renderInterventionForm({ params }); },
    '/relances':               () => { setActive('relances');  window.renderRelances(); },
    '/settings':               () => { setActive('settings');  window.renderSettings(); },
  });
}

function setActive(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.route === route);
  });
  updateBadges();
}

function updateBadges() {
  try {
    const { stats } = window.getDashboardData();
    const badge = document.getElementById('relance-badge');
    if (badge) {
      badge.textContent = stats.relancesCount;
      badge.classList.toggle('hidden', stats.relancesCount === 0);
    }
  } catch {}
}

function setupSidebar() {
  const menuToggle = document.getElementById('menu-toggle'), sidebarClose = document.getElementById('sidebar-close'), sidebar = document.getElementById('sidebar'), overlay = document.getElementById('sidebar-overlay');
  menuToggle?.addEventListener('click', () => { sidebar?.classList.add('open'); overlay?.classList.remove('hidden'); });
  sidebarClose?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.add('hidden'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.add('hidden'); });
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => { if (window.innerWidth < 768) { sidebar?.classList.remove('open'); overlay?.classList.add('hidden'); } });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.initStore();
  setupSidebar();
  if (window.isAuthenticated()) {
    showAppLayout();
    setupRoutes();
    window.initRouter();
  } else {
    showLoginScreen();
  }
  if (window.lucide) lucide.createIcons();
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  window.logout();
  window.location.hash = '';
  showLoginScreen();
});
