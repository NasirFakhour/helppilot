/**
 * HelpPilot — pages/relances.js
 * Payment follow-up management
 */

import {
  getInterventions, getClient, markRelanceSent, markAsPaid
} from '../store.js';
import {
  fullName, initials, formatDate, formatCurrency,
  paiementBadge, toast, applyTemplate, getSettings
} from '../utils.js';
import { getSettings as storeGetSettings } from '../store.js';
import { openModal, closeModal } from '../utils.js';

export function renderRelances() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;
  if (pageTitle) pageTitle.textContent = 'Relances de paiement';

  renderRelancesList();
}

function buildRelanceData() {
  const now = new Date();
  const interventions = getInterventions();

  const unpaid = interventions.filter(i =>
    i.statut === 'terminee' && i.statut_paiement !== 'paye'
  );

  return unpaid.map(i => {
    const completedDate = new Date(i.updatedAt || i.date);
    const daysPassed = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
    let relanceType = null;
    let urgency = 'low';

    if (daysPassed >= 21)      { relanceType = 'J+21'; urgency = 'high'; }
    else if (daysPassed >= 14) { relanceType = 'J+14'; urgency = 'medium'; }
    else if (daysPassed >= 7)  { relanceType = 'J+7';  urgency = 'low'; }

    return { ...i, daysPassed, relanceType, urgency };
  }).sort((a, b) => b.daysPassed - a.daysPassed);
}

