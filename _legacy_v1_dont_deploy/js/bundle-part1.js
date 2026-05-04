/* ═══════════════════════════════════════════
   DEMO DATA - V1 Focus (Local Techs)
═══════════════════════════════════════════ */
const DEMO_CLIENTS = [
  { id:'c1', nom:'Morel', prenom:'Philippe', email:'p.morel@boulangerie-du-coin.fr', telephone:'06 88 12 34 56', adresse:'12 rue de la Paix', ville:'Lyon', codePostal:'69002', notes:'Boulangerie "Le Fournil". Intervenir de préférence après 14h.', createdAt:'2024-01-15T09:00:00Z', updatedAt:'2024-10-20T14:30:00Z' },
  { id:'c2', nom:'Vasseur', prenom:'Catherine', email:'c.vasseur@outlook.fr', telephone:'07 23 45 67 89', adresse:'45 avenue Jean Jaurès', ville:'Villeurbanne', codePostal:'69100', notes:'Particulier. Problèmes fréquents avec la box Orange.', createdAt:'2024-03-20T11:00:00Z', updatedAt:'2024-11-05T10:15:00Z' },
  { id:'c3', nom:'Girard', prenom:'Cabinet', email:'secretariat@girard-avocats.fr', telephone:'04 72 11 22 33', adresse:'8 rue de la République', ville:'Lyon', codePostal:'69002', notes:'Cabinet d\'avocats. 5 postes de travail. Serveur NAS Synology.', createdAt:'2023-11-01T08:30:00Z', updatedAt:'2025-01-10T16:00:00Z' },
  { id:'c4', nom:'Lemoine', prenom:'Stéphane', email:'s.lemoine@garage-pro.com', telephone:'06 45 67 89 01', adresse:'3 impasse des Alouettes', ville:'Vénissieux', codePostal:'69200', notes:'Garage auto. Logiciel métier spécifique à mettre à jour.', createdAt:'2024-06-08T14:00:00Z', updatedAt:'2024-09-12T09:45:00Z' },
  { id:'c5', nom:'Petit', prenom:'Isabelle', email:'isabelle.petit@gmail.com', telephone:'07 89 01 23 45', adresse:'27 rue Garibaldi', ville:'Lyon', codePostal:'69006', notes:'Freelance Graphic Design. Travaille sur iMac.', createdAt:'2024-08-15T10:00:00Z', updatedAt:'2025-02-01T11:30:00Z' },
];

(function buildDemoInterventions() {
  const today = new Date();
  const fmt = d => d.toISOString();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate()+n); return r; };
  const subDays = (d, n) => addDays(d, -n);
  const setTime = (d, h, m=0) => { const r = new Date(d); r.setHours(h,m,0,0); return r; };

  window.DEMO_INTERVENTIONS = [
    { id:'i1', clientId:'c1', date:fmt(setTime(today,14,0)), heure:'14:00', duree:45, adresse:'12 rue de la Paix, 69002 Lyon', description:'Mise à jour logiciel de caisse TPV', statut:'planifiee', montant:65, statut_paiement:'non-paye', rappel_actif:true, rappel_envoye:true, recurrente:false, notes:'Vérifier l\'imprimante ticket aussi', createdAt:fmt(subDays(today,2)), updatedAt:fmt(subDays(today,1)) },
    { id:'i2', clientId:'c3', date:fmt(setTime(today,10,30)), heure:'10:30', duree:90, adresse:'8 rue de la République, 69002 Lyon', description:'Audit sécurité réseau et MAJ Serveur NAS', statut:'planifiee', montant:150, statut_paiement:'non-paye', rappel_actif:true, rappel_envoye:true, recurrente:false, notes:'', createdAt:fmt(subDays(today,5)), updatedAt:fmt(subDays(today,1)) },
    { id:'i3', clientId:'c2', date:fmt(setTime(subDays(today,3),15,0)), heure:'15:00', duree:60, adresse:'45 avenue Jean Jaurès, 69100 Villeurbanne', description:'Installation nouvelle Box internet + Wifi', statut:'terminee', montant:80, statut_paiement:'non-paye', rappel_actif:false, rappel_envoye:false, recurrente:false, notes:'Configuration OK', createdAt:fmt(subDays(today,10)), updatedAt:fmt(subDays(today,3)) },
    { id:'i4', clientId:'c4', date:fmt(setTime(subDays(today,14),9,0)), heure:'09:00', duree:120, adresse:'3 impasse des Alouettes, 69200 Vénissieux', description:'Nettoyage virus et optimisation 3 PC', statut:'terminee', montant:180, statut_paiement:'paye', rappel_actif:true, rappel_envoye:true, recurrente:false, notes:'PCs très encrassés physiquement aussi.', createdAt:fmt(subDays(today,20)), updatedAt:fmt(subDays(today,14)) },
    { id:'i5', clientId:'c5', date:fmt(setTime(subDays(today,22),11,0)), heure:'11:00', duree:60, adresse:'27 rue Garibaldi, 69006 Lyon', description:'Calibration écran et installation Creative Cloud', statut:'terminee', montant:95, statut_paiement:'non-paye', rappel_actif:false, rappel_envoye:false, recurrente:false, notes:'', createdAt:fmt(subDays(today,25)), updatedAt:fmt(subDays(today,22)) },
    { id:'i6', clientId:'c1', date:fmt(setTime(subDays(today,8),15,30)), heure:'15:30', duree:30, adresse:'12 rue de la Paix, 69002 Lyon', description:'Dépannage imprimante réseau', statut:'terminee', montant:45, statut_paiement:'non-paye', rappel_actif:false, rappel_envoye:false, recurrente:false, notes:'', createdAt:fmt(subDays(today,10)), updatedAt:fmt(subDays(today,8)) },
  ];
})();

