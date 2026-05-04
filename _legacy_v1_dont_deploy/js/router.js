/**
 * HelpPilot — router.js
 * Hash-based SPA router
 */

const routes = {};
let currentRoute = null;
let currentCleanup = null;

export function defineRoutes(routeMap) {
  Object.assign(routes, routeMap);
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

function parseHash() {
  const hash = window.location.hash.slice(1) || '/dashboard';
  // Match pattern like /clients/c1/edit or /interventions/i1
  const segments = hash.split('/').filter(Boolean);
  if (segments.length === 0) return { path: '/dashboard', params: {} };

  // Try exact match first
  const exactPath = '/' + segments.join('/');
  if (routes[exactPath]) return { path: exactPath, params: {} };

  // Try parameterized routes
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

export function initRouter() {
  async function render() {
    const { path, params } = parseHash();

    // Cleanup previous route
    if (currentCleanup) {
      try { currentCleanup(); } catch {}
      currentCleanup = null;
    }

    const handler = routes[path];
    if (handler) {
      currentRoute = { path, params };
      const result = await handler({ params, navigate });
      if (typeof result === 'function') currentCleanup = result;
    }
  }

  window.addEventListener('hashchange', render);
  render(); // Initial render
}
