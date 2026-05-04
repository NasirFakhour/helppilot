/* ═══════════════════════════════════════════
   PAGES - V1 Professional & Simple
═══════════════════════════════════════════ */

// --- LOGIN PAGE ---
window.renderLogin = function(onSuccess) {
  const screen = document.getElementById('login-page');
  if (!screen) return;
  screen.innerHTML = `
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">HP</div>
        <span class="login-logo-text">HelpPilot</span>
      </div>
      <h1 class="login-title">Accès Technicien</h1>
      <p class="login-subtitle">Gérez vos interventions en toute simplicité</p>
      <form id="login-form">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Email</label>
          <input type="email" id="login-email" class="form-control" value="demo@helppilot.fr" required />
        </div>
        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label">Mot de passe</label>
          <input type="password" id="login-password" class="form-control" value="demo1234" required />
        </div>
        <button type="submit" class="btn btn-primary w-full btn-lg" id="login-submit">
          <i data-lucide="log-in"></i> Se connecter
        </button>
      </form>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: screen });
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    btn.innerHTML = 'Connexion…';
    setTimeout(() => {
      window.login();
      window.toast('Bon travail !', 'success');
      onSuccess?.();
    }, 500);
  });
};

// --- DASHBOARD ---
window.renderDashboard = function() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const data = window.getDashboardData();
  const { stats, todayInterventions, overdueInterventions, relances } = data;
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>Aujourd'hui</h1>
          <p class="text-muted">${today.charAt(0).toUpperCase() + today.slice(1)}</p>
        </div>
        <div class="page-header-actions">
          <a href="#/interventions/new" class="btn btn-primary"><i data-lucide="plus"></i> Nouvelle intervention</a>
        </div>
      </div>

      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        <div class="stat-card">
          <p class="stat-label">Interventions du jour</p>
          <p class="stat-value">${stats.todayCount}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">En attente de règlement</p>
          <p class="stat-value text-danger">${window.formatCurrency(stats.pendingPayments)}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Relances à faire</p>
          <p class="stat-value text-warning">${stats.relancesCount}</p>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Agenda du jour</h3></div>
          ${todayInterventions.length > 0 ? todayInterventions.map(i => renderInterventionRow(i)).join('') : `<div class="empty-state"><p>Aucune intervention prévue</p></div>`}
          ${overdueInterventions.length > 0 ? `
            <div class="card-header" style="border-top:1px solid var(--color-border); margin-top:20px;"><h3 class="card-title text-danger">Retards</h3></div>
            ${overdueInterventions.map(i => renderInterventionRow(i, true)).join('')}
          ` : ''}
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Relances urgentes</h3></div>
          ${relances.length > 0 ? relances.slice(0, 5).map(i => renderRelanceItem(i)).join('') : `<div class="empty-state"><p>Toutes les factures sont à jour</p></div>`}
          <div class="card-footer"><a href="#/relances" class="btn btn-ghost w-full">Voir toutes les relances</a></div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
  bindInterventionClicks(content);
};

function renderInterventionRow(i, isOverdue = false) {
  const client = window.getClient(i.clientId);
  return `
    <div class="intervention-item" data-id="${i.id}" style="cursor:pointer; border-bottom:1px solid var(--color-border-light); padding:16px;">
      <div style="display:flex; justify-content:between; align-items:start; gap:12px;">
        <div style="text-align:center; min-width:60px;">
          <div style="font-weight:700; font-size:16px;">${window.formatTime(i.date)}</div>
          ${isOverdue ? `<div class="text-xs text-danger">${window.formatDate(i.date)}</div>` : ''}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600; color:var(--color-text);">${window.fullName(client)}</div>
          <div class="text-sm text-muted">${window.truncate(i.description, 60)}</div>
          <div style="margin-top:8px;">${window.statutBadge(i.statut)} ${window.paiementBadge(i.statut_paiement)}</div>
        </div>
        <div class="text-right">
          <div style="font-weight:600;">${window.formatCurrency(i.montant)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderRelanceItem(i) {
  const client = window.getClient(i.clientId);
  return `
    <div class="relance-item" style="padding:16px; border-bottom:1px solid var(--color-border-light);">
      <div style="display:flex; justify-content:between; align-items:center;">
        <div style="flex:1;">
          <div style="font-weight:600;">${window.fullName(client)}</div>
          <div class="text-xs text-muted">Facture du ${window.formatDate(i.date)} — ${window.formatCurrency(i.montant)}</div>
        </div>
        <div style="display:flex; gap:8px;">
          <span class="badge badge-warning">${i.relanceType}</span>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.hash='#/relances'"><i data-lucide="send"></i></button>
        </div>
      </div>
    </div>
  `;
}

function bindInterventionClicks(container) {
  container.querySelectorAll('.intervention-item').forEach(el => {
    el.addEventListener('click', () => { window.location.hash = `/interventions/${el.dataset.id}/edit`; });
  });
}

// --- CLIENTS ---
window.renderClients = function() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const clients = window.getClients();
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <h1>Mes Clients</h1>
        <button class="btn btn-primary" id="add-client-btn"><i data-lucide="plus"></i> Nouveau client</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table table-clickable">
            <thead><tr><th>Client</th><th>Ville</th><th>Dernière intervention</th><th>Actions</th></tr></thead>
            <tbody>
              ${clients.map(c => {
                const ivs = window.getClientInterventions(c.id);
                const last = ivs[0];
                return `
                  <tr onclick="window.location.hash='/clients/${c.id}'">
                    <td>
                      <div style="display:flex; align-items:center; gap:10px;">
                        <div class="avatar" style="width:32px; height:32px; font-size:12px;">${window.initials(c.nom, c.prenom)}</div>
                        <div style="font-weight:600;">${window.fullName(c)}</div>
                      </div>
                    </td>
                    <td class="text-muted">${c.ville || '—'}</td>
                    <td class="text-sm">${last ? window.formatDate(last.date) : 'Aucune'}</td>
                    <td><i data-lucide="chevron-right" style="width:16px;"></i></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
  document.getElementById('add-client-btn')?.addEventListener('click', () => window.openClientModal());
};

// --- CLIENT DETAIL ---
window.renderClientDetail = function({ params }) {
  const content = document.getElementById('page-content');
  if (!content) return;
  const client = window.getClient(params.id);
  if (!client) return;
  const interventions = window.getClientInterventions(client.id);

  content.innerHTML = `
    <div class="animate-fade-in">
      <div style="margin-bottom:20px;"><a href="#/clients" class="btn btn-ghost btn-sm">← Retour aux clients</a></div>
      <div style="display:grid; grid-template-columns:1fr 350px; gap:24px; align-items:start;">
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:between; align-items:center;">
            <h2 class="card-title">Fiche Client</h2>
            <button class="btn btn-secondary btn-sm" id="edit-client-btn"><i data-lucide="pencil"></i> Modifier</button>
          </div>
          <div class="card-body">
            <div style="display:flex; align-items:center; gap:20px; margin-bottom:24px;">
              <div class="avatar avatar-xl">${window.initials(client.nom, client.prenom)}</div>
              <div><h1 style="margin:0;">${window.fullName(client)}</h1><p class="text-muted">${client.ville || ''}</p></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
              <div class="info-row"><span class="info-label">Email</span><span class="info-value">${client.email || '—'}</span></div>
              <div class="info-row"><span class="info-label">Téléphone</span><span class="info-value">${client.telephone || '—'}</span></div>
              <div class="info-row"><span class="info-label">Adresse</span><span class="info-value">${client.adresse || '—'}</span></div>
              <div class="info-row"><span class="info-label">Code Postal</span><span class="info-value">${client.codePostal || '—'}</span></div>
            </div>
            ${client.notes ? `<div style="margin-top:20px;"><p class="info-label">Notes</p><p class="text-sm">${client.notes}</p></div>` : ''}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Historique</h3></div>
          <div style="max-height:500px; overflow-y:auto;">
            ${interventions.map(i => `
              <div class="intervention-item" onclick="window.location.hash='/interventions/${i.id}/edit'" style="padding:12px 16px; border-bottom:1px solid var(--color-border-light); cursor:pointer;">
                <div style="display:flex; justify-content:between; align-items:center;">
                  <div class="text-sm font-semibold">${window.formatDate(i.date)}</div>
                  <div class="font-bold">${window.formatCurrency(i.montant)}</div>
                </div>
                <div class="text-xs text-muted">${window.truncate(i.description, 40)}</div>
                <div style="margin-top:4px;">${window.statutBadge(i.statut)}</div>
              </div>
            `).join('')}
          </div>
          <div class="card-footer"><a href="#/interventions/new?client=${client.id}" class="btn btn-primary w-full">Nouvelle intervention</a></div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
  document.getElementById('edit-client-btn')?.addEventListener('click', () => window.openClientModal(client));
};

// --- INTERVENTIONS ---
window.renderInterventions = function() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const ivs = window.getInterventions().sort((a,b) => new Date(b.date) - new Date(a.date));
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <h1>Toutes les Interventions</h1>
        <a href="#/interventions/new" class="btn btn-primary"><i data-lucide="plus"></i> Nouvelle</a>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table class="table table-clickable">
            <thead><tr><th>Date</th><th>Client</th><th>Description</th><th>Statut</th><th>Montant</th></tr></thead>
            <tbody>${ivs.map(i => `<tr onclick="window.location.hash='/interventions/${i.id}/edit'"><td>${window.formatDate(i.date)}</td><td>${window.fullName(window.getClient(i.clientId))}</td><td>${window.truncate(i.description, 40)}</td><td>${window.statutBadge(i.statut)}</td><td class="font-bold">${window.formatCurrency(i.montant)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
};

// --- INTERVENTION FORM ---
window.renderInterventionForm = function({ params }) {
  const content = document.getElementById('page-content');
  if (!content) return;
  const isEdit = !!params.id;
  const iv = isEdit ? window.getIntervention(params.id) : {};
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const prefilledClientId = urlParams.get('client') || '';
  const clients = window.getClients();

  content.innerHTML = `
    <div class="animate-fade-in" style="max-width:600px; margin: 0 auto;">
      <div class="card">
        <div class="card-header"><h2 class="card-title">${isEdit ? 'Modifier l\'intervention' : 'Nouvelle Intervention'}</h2></div>
        <div class="card-body">
          <form id="interv-form" style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group"><label class="form-label">Client *</label><select id="if-client" class="form-control" required><option value="">— Choisir —</option>${clients.map(c => `<option value="${c.id}" ${(iv.clientId || prefilledClientId) === c.id ? 'selected' : ''}>${window.fullName(c)}</option>`).join('')}</select></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Date *</label><input type="date" id="if-date" class="form-control" value="${iv.date ? iv.date.split('T')[0] : new Date().toISOString().split('T')[0]}" required /></div><div class="form-group"><label class="form-label">Heure</label><input type="time" id="if-heure" class="form-control" value="${iv.heure || ''}" /></div></div>
            <div class="form-group"><label class="form-label">Description rapide *</label><input type="text" id="if-desc" class="form-control" value="${iv.description || ''}" placeholder="Ex: Réparation PC" required /></div>
            <div class="form-group"><label class="form-label">Montant (€)</label><input type="number" id="if-montant" class="form-control" value="${iv.montant || ''}" placeholder="0" /></div>
            <div class="form-row"><div class="form-group"><label class="form-label">Statut</label><select id="if-statut" class="form-control">${Object.entries(window.STATUTS).map(([k,v]) => `<option value="${k}" ${iv.statut === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div><div class="form-group"><label class="form-label">Paiement</label><select id="if-paiement" class="form-control"><option value="non-paye" ${iv.statut_paiement === 'non-paye' ? 'selected' : ''}>À percevoir</option><option value="paye" ${iv.statut_paiement === 'paye' ? 'selected' : ''}>Réglé</option></select></div></div>
            <div class="form-group"><label class="form-label">Notes d'intervention</label><textarea id="if-notes" class="form-control" rows="3">${iv.notes || ''}</textarea></div>
          </form>
        </div>
        <div class="card-footer" style="display:flex; justify-content:between;">
          ${isEdit ? `<button class="btn btn-danger btn-sm" id="del-interv-btn"><i data-lucide="trash"></i> Supprimer</button>` : '<div></div>'}
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" onclick="window.location.hash='/interventions'">Annuler</button>
            <button class="btn btn-primary" id="save-interv-btn">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
  document.getElementById('save-interv-btn')?.addEventListener('click', () => {
    const data = { clientId: document.getElementById('if-client').value, date: document.getElementById('if-date').value + 'T00:00:00', heure: document.getElementById('if-heure').value, description: document.getElementById('if-desc').value, montant: parseFloat(document.getElementById('if-montant').value) || 0, statut: document.getElementById('if-statut').value, statut_paiement: document.getElementById('if-paiement').value, notes: document.getElementById('if-notes').value };
    if (!data.clientId || !data.description) { window.toast('Veuillez remplir les champs obligatoires', 'error'); return; }
    if (isEdit) window.updateIntervention(params.id, data); else window.createIntervention(data);
    window.toast('Intervention enregistrée', 'success'); window.location.hash = '/interventions';
  });
  document.getElementById('del-interv-btn')?.addEventListener('click', () => { if(confirm('Supprimer ?')) { window.deleteIntervention(params.id); window.location.hash = '/interventions'; } });
};

// --- RELANCES ---
window.renderRelances = function() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const relances = window.getDashboardData().relances;
  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header"><h1>Relances de paiement</h1><p class="text-muted">Gérez vos factures en attente</p></div>
      <div class="card">
        ${relances.length > 0 ? relances.map(r => `
          <div class="relance-item" style="padding:20px; border-bottom:1px solid var(--color-border-light); display:flex; justify-content:between; align-items:center;">
            <div style="flex:1;">
              <div style="font-weight:700; font-size:16px;">${window.fullName(window.getClient(r.clientId))}</div>
              <div class="text-sm text-muted">${r.description} — ${window.formatDate(r.date)}</div>
              <div class="text-lg font-bold text-primary" style="margin-top:4px;">${window.formatCurrency(r.montant)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
              <span class="badge badge-danger">${r.relanceType}</span>
              <button class="btn btn-primary" onclick="window.sendRelance('${r.id}')"><i data-lucide="send"></i> Envoyer relance</button>
              <button class="btn btn-secondary" onclick="window.markPaid('${r.id}')">Marquer comme payé</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state"><p>Aucune relance à effectuer</p></div>'}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons({ context: content });
};

window.sendRelance = function(id) {
  const iv = window.getIntervention(id);
  const client = window.getClient(iv.clientId);
  const settings = window.getSettings();
  const msg = window.applyTemplate(settings.modele_relance, { prenom: client.prenom, montant: window.formatCurrency(iv.montant), date: window.formatDate(iv.date), signature: settings.signature_email });
  window.openModal(`
    <div class="modal-header"><h2>Aperçu de la relance</h2><button class="btn-icon" onclick="window.closeModal()"><i data-lucide="x"></i></button></div>
    <div class="modal-body"><p class="text-sm">Envoyé à : <strong>${client.email}</strong></p><textarea class="form-control" rows="8" style="margin-top:12px;">${msg}</textarea></div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="window.closeModal()">Annuler</button><button class="btn btn-primary" id="confirm-relance">Confirmer l'envoi</button></div>
  `);
  document.getElementById('confirm-relance')?.addEventListener('click', () => { window.markRelanceSent(id); window.toast('Relance envoyée', 'success'); window.closeModal(); window.renderRelances(); });
};

window.markPaid = function(id) { window.markAsPaid(id); window.toast('Paiement enregistré', 'success'); window.renderRelances(); };

// --- SETTINGS ---
// --- CLIENT MODAL ---
window.openClientModal = function(existingClient = null) {
  const isEdit = !!existingClient;
  const c = existingClient || {};

  window.openModal(`
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Modifier' : 'Nouveau'} client</h2>
      <button class="btn-icon" onclick="window.closeModal()"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <form id="client-form" novalidate>
        <div class="form-row" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" for="cf-prenom">Prénom <span class="required">*</span></label>
            <input type="text" id="cf-prenom" class="form-control" value="${c.prenom || ''}" required placeholder="Jean" />
          </div>
          <div class="form-group">
            <label class="form-label" for="cf-nom">Nom <span class="required">*</span></label>
            <input type="text" id="cf-nom" class="form-control" value="${c.nom || ''}" required placeholder="Dupont" />
          </div>
        </div>
        <div class="form-row" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" for="cf-email">Email</label>
            <input type="email" id="cf-email" class="form-control" value="${c.email || ''}" placeholder="jean@exemple.fr" />
          </div>
          <div class="form-group">
            <label class="form-label" for="cf-tel">Téléphone</label>
            <input type="tel" id="cf-tel" class="form-control" value="${c.telephone || ''}" placeholder="06 12 34 56 78" />
          </div>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label" for="cf-adresse">Adresse</label>
          <input type="text" id="cf-adresse" class="form-control" value="${c.adresse || ''}" placeholder="12 rue des Lilas" />
        </div>
        <div class="form-row" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label" for="cf-cp">Code postal</label>
            <input type="text" id="cf-cp" class="form-control" value="${c.codePostal || ''}" placeholder="69000" />
          </div>
          <div class="form-group">
            <label class="form-label" for="cf-ville">Ville</label>
            <input type="text" id="cf-ville" class="form-control" value="${c.ville || ''}" placeholder="Lyon" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="cf-notes">Notes</label>
          <textarea id="cf-notes" class="form-control" rows="3" placeholder="Informations utiles sur ce client…">${c.notes || ''}</textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="client-cancel-btn">Annuler</button>
      <button class="btn btn-primary" id="client-save-btn">
        <i data-lucide="save"></i>
        ${isEdit ? 'Mettre à jour' : 'Créer le client'}
      </button>
    </div>
  `);

  document.getElementById('client-cancel-btn')?.addEventListener('click', window.closeModal);

  document.getElementById('client-save-btn')?.addEventListener('click', () => {
    const prenom = document.getElementById('cf-prenom').value.trim();
    const nom    = document.getElementById('cf-nom').value.trim();
    if (!nom && !prenom) {
      window.toast('Le nom ou prénom est requis', 'error');
      return;
    }
    const data = {
      prenom,
      nom,
      email:       document.getElementById('cf-email').value.trim(),
      telephone:   document.getElementById('cf-tel').value.trim(),
      adresse:     document.getElementById('cf-adresse').value.trim(),
      codePostal:  document.getElementById('cf-cp').value.trim(),
      ville:       document.getElementById('cf-ville').value.trim(),
      notes:       document.getElementById('cf-notes').value.trim(),
    };
    if (isEdit) {
      window.updateClient(existingClient.id, data);
      window.toast('Client mis à jour ✓', 'success');
      window.closeModal();
      window.renderClients();
    } else {
      const newClient = window.createClient(data);
      window.toast('Client créé avec succès ✓', 'success');
      window.closeModal();
      window.location.hash = '/clients/' + newClient.id;
    }
  });
};

// --- SETTINGS ---
window.renderSettings = function() {
  const content = document.getElementById('page-content');
  if (!content) return;
  const s = window.getSettings();
  content.innerHTML = `
    <div class="animate-fade-in" style="max-width:600px;">
      <div class="page-header"><h1>Paramètres</h1></div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Informations de l'entreprise</h3></div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:20px;">
          <div class="form-group">
            <label class="form-label">Nom de la société / Nom pro</label>
            <input type="text" id="s-societe" class="form-control" value="${s.nom_societe}" placeholder="Ex: Mon Entreprise IT" />
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Email de contact</label><input type="email" id="s-email" class="form-control" value="${s.email_expediteur}" /></div>
            <div class="form-group"><label class="form-label">Téléphone</label><input type="text" id="s-tel" class="form-control" value="${s.telephone_societe}" /></div>
          </div>
          <div class="form-group">
            <label class="form-label">Signature automatique des emails</label>
            <textarea id="s-signature" class="form-control" rows="3" style="font-family:monospace; font-size:12px;">${s.signature_email}</textarea>
          </div>
          <div style="margin-top:8px;">
            <button class="btn btn-primary" id="save-settings" style="padding-left:32px; padding-right:32px;">
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById('save-settings')?.addEventListener('click', () => {
    window.updateSettings({
      nom_societe: document.getElementById('s-societe').value,
      email_expediteur: document.getElementById('s-email').value,
      telephone_societe: document.getElementById('s-tel').value,
      signature_email: document.getElementById('s-signature').value
    });
    window.toast('Paramètres mis à jour ✓', 'success');
  });
};
