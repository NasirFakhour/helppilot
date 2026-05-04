/**
 * HelpPilot — pages/intervention-form.js
 * Create / Edit intervention form
 */

import {
  getIntervention, createIntervention, updateIntervention,
  deleteIntervention, getClients, getClient
} from '../store.js';
import {
  formatDateInput, formatCurrency, fullName, toast,
  openModal, closeModal, STATUTS, PERIODICITES
} from '../utils.js';

export function renderInterventionForm({ params }) {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;

  const isEdit = !!params.id;
  const intervention = isEdit ? getIntervention(params.id) : null;

  if (isEdit && !intervention) {
    content.innerHTML = `<div class="empty-state"><p class="empty-state-title">Intervention introuvable</p><a href="#/interventions" class="btn btn-secondary mt-4">← Retour</a></div>`;
    if (window.lucide) lucide.createIcons({ context: content });
    return;
  }

  if (pageTitle) pageTitle.textContent = isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention';

  // Pre-fill client from URL param
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const prefilledClientId = urlParams.get('client') || '';

  const clients = getClients();
  const iv = intervention || {};

  // Default date/time = today
  const defaultDate = formatDateInput(new Date().toISOString());
  const defaultTime = new Date().toTimeString().slice(0, 5);

  content.innerHTML = `
    <div class="animate-fade-in" style="max-width:680px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <a href="${isEdit ? `#/interventions` : `#/interventions`}" class="btn btn-ghost btn-sm">
          <i data-lucide="arrow-left"></i>
          Interventions
        </a>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">${isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention'}</h2>
        </div>
        <div class="card-body">
          <form id="interv-form" novalidate style="display:flex;flex-direction:column;gap:20px;">

            <!-- Client -->
            <div class="form-group">
              <label class="form-label" for="if-client">Client <span class="required">*</span></label>
              <select id="if-client" class="form-control" required>
                <option value="">— Sélectionner un client —</option>
                ${clients.map(c => `
                  <option value="${c.id}" ${(iv.clientId || prefilledClientId) === c.id ? 'selected' : ''}>
                    ${fullName(c)}
                  </option>
                `).join('')}
              </select>
              <p class="form-hint">
                Client introuvable ?
                <a href="#/clients" style="color:var(--color-primary);">Créer un client</a>
              </p>
            </div>

            <!-- Date + Heure -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="if-date">Date <span class="required">*</span></label>
                <input type="date" id="if-date" class="form-control"
                  value="${iv.date ? formatDateInput(iv.date) : defaultDate}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="if-heure">Heure</label>
                <input type="time" id="if-heure" class="form-control"
                  value="${iv.heure || defaultTime}" />
              </div>
            </div>

            <!-- Duration + Amount -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="if-duree">Durée (minutes)</label>
                <input type="number" id="if-duree" class="form-control"
                  value="${iv.duree || 60}" min="15" step="15" placeholder="60" />
              </div>
              <div class="form-group">
                <label class="form-label" for="if-montant">Montant (€)</label>
                <input type="number" id="if-montant" class="form-control"
                  value="${iv.montant || ''}" min="0" step="5" placeholder="0" />
              </div>
            </div>

            <!-- Address -->
            <div class="form-group">
              <label class="form-label" for="if-adresse">Adresse d'intervention</label>
              <input type="text" id="if-adresse" class="form-control"
                value="${iv.adresse || ''}" placeholder="12 rue des Lilas, 69003 Lyon" />
              ${clients.length > 0 ? `<p class="form-hint"><button type="button" class="text-primary text-xs" id="copy-client-addr" style="background:none;border:none;cursor:pointer;color:var(--color-primary);">↗ Copier l'adresse du client</button></p>` : ''}
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label" for="if-desc">Description <span class="required">*</span></label>
              <textarea id="if-desc" class="form-control" rows="3" required
                placeholder="Décrivez l'intervention…">${iv.description || ''}</textarea>
            </div>

            <!-- Status + Payment -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="if-statut">Statut</label>
                <select id="if-statut" class="form-control">
                  ${Object.entries(STATUTS).map(([k, v]) =>
    `<option value="${k}" ${iv.statut === k ? 'selected' : ''}>${v.label}</option>`
  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="if-paiement">Paiement</label>
                <select id="if-paiement" class="form-control">
                  <option value="non-paye" ${iv.statut_paiement === 'non-paye' ? 'selected' : ''}>Non payé</option>
                  <option value="en-attente" ${iv.statut_paiement === 'en-attente' ? 'selected' : ''}>En attente</option>
                  <option value="paye" ${iv.statut_paiement === 'paye' ? 'selected' : ''}>Payé</option>
                </select>
              </div>
            </div>

            <!-- Recurrence -->
            <div class="form-group">
              <div class="toggle-group" style="margin-bottom:8px;">
                <label class="toggle">
                  <input type="checkbox" id="if-recurrente" ${iv.recurrente ? 'checked' : ''} />
                  <span class="toggle-slider"></span>
                </label>
                <label for="if-recurrente" class="form-label" style="margin:0;cursor:pointer;">Intervention récurrente</label>
              </div>
              <div id="recurrence-options" style="display:${iv.recurrente ? 'block' : 'none'};">
                <select id="if-periodicite" class="form-control">
                  ${Object.entries(PERIODICITES).map(([k, v]) =>
    `<option value="${k}" ${iv.periodicite === k ? 'selected' : ''}>${v.label}</option>`
  ).join('')}
                </select>
              </div>
            </div>

            <!-- Email reminder -->
            <div class="form-group">
              <div class="toggle-group">
                <label class="toggle">
                  <input type="checkbox" id="if-rappel" ${iv.rappel_actif ? 'checked' : ''} />
                  <span class="toggle-slider"></span>
                </label>
                <div>
                  <label for="if-rappel" class="form-label" style="margin:0;cursor:pointer;">Rappel email actif</label>
                  <p class="form-hint">Envoyer un rappel au client avant l'intervention</p>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group">
              <label class="form-label" for="if-notes">Notes internes</label>
              <textarea id="if-notes" class="form-control" rows="2"
                placeholder="Notes visibles uniquement par vous…">${iv.notes || ''}</textarea>
            </div>

          </form>
        </div>
        <div class="card-footer" style="display:flex;justify-content:flex-end;gap:12px;">
          <a href="#/interventions" class="btn btn-secondary">Annuler</a>
          <button class="btn btn-primary" id="save-interv-btn">
            <i data-lucide="save"></i>
            ${isEdit ? 'Mettre à jour' : 'Créer l\'intervention'}
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Recurrence toggle
  const recurrenteChk = document.getElementById('if-recurrente');
  const recurrenceOpts = document.getElementById('recurrence-options');
  recurrenteChk?.addEventListener('change', () => {
    recurrenceOpts.style.display = recurrenteChk.checked ? 'block' : 'none';
  });

  // Copy client address
  document.getElementById('copy-client-addr')?.addEventListener('click', () => {
    const clientId = document.getElementById('if-client').value;
    const client = getClient(clientId);
    if (client) {
      const addr = [client.adresse, client.codePostal, client.ville].filter(Boolean).join(', ');
      document.getElementById('if-adresse').value = addr;
    } else {
      toast('Sélectionnez d\'abord un client', 'warning');
    }
  });

  // Save
  document.getElementById('save-interv-btn')?.addEventListener('click', () => {
    const clientId = document.getElementById('if-client').value;
    const date = document.getElementById('if-date').value;
    const desc = document.getElementById('if-desc').value.trim();

    if (!clientId) { toast('Sélectionnez un client', 'error'); return; }
    if (!date) { toast('La date est requise', 'error'); return; }
    if (!desc) { toast('La description est requise', 'error'); return; }

    const heure = document.getElementById('if-heure').value;
    const dateTime = heure ? `${date}T${heure}:00` : `${date}T00:00:00`;

    const data = {
      clientId,
      date: dateTime,
      heure,
      duree: parseInt(document.getElementById('if-duree').value) || 60,
      montant: parseFloat(document.getElementById('if-montant').value) || 0,
      adresse: document.getElementById('if-adresse').value.trim(),
      description: desc,
      statut: document.getElementById('if-statut').value,
      statut_paiement: document.getElementById('if-paiement').value,
      recurrente: document.getElementById('if-recurrente').checked,
      periodicite: document.getElementById('if-recurrente').checked
        ? document.getElementById('if-periodicite').value
        : null,
      rappel_actif: document.getElementById('if-rappel').checked,
      notes: document.getElementById('if-notes').value.trim(),
    };

    if (isEdit) {
      updateIntervention(params.id, data);
      toast('Intervention mise à jour ✓', 'success');
    } else {
      createIntervention(data);
      toast('Intervention créée ✓', 'success');
    }
    window.location.hash = '/interventions';
  });

};
