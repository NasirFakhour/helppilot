/**
 * HelpPilot — pages/recurrences.js
 * Recurring interventions management
 */

import {
  getRecurrences, getClient, generateNextIntervention
} from '../store.js';
import {
  fullName, formatDate, formatCurrency, statutBadge,
  periodiciteLabel, toast, truncate
} from '../utils.js';

export function renderRecurrences() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;
  if (pageTitle) pageTitle.textContent = 'Interventions récurrentes';

  renderRecurrencesList();
}

function renderRecurrencesList() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const recurrences = getRecurrences()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const stats = {
    mensuelle:     recurrences.filter(r => r.periodicite === 'mensuelle').length,
    trimestrielle: recurrences.filter(r => r.periodicite === 'trimestrielle').length,
    annuelle:      recurrences.filter(r => r.periodicite === 'annuelle').length,
  };

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Interventions récurrentes</h1>
          <p>${recurrences.length} intervention${recurrences.length > 1 ? 's' : ''} programmée${recurrences.length > 1 ? 's' : ''}</p>
        </div>
        <div class="page-header-actions">
          <a href="#/interventions/new" class="btn btn-primary">
            <i data-lucide="plus"></i>
            Nouvelle
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
        ${renderMiniStat('repeat', 'Mensuelles', stats.mensuelle, 'stat-icon-primary')}
        ${renderMiniStat('calendar-range', 'Trimestrielles', stats.trimestrielle, 'stat-icon-warning')}
        ${renderMiniStat('calendar-days', 'Annuelles', stats.annuelle, 'stat-icon-success')}
      </div>

      <!-- List -->
      <div class="card">
        ${recurrences.length > 0
          ? `<div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Périodicité</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${recurrences.map(renderRecurrenceRow).join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="repeat"></i></div>
              <p class="empty-state-title">Aucune intervention récurrente</p>
              <p class="empty-state-desc">Activez la récurrence lors de la création d'une intervention</p>
              <a href="#/interventions/new" class="btn btn-primary mt-4">
                <i data-lucide="plus"></i>
                Créer une intervention
              </a>
             </div>`
        }
      </div>

      <!-- Info box -->
      ${recurrences.length > 0 ? `
        <div style="background:var(--color-primary-light);border:1px solid rgba(37,99,235,0.2);border-radius:var(--radius-lg);padding:16px 20px;margin-top:20px;display:flex;gap:12px;align-items:flex-start;">
          <i data-lucide="info" style="color:var(--color-primary);flex-shrink:0;width:18px;height:18px;margin-top:2px;"></i>
          <div>
            <p class="text-sm font-semibold" style="color:var(--color-primary);margin-bottom:4px;">Comment ça marche</p>
            <p class="text-sm" style="color:var(--color-primary-dark);">
              Cliquez sur "Générer la suivante" pour créer automatiquement la prochaine occurrence de l'intervention selon la périodicité définie.
            </p>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Bind generate buttons
  content.querySelectorAll('[data-generate]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.generate;
      const next = generateNextIntervention(id);
      if (next) {
        toast('Prochaine intervention créée ✓', 'success');
        renderRecurrencesList();
      } else {
        toast('Erreur lors de la génération', 'error');
      }
    });
  });

  // Edit buttons
  content.querySelectorAll('[data-edit-recur]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = `/interventions/${btn.dataset.editRecur}/edit`;
    });
  });
}

function renderMiniStat(icon, label, value, colorClass) {
  return `
    <div class="stat-card" style="padding:16px 20px;">
      <div class="stat-icon ${colorClass}" style="width:36px;height:36px;">
        <i data-lucide="${icon}" style="width:16px;height:16px;"></i>
      </div>
      <div class="stat-content">
        <p class="stat-label">${label}</p>
        <p class="stat-value" style="font-size:20px;">${value}</p>
      </div>
    </div>
  `;
}

function renderRecurrenceRow(r) {
  const client = getClient(r.clientId);
  const now = new Date();
  const rDate = new Date(r.date);
  const isPast = rDate < now;

  return `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="avatar" style="width:28px;height:28px;font-size:11px;">
            ${client ? (client.prenom?.[0]||'')+(client.nom?.[0]||'') : '?'}
          </div>
          <span class="text-sm font-medium">${client ? fullName(client) : '—'}</span>
        </div>
      </td>
      <td><span class="text-sm">${truncate(r.description, 45)}</span></td>
      <td>
        <span class="badge badge-info">
          <i data-lucide="repeat" style="width:10px;height:10px;"></i>
          ${periodiciteLabel(r.periodicite)}
        </span>
      </td>
      <td>
        <span class="text-sm ${isPast && r.statut !== 'terminee' ? 'text-danger font-medium' : ''}">
          ${formatDate(r.date)}
        </span>
        ${isPast && r.statut !== 'terminee' ? '<br><span class="text-xs text-danger">En retard</span>' : ''}
      </td>
      <td class="font-semibold">${formatCurrency(r.montant)}</td>
      <td>${statutBadge(r.statut)}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm btn-secondary" data-edit-recur="${r.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-sm btn-primary" data-generate="${r.id}">
            <i data-lucide="refresh-cw"></i>
            Suivante
          </button>
        </div>
      </td>
    </tr>
  `;
}
