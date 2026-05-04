/**
 * HelpPilot — pages/dashboard.js
 * Today's dashboard with stats, interventions, overdue, relances
 */

import {
  getDashboardData, getClient, markRelanceSent, markAsPaid
} from '../store.js';
import {
  formatDate, formatTime, formatCurrency, fullName, initials,
  statutBadge, paiementBadge, toast, truncate, getDayLabel
} from '../utils.js';

function renderStatCard(icon, label, value, sub, colorClass) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${colorClass}">
        <i data-lucide="${icon}"></i>
      </div>
      <div class="stat-content">
        <p class="stat-label">${label}</p>
        <p class="stat-value">${value}</p>
        ${sub ? `<p class="stat-sub">${sub}</p>` : ''}
      </div>
    </div>
  `;
}

function renderInterventionItem(intervention, client, isOverdue = false) {
  const dotClass = isOverdue ? 'danger' : (intervention.statut === 'en-cours' ? 'warning' : '');
  const clientName = client ? fullName(client) : '—';
  const dayLabel = getDayLabel(intervention.date);

  return `
    <div class="intervention-item" data-id="${intervention.id}"
         onclick="window.location.hash='/interventions/${intervention.id}/edit'" style="cursor:pointer">
      <div class="intervention-time">
        <div class="time">${formatTime(intervention.date)}</div>
        <div class="date text-xs text-muted">${isOverdue ? formatDate(intervention.date) : ''}</div>
      </div>
      <div class="intervention-dot ${dotClass}"></div>
      <div class="intervention-content">
        <div class="intervention-client">${clientName}</div>
        <div class="intervention-desc">${truncate(intervention.description, 70)}</div>
        <div class="intervention-meta">
          ${statutBadge(intervention.statut)}
          ${paiementBadge(intervention.statut_paiement)}
          ${intervention.montant ? `<span class="text-xs text-muted">${formatCurrency(intervention.montant)}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderRelanceItem(intervention, client) {
  const clientName = client ? fullName(client) : '—';

  return `
    <div class="relance-item">
      <div class="avatar">${client ? initials(client.nom, client.prenom) : '?'}</div>
      <div class="relance-content">
        <div class="relance-client">${clientName}</div>
        <div class="relance-detail">
          ${truncate(intervention.description, 50)} — ${formatCurrency(intervention.montant)}
          <br>
          <span class="text-xs text-muted">Terminée le ${formatDate(intervention.date)}</span>
          &nbsp;·&nbsp;
          <span class="badge badge-warning">${intervention.relanceType}</span>
        </div>
      </div>
      <div class="relance-actions">
        <button class="btn btn-sm btn-secondary" data-relance-paid="${intervention.id}" title="Marquer payé">
          <i data-lucide="check"></i>
        </button>
        <button class="btn btn-sm btn-primary" data-relance-send="${intervention.id}">
          <i data-lucide="send"></i>
          Relancer
        </button>
      </div>
    </div>
  `;
}

export function renderDashboard() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;

  if (pageTitle) pageTitle.textContent = 'Tableau de bord';

  updateDashboardContent();
}

function updateDashboardContent() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const data = getDashboardData();
  const { stats, todayInterventions, overdueInterventions, relances } = data;

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  content.innerHTML = `
    <div class="animate-fade-in">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Tableau de bord</h1>
          <p>${todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)}</p>
        </div>
        <div class="page-header-actions">
          <a href="#/interventions/new" class="btn btn-primary">
            <i data-lucide="plus"></i>
            Nouvelle intervention
          </a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        ${renderStatCard('calendar', 'Interventions aujourd\'hui', stats.todayCount, null, 'stat-icon-primary')}
        ${renderStatCard('alert-triangle', 'En retard', stats.overdueCount, null, 'stat-icon-danger')}
        ${renderStatCard('bell-ring', 'Relances à envoyer', stats.relancesCount, null, 'stat-icon-warning')}
        ${renderStatCard('euro', 'En attente de paiement', formatCurrency(stats.pendingPayments), `${stats.totalClients} clients au total`, 'stat-icon-info')}
      </div>

      <!-- Main grid -->
      <div class="dashboard-grid">

        <!-- Today's interventions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i data-lucide="calendar-check" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
              Aujourd'hui
              ${stats.todayCount > 0 ? `<span class="badge badge-primary" style="margin-left:8px;">${stats.todayCount}</span>` : ''}
            </h3>
            <a href="#/interventions" class="btn btn-ghost btn-sm">Tout voir</a>
          </div>
          ${todayInterventions.length > 0
            ? todayInterventions.map(i => renderInterventionItem(i, getClient(i.clientId))).join('')
            : `<div class="empty-state" style="padding:40px 24px;">
                <div class="empty-state-icon"><i data-lucide="sun"></i></div>
                <p class="empty-state-title">Aucune intervention aujourd'hui</p>
                <p class="empty-state-desc">Profitez de cette journée libre !</p>
               </div>`
          }
        </div>

        <!-- Right column -->
        <div style="display:flex;flex-direction:column;gap:20px;">

          <!-- Overdue -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="color:var(--color-danger)">
                <i data-lucide="alert-circle" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
                En retard
                ${overdueInterventions.length > 0 ? `<span class="badge badge-danger" style="margin-left:8px;">${overdueInterventions.length}</span>` : ''}
              </h3>
            </div>
            ${overdueInterventions.length > 0
              ? overdueInterventions.slice(0, 4).map(i => renderInterventionItem(i, getClient(i.clientId), true)).join('')
              : `<div class="empty-state" style="padding:24px;">
                  <p class="text-sm text-muted">Aucun retard 🎉</p>
                 </div>`
            }
          </div>

          <!-- Relances -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="color:var(--color-warning)">
                <i data-lucide="send" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
                Relances de paiement
                ${relances.length > 0 ? `<span class="badge badge-warning" style="margin-left:8px;">${relances.length}</span>` : ''}
              </h3>
              <a href="#/relances" class="btn btn-ghost btn-sm">Tout voir</a>
            </div>
            ${relances.length > 0
              ? relances.slice(0, 3).map(i => renderRelanceItem(i, getClient(i.clientId))).join('')
              : `<div class="empty-state" style="padding:24px;">
                  <p class="text-sm text-muted">Aucune relance à effectuer ✓</p>
                 </div>`
            }
          </div>

        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Bind relance actions
  content.querySelectorAll('[data-relance-send]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.relanceSend;
      markRelanceSent(id);
      toast('Relance marquée comme envoyée 📧', 'success');
      updateDashboardContent();
    });
  });

  content.querySelectorAll('[data-relance-paid]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.relancePaid;
      markAsPaid(id);
      toast('Intervention marquée comme payée ✓', 'success');
      updateDashboardContent();
    });
  });
}