window.DEMO_CLIENTS = DEMO_CLIENTS;

window.DEMO_SETTINGS = {
  nom_societe:'Mon Entreprise IT',
  email_expediteur:'contact@mon-it.fr',
  telephone_societe:'04 78 00 11 22',
  signature_email:'Cordialement,\nVotre Technicien\nMon Entreprise IT\n📞 04 78 00 11 22',
  modele_rappel:'Bonjour {{prenom}},\n\nJe vous rappelle notre intervention prévue le {{date}} à {{heure}}.\n\nÀ tout à l\'heure,\n{{signature}}',
  modele_relance:'Bonjour {{prenom}},\n\nSauf erreur de ma part, le règlement de {{montant}} pour l\'intervention du {{date}} ne m\'est pas encore parvenu.\n\nMerci de faire le nécessaire,\n{{signature}}',
};

/* ═══════════════════════════════════════════
   STORE - Simple V1
═══════════════════════════════════════════ */
(function() {
  const KEYS = { clients:'hp_clients', interventions:'hp_interventions', settings:'hp_settings', auth:'hp_auth', initialized:'hp_initialized' };
  const state = { clients:[], interventions:[], settings:{}, auth:null };
  const subscribers = new Set();

  function load(key, fallback) { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } }
  function save(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function notify() { subscribers.forEach(fn => fn(state)); }

  window.subscribe = fn => { subscribers.add(fn); return () => subscribers.delete(fn); };

  window.initStore = function() {
    if (!localStorage.getItem(KEYS.initialized)) {
      save(KEYS.clients, window.DEMO_CLIENTS);
      save(KEYS.interventions, window.DEMO_INTERVENTIONS);
      save(KEYS.settings, window.DEMO_SETTINGS);
      localStorage.setItem(KEYS.initialized, '1');
    }
    state.clients = load(KEYS.clients, []);
    state.interventions = load(KEYS.interventions, []);
    state.settings = load(KEYS.settings, window.DEMO_SETTINGS);
    state.auth = load(KEYS.auth, null);
  };

  window.isAuthenticated = () => !!state.auth;
  window.login = function(email, password) {
    const user = { email, name:'Technicien Démo', initials:'TD', role:'Gérant' };
    state.auth = user; save(KEYS.auth, user); notify(); return user;
  };
  window.logout = function() { state.auth = null; localStorage.removeItem(KEYS.auth); notify(); };
  window.getUser = () => state.auth;

  window.getClients = () => [...state.clients];
  window.getClient = id => state.clients.find(c => c.id === id) || null;
  window.createClient = function(data) {
    const client = { ...data, id:`c${Date.now()}`, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    state.clients.unshift(client); save(KEYS.clients, state.clients); notify(); return client;
  };
  window.updateClient = function(id, data) {
    const idx = state.clients.findIndex(c => c.id === id);
    if (idx === -1) return null;
    state.clients[idx] = { ...state.clients[idx], ...data, updatedAt:new Date().toISOString() };
    save(KEYS.clients, state.clients); notify(); return state.clients[idx];
  };
  window.deleteClient = function(id) {
    state.clients = state.clients.filter(c => c.id !== id);
    state.interventions = state.interventions.filter(i => i.clientId !== id);
    save(KEYS.clients, state.clients); save(KEYS.interventions, state.interventions); notify();
  };

  window.getInterventions = () => [...state.interventions];
  window.getIntervention = id => state.interventions.find(i => i.id === id) || null;
  window.getClientInterventions = clientId => state.interventions.filter(i => i.clientId === clientId).sort((a,b) => new Date(b.date)-new Date(a.date));
  window.createIntervention = function(data) {
    const iv = { ...data, id:`i${Date.now()}`, rappel_envoye:false, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    state.interventions.unshift(iv); save(KEYS.interventions, state.interventions); notify(); return iv;
  };
  window.updateIntervention = function(id, data) {
    const idx = state.interventions.findIndex(i => i.id === id);
    if (idx === -1) return null;
    state.interventions[idx] = { ...state.interventions[idx], ...data, updatedAt:new Date().toISOString() };
    save(KEYS.interventions, state.interventions); notify(); return state.interventions[idx];
  };
  window.deleteIntervention = function(id) {
    state.interventions = state.interventions.filter(i => i.id !== id);
    save(KEYS.interventions, state.interventions); notify();
  };

  window.getDashboardData = function() {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    const all = state.interventions;
    const todayInterventions = all.filter(i => { const d=new Date(i.date); return d>=todayStart && d<=todayEnd && i.statut!=='annulee'; }).sort((a,b)=>new Date(a.date)-new Date(b.date));
    const overdueInterventions = all.filter(i => { const d=new Date(i.date); return d<todayStart && (i.statut==='planifiee'||i.statut==='en-cours'); }).sort((a,b)=>new Date(b.date)-new Date(a.date));
    const unpaidCompleted = all.filter(i => i.statut==='terminee' && i.statut_paiement==='non-paye');
    const relances = unpaidCompleted.map(i => {
      const days = Math.floor((now - new Date(i.updatedAt||i.date))/(1000*60*60*24));
      let type = null;
      if (days>=21) type='J+21'; else if (days>=14) type='J+14'; else if (days>=7) type='J+7';
      return { ...i, daysPassed:days, relanceType:type };
    }).filter(i => i.relanceType !== null);
    const pendingPayments = unpaidCompleted.reduce((s,i)=>s+(i.montant||0),0);
    return { todayInterventions, overdueInterventions, relances, stats:{ totalClients:state.clients.length, todayCount:todayInterventions.length, overdueCount:overdueInterventions.length, relancesCount:relances.length, pendingPayments } };
  };

  window.getSettings = () => ({ ...state.settings });
  window.updateSettings = function(data) { state.settings = { ...state.settings, ...data }; save(KEYS.settings, state.settings); notify(); return state.settings; };
  window.markRelanceSent = id => window.updateIntervention(id, { statut_paiement:'en-attente', relance_envoyee_at:new Date().toISOString() });
  window.markAsPaid = id => window.updateIntervention(id, { statut_paiement:'paye' });
  window.resetToDemo = function() {
    localStorage.removeItem(KEYS.initialized);
    save(KEYS.clients, window.DEMO_CLIENTS); save(KEYS.interventions, window.DEMO_INTERVENTIONS); save(KEYS.settings, window.DEMO_SETTINGS);
    localStorage.setItem(KEYS.initialized,'1');
    state.clients=[...window.DEMO_CLIENTS]; state.interventions=[...window.DEMO_INTERVENTIONS]; state.settings={...window.DEMO_SETTINGS};
    notify();
  };
})();

/* ═══════════════════════════════════════════
   UTILS - Professional Polish
═══════════════════════════════════════════ */
window.formatDate = function(dateStr, opts={}) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', ...opts });
};
window.formatTime = dateStr => { if (!dateStr) return '—'; return new Date(dateStr).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}); };
window.formatCurrency = amount => { if (amount==null||isNaN(amount)) return '0 €'; return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',minimumFractionDigits:0}).format(amount); };
window.initials = (nom, prenom) => { const n=(nom||'').trim(),p=(prenom||'').trim(); if(!n&&!p) return '?'; return ((p[0]||'')+(n[0]||'')).toUpperCase(); };
window.fullName = client => { if (!client) return '—'; return [client.prenom,client.nom].filter(Boolean).join(' '); };
window.truncate = (str,max=60) => { if (!str) return ''; return str.length>max ? str.slice(0,max)+'…' : str; };
window.STATUTS = { planifiee:{label:'À faire',color:'primary'}, 'en-cours':{label:'En cours',color:'warning'}, terminee:{label:'Terminé',color:'success'}, annulee:{label:'Annulé',color:'neutral'} };
window.PAIEMENTS = { 'non-paye':{label:'Non réglé',color:'danger'}, 'en-attente':{label:'Relancé',color:'warning'}, 'paye':{label:'Réglé',color:'success'} };
window.statutBadge = statut => { const s=window.STATUTS[statut]||{label:statut,color:'neutral'}; return `<span class="badge badge-${s.color}">${s.label}</span>`; };
window.paiementBadge = statut => { const s=window.PAIEMENTS[statut]||{label:statut,color:'neutral'}; return `<span class="badge badge-${s.color}">${s.label}</span>`; };
window.applyTemplate = (template, vars) => template.replace(/\{\{(\w+)\}\}/g, (_,key) => vars[key]||'');
window.searchFilter = function(items, query, fields) {
  if (!query||!query.trim()) return items;
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return items.filter(item => fields.some(f => String(item[f]||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q)));
};

window.toast = function(message, type='info') {
  const icons = { success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i data-lucide="${icons[type]||'info'}"></i><span>${message}</span>`;
  container.appendChild(t);
  if (window.lucide) lucide.createIcons({ context: t });
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(40px)'; t.style.transition='all 0.3s ease'; setTimeout(()=>t.remove(),300); }, 3000);
};

window.openModal = function(html) {
  const overlay=document.getElementById('modal-overlay'), container=document.getElementById('modal-container');
  if (!overlay||!container) return;
  container.innerHTML = html;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons({ context:container });
};
window.closeModal = function() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
};
