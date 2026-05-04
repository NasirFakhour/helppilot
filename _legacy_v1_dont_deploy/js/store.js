/**
 * HelpPilot — store.js
 * Global state management with localStorage persistence
 */

import { DEMO_CLIENTS, DEMO_INTERVENTIONS, DEMO_SETTINGS } from './demo-data.js';

const STORAGE_KEYS = {
  clients:       'hp_clients',
  interventions: 'hp_interventions',
  settings:      'hp_settings',
  auth:          'hp_auth',
  initialized:   'hp_initialized_v2',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── State ─────────────────────────────────────────────────
const state = {
  clients:       [],
  interventions: [],
  settings:      {},
  auth:          null,
};

// ── Subscribers ────────────────────────────────────────────
const subscribers = new Set();

function notify() {
  subscribers.forEach(fn => fn(state));
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// ── Init ───────────────────────────────────────────────────
export function initStore() {
  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!initialized) {
    save(STORAGE_KEYS.clients,       DEMO_CLIENTS);
    save(STORAGE_KEYS.interventions, DEMO_INTERVENTIONS);
    save(STORAGE_KEYS.settings,      DEMO_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.initialized, '1');
  }

  state.clients       = load(STORAGE_KEYS.clients,       []);
  state.interventions = load(STORAGE_KEYS.interventions, []);
  state.settings      = load(STORAGE_KEYS.settings,      DEMO_SETTINGS);
  state.auth          = load(STORAGE_KEYS.auth,          null);
}

// ── Auth ───────────────────────────────────────────────────
export function isAuthenticated() {
  return !!state.auth;
}

export function login(email, password) {
  // Demo: accept any credentials
  const user = { email, name: 'Jean Démo', initials: 'JD', role: 'Technicien' };
  state.auth = user;
  save(STORAGE_KEYS.auth, user);
  notify();
  return user;
}

export function logout() {
  state.auth = null;
  localStorage.removeItem(STORAGE_KEYS.auth);
  notify();
}

export function getUser() {
  return state.auth;
}

// ── Clients ────────────────────────────────────────────────
export function getClients() {
  return [...state.clients];
}

export function getClient(id) {
  return state.clients.find(c => c.id === id) || null;
}

export function createClient(data) {
  const client = {
    ...data,
    id: `c${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.clients.unshift(client);
  save(STORAGE_KEYS.clients, state.clients);
  notify();
  return client;
}

export function updateClient(id, data) {
  const idx = state.clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  state.clients[idx] = { ...state.clients[idx], ...data, updatedAt: new Date().toISOString() };
  save(STORAGE_KEYS.clients, state.clients);
  notify();
  return state.clients[idx];
}

export function deleteClient(id) {
  state.clients = state.clients.filter(c => c.id !== id);
  state.interventions = state.interventions.filter(i => i.clientId !== id);
  save(STORAGE_KEYS.clients, state.clients);
  save(STORAGE_KEYS.interventions, state.interventions);
  notify();
}

// ── Interventions ───────────────────────────────────────────
export function getInterventions() {
  return [...state.interventions];
}

export function getIntervention(id) {
  return state.interventions.find(i => i.id === id) || null;
}

export function getClientInterventions(clientId) {
  return state.interventions
    .filter(i => i.clientId === clientId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function createIntervention(data) {
  const intervention = {
    ...data,
    id: `i${Date.now()}`,
    rappel_envoye: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.interventions.unshift(intervention);
  save(STORAGE_KEYS.interventions, state.interventions);
  notify();
  return intervention;
}

export function updateIntervention(id, data) {
  const idx = state.interventions.findIndex(i => i.id === id);
  if (idx === -1) return null;
  state.interventions[idx] = { ...state.interventions[idx], ...data, updatedAt: new Date().toISOString() };
  save(STORAGE_KEYS.interventions, state.interventions);
  notify();
  return state.interventions[idx];
}

export function deleteIntervention(id) {
  state.interventions = state.interventions.filter(i => i.id !== id);
  save(STORAGE_KEYS.interventions, state.interventions);
  notify();
}

// ── Dashboard derived data ─────────────────────────────────
export function getDashboardData() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd   = new Date(now); todayEnd.setHours(23,59,59,999);

  const all = state.interventions;

  const todayInterventions = all.filter(i => {
    const d = new Date(i.date);
    return d >= todayStart && d <= todayEnd && i.statut !== 'annulee';
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const overdueInterventions = all.filter(i => {
    const d = new Date(i.date);
    return d < todayStart && (i.statut === 'planifiee' || i.statut === 'en-cours');
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Unpaid, completed interventions needing follow-up
  const unpaidCompleted = all.filter(i =>
    i.statut === 'terminee' && i.statut_paiement !== 'paye'
  );

  const relances = unpaidCompleted.map(i => {
    const completedDate = new Date(i.updatedAt || i.date);
    const daysPassed = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
    let type = null;
    if (daysPassed >= 21) type = 'J+21';
    else if (daysPassed >= 14) type = 'J+14';
    else if (daysPassed >= 7)  type = 'J+7';
    return { ...i, daysPassed, relanceType: type };
  }).filter(i => i.relanceType !== null);

  const totalCA = all
    .filter(i => i.statut === 'terminee' && i.statut_paiement === 'paye')
    .reduce((sum, i) => sum + (i.montant || 0), 0);

  const pendingPayments = all
    .filter(i => i.statut === 'terminee' && i.statut_paiement !== 'paye')
    .reduce((sum, i) => sum + (i.montant || 0), 0);

  return {
    todayInterventions,
    overdueInterventions,
    relances,
    stats: {
      totalClients:   state.clients.length,
      todayCount:     todayInterventions.length,
      overdueCount:   overdueInterventions.length,
      relancesCount:  relances.length,
      totalCA,
      pendingPayments,
    },
  };
}

// ── Recurrences ─────────────────────────────────────────────
export function getRecurrences() {
  return state.interventions.filter(i => i.recurrente);
}

export function generateNextIntervention(id) {
  const source = state.interventions.find(i => i.id === id);
  if (!source || !source.recurrente) return null;

  const sourceDate = new Date(source.date);
  let nextDate = new Date(sourceDate);

  switch (source.periodicite) {
    case 'mensuelle':     nextDate.setMonth(nextDate.getMonth() + 1); break;
    case 'trimestrielle': nextDate.setMonth(nextDate.getMonth() + 3); break;
    case 'annuelle':      nextDate.setFullYear(nextDate.getFullYear() + 1); break;
  }

  return createIntervention({
    ...source,
    id: undefined,
    date: nextDate.toISOString(),
    statut: 'planifiee',
    statut_paiement: 'non-paye',
    rappel_envoye: false,
    recurrence_parent_id: source.id,
  });
}

// ── Settings ────────────────────────────────────────────────
export function getSettings() {
  return { ...state.settings };
}

export function updateSettings(data) {
  state.settings = { ...state.settings, ...data };
  save(STORAGE_KEYS.settings, state.settings);
  notify();
  return state.settings;
}

// ── Relance actions ─────────────────────────────────────────
export function markRelanceSent(interventionId) {
  return updateIntervention(interventionId, {
    statut_paiement: 'en-attente',
    relance_envoyee_at: new Date().toISOString(),
  });
}

export function markAsPaid(interventionId) {
  return updateIntervention(interventionId, {
    statut_paiement: 'paye',
  });
}

// ── Reset (for dev) ─────────────────────────────────────────
export function resetToDemo() {
  localStorage.removeItem(STORAGE_KEYS.initialized);
  save(STORAGE_KEYS.clients,       DEMO_CLIENTS);
  save(STORAGE_KEYS.interventions, DEMO_INTERVENTIONS);
  save(STORAGE_KEYS.settings,      DEMO_SETTINGS);
  localStorage.setItem(STORAGE_KEYS.initialized, '1');
  state.clients       = [...DEMO_CLIENTS];
  state.interventions = [...DEMO_INTERVENTIONS];
  state.settings      = { ...DEMO_SETTINGS };
  notify();
}
