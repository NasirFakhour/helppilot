/**
 * HelpPilot — pages/interventions.js
 * Interventions list with filters
 */

import { getInterventions, getClient } from '../store.js';
import {
  fullName, formatDate, formatTime, formatCurrency,
  statutBadge, paiementBadge, searchFilter, truncate, toast
} from '../utils.js';

let searchQuery = '';
let filterStatut = 'all';

export function renderInterventions() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;
  if (pageTitle) pageTitle.textContent = 'Interventions';

  renderInterventionsList();
}

function renderInterventionsList() {
  const content = document.getElementById('page-content');
  if (!content) return;

  let interventions = getInterventions()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = interventions.length;

  // Filter by statut
  if (filterStatut !== 'all') {
    interventions = interventions.filter(i => i.statut === filterStatut);
  }

  // Search
  interventions = searchFilter(interventions, searchQuery, ['description', 'adresse', 'notes']);

  // Also search by client name
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    interventions = getInterventions()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter(i => {
        if (filterStatut !== 'all' && i.statut !== filterStatut) return false;
        const client = getClient(i.clientId);
        const clientName = fullName(client).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const desc = (i.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return clientName.includes(q) || desc.includes(q);
      });
  }

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Interventions</h1>
          <p>${total} intervention${total > 1 ? 's' : ''} au total</p>
        </div>
        <div class="page-header-actions">
          <a href="#/interventions/new" class="btn btn-primary">
            <i data-lucide="plus"></i>
            Nouvelle intervention
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-bar">
        <div class="search-bar">
          <i data-lucide="search"></i>
          <input type="text" id="interv-search" placeholder="Client, description…" value="${searchQuery}" />
        </div>
        <button class="filter-chip ${filterStatut === 'all' ? 'active' : ''}" data-filter="all">Toutes</button>
        <button class="filter-chip ${filterStatut === 'planifiee' ? 'active' : ''}" data-filter="planifiee">Planifiées</button>
        <button class="filter-chip ${filterStatut === 'en-cours' ? 'active' : ''}" data-filter="en-cours">En cours</button>
        <button class="filter-chip ${filterStatut === 'terminee' ? 'active' : ''}" data-filter="terminee">Terminées</button>
        <button class="filter-chip ${filterStatut === 'annulee' ? 'active' : ''}" data-filter="annulee">Annulées</button>
      </div>

      <!-- Table -->
      <div class="card">
        ${interventions.length > 0
          ? `<div class="table-wrapper">
              <table class="table table-clickable">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th>Montant</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${interventions.map(renderInterventionRow).join('')}
                </tbody>
              </table>
            </div>`
          : `<div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="wrench"></i></div>
              <p class="empty-state-title">${searchQuery || filterStatut !== 'all' ? 'Aucun résultat' : 'Aucune intervention'}</p>
              <p class="empty-state-desc">${searchQuery || filterStatut !== 'all' ? 'Modifiez vos filtres pour voir plus de résultats' : 'Créez votre première intervention'}</p>
             </div>`
        }
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Search
  document.getElementById('interv-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderInterventionsList();
  });

  // Filters
  content.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      filterStatut = chip.dataset.filter;
      renderInterventionsList();
    });
  });

  // Row click
  content.querySelectorAll('[data-interv-id]').forEach(row => {
    row.addEventListener('click', () => {
      window.location.hash = `/interventions/${row.dataset.intervId}/edit`;
    });
  });
}

function renderInterventionRow(i) {
  const client = getClient(i.clientId);
  const now = new Date();
  const date = new Date(i.date);
  const isOverdue = date < now && (i.statut === 'planifiee' || i.statut === 'en-cours');

  return `
    <tr data-interv-id="${i.id}" ${isOverdue ? 'style="background:var(--color-danger-light);"' : ''}>
      <td>
        <span class="text-sm font-medium ${isOverdue ? 'text-danger' : ''}">${formatDate(i.date)}</span>
        <br><span class="text-xs text-muted">${i.heure || ''}</span>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="avatar" style="width:28px;height:28px;font-size:11px;">${client ? (client.prenom?.[0]||'') + (client.nom?.[0]||'') : '?'}</div>
          <span class="text-sm">${client ? fullName(client) : '—'}</span>
        </div>
      </td>
      <td>
        <span class="text-sm">${truncate(i.description, 50)}</span>
        ${i.recurrente ? '<br><span class="badge badge-info" style="margin-top:2px;">Récurrente</span>' : ''}
      </td>
      <td>${statutBadge(i.statut)}</td>
      <td>${paiementBadge(i.statut_paiement)}</td>
      <td class="font-semibold">${formatCurrency(i.montant)}</td>
      <td>
        <i data-lucide="chevron-right" style="color:var(--color-text-muted);width:16px;height:16px;"></i>
      </td>
    </tr>
  `;
}