function renderRelancesList() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const allRelances = buildRelanceData();
  const withRelance = allRelances.filter(r => r.relanceType !== null);
  const watchList   = allRelances.filter(r => r.relanceType === null);

  const totalPending = allRelances.reduce((s, i) => s + (i.montant || 0), 0);

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Relances de paiement</h1>
          <p>Suivi des factures non réglées</p>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
        <div class="stat-card">
          <div class="stat-icon stat-icon-danger"><i data-lucide="bell-ring"></i></div>
          <div class="stat-content">
            <p class="stat-label">Relances à envoyer</p>
            <p class="stat-value">${withRelance.length}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-warning"><i data-lucide="clock"></i></div>
          <div class="stat-content">
            <p class="stat-label">En surveillance</p>
            <p class="stat-value">${watchList.length}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-info"><i data-lucide="euro"></i></div>
          <div class="stat-content">
            <p class="stat-label">Montant en attente</p>
            <p class="stat-value">${formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      <!-- Relances to send -->
      ${withRelance.length > 0 ? `
        <div class="card" style="margin-bottom:20px;">
          <div class="card-header">
            <h3 class="card-title" style="color:var(--color-danger);">
              <i data-lucide="alert-circle" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
              Relances à envoyer (${withRelance.length})
            </h3>
          </div>
          ${withRelance.map(r => renderRelanceRow(r)).join('')}
        </div>
      ` : ''}

      <!-- Watch list -->
      ${watchList.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="color:var(--color-warning);">
              <i data-lucide="eye" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
              En surveillance — moins de 7 jours (${watchList.length})
            </h3>
          </div>
          ${watchList.map(r => renderWatchRow(r)).join('')}
        </div>
      ` : ''}

      ${allRelances.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="check-circle"></i></div>
            <p class="empty-state-title">Aucune relance en cours 🎉</p>
            <p class="empty-state-desc">Toutes vos factures sont à jour !</p>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Bind buttons
  content.querySelectorAll('[data-relance-send]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.relanceSend;
      showRelancePreview(id);
    });
  });

  content.querySelectorAll('[data-relance-paid]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.relancePaid;
      markAsPaid(id);
      toast('Marqué comme payé ✓', 'success');
      renderRelancesList();
    });
  });
}

function urgencyColors(urgency) {
  if (urgency === 'high')   return 'var(--color-danger)';
  if (urgency === 'medium') return 'var(--color-warning)';
  return 'var(--color-info)';
}

function renderRelanceRow(r) {
  const client = getClient(r.clientId);
  const color  = urgencyColors(r.urgency);

  return `
    <div class="relance-item" style="border-left:3px solid ${color};padding-left:20px;">
      <div class="avatar">${client ? initials(client.nom, client.prenom) : '?'}</div>
      <div class="relance-content">
        <div class="relance-client">${client ? fullName(client) : '—'}</div>
        <div class="relance-detail">
          ${r.description || '—'} — <strong>${formatCurrency(r.montant)}</strong>
          <br>
          <span class="text-xs text-muted">Terminée le ${formatDate(r.date)}</span>
          &nbsp;·&nbsp;
          <span class="text-xs" style="color:${color};">Il y a ${r.daysPassed} jour${r.daysPassed > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span class="badge" style="background:${color}1a;color:${color};">${r.relanceType}</span>
        ${paiementBadge(r.statut_paiement)}
        <button class="btn btn-sm btn-secondary" data-relance-paid="${r.id}" title="Marquer comme payé">
          <i data-lucide="check"></i>
          Payé
        </button>
        <button class="btn btn-sm btn-primary" data-relance-send="${r.id}">
          <i data-lucide="send"></i>
          Relancer
        </button>
      </div>
    </div>
  `;
}

function renderWatchRow(r) {
  const client = getClient(r.clientId);
  const daysLeft = 7 - r.daysPassed;

  return `
    <div class="relance-item">
      <div class="avatar" style="background:var(--color-warning-light);color:var(--color-warning)">
        ${client ? initials(client.nom, client.prenom) : '?'}
      </div>
      <div class="relance-content">
        <div class="relance-client">${client ? fullName(client) : '—'}</div>
        <div class="relance-detail">
          ${r.description || '—'} — <strong>${formatCurrency(r.montant)}</strong>
          <br>
          <span class="text-xs text-muted">Terminée le ${formatDate(r.date)}</span>
          &nbsp;·&nbsp;
          <span class="text-xs text-warning">Relance J+7 dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div style="flex-shrink:0;">
        <button class="btn btn-sm btn-secondary" data-relance-paid="${r.id}">
          <i data-lucide="check"></i>
          Marquer payé
        </button>
      </div>
    </div>
  `;
}

function showRelancePreview(interventionId) {
  const interventions = getInterventions();
  const iv = interventions.find(i => i.id === interventionId);
  if (!iv) return;

  const client = getClient(iv.clientId);
  const settings = storeGetSettings();

  const vars = {
    prenom:      client?.prenom || 'Client',
    nom:         client?.nom || '',
    date:        formatDate(iv.date),
    description: iv.description,
    montant:     formatCurrency(iv.montant),
    signature:   settings.signature_email || '',
  };

  const message = applyTemplate(settings.modele_relance || '', vars);

  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Aperçu de la relance</h2>
      <button class="btn-icon" onclick="document.getElementById('modal-overlay').classList.add('hidden');document.body.style.overflow=''">
        <i data-lucide="x"></i>
      </button>
    </div>
    <div class="modal-body">
      <div style="margin-bottom:16px;">
        <p class="form-label" style="margin-bottom:4px;">Destinataire</p>
        <p class="text-sm">${client ? fullName(client) : '—'} — ${client?.email || 'pas d\'email'}</p>
      </div>
      <div class="form-group">
        <label class="form-label">Message</label>
        <textarea class="form-control" rows="8" id="relance-message">${message}</textarea>
      </div>
      <p class="form-hint mt-2">Vous pouvez modifier ce message avant de l'envoyer.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="relance-cancel">Annuler</button>
      <button class="btn btn-primary" id="relance-confirm">
        <i data-lucide="send"></i>
        Envoyer la relance
      </button>
    </div>
  `);

  document.getElementById('relance-cancel')?.addEventListener('click', closeModal);
  document.getElementById('relance-confirm')?.addEventListener('click', () => {
    markRelanceSent(interventionId);
    toast('Relance envoyée avec succès 📧', 'success');
    closeModal();
    renderRelancesList();
  });
}
