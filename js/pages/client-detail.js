/**
 * HelpPilot — pages/client-detail.js
 * Client detail page with history and timeline
 */

import {
  getClient, getClientInterventions, deleteClient
} from '../store.js';
import {
  fullName, initials, formatDate, formatDateTime, formatCurrency,
  statutBadge, paiementBadge, toast, openModal, closeModal, truncate
} from '../utils.js';
import { openClientModal } from './clients.js';

export function renderClientDetail({ params }) {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;

  const client = getClient(params.id);
  if (!client) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="user-x"></i></div>
        <p class="empty-state-title">Client introuvable</p>
        <a href="#/clients" class="btn btn-secondary mt-4">← Retour aux clients</a>
      </div>`;
    if (window.lucide) lucide.createIcons({ context: content });
    return;
  }

  if (pageTitle) pageTitle.textContent = fullName(client);

  const interventions = getClientInterventions(client.id);
  const paid = interventions.filter(i => i.statut_paiement === 'paye').reduce((s, i) => s + (i.montant || 0), 0);
  const pending = interventions.filter(i => i.statut_paiement === 'non-paye' && i.statut === 'terminee').reduce((s, i) => s + (i.montant || 0), 0);

  content.innerHTML = `
    <div class="animate-fade-in">
      <!-- Back + Actions -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <a href="#/clients" class="btn btn-ghost btn-sm">
          <i data-lucide="arrow-left"></i>
          Clients
        </a>
      </div>

      <div style="display:grid;grid-template-columns:1fr 320px;gap:24px;align-items:start;">

        <!-- Left: Info + History -->
        <div style="display:flex;flex-direction:column;gap:20px;">

          <!-- Client Info Card -->
          <div class="card">
            <div class="card-header">
              <div style="display:flex;align-items:center;gap:16px;">
                <div class="avatar avatar-xl">${initials(client.nom, client.prenom)}</div>
                <div>
                  <h2 style="font-size:20px;font-weight:700;">${fullName(client)}</h2>
                  <p class="text-sm text-muted">Client depuis le ${formatDate(client.createdAt)}</p>
                </div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-secondary btn-sm" id="edit-client-btn">
                  <i data-lucide="pencil"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="info-label"><i data-lucide="mail" style="display:inline;width:13px;height:13px;vertical-align:-2px;margin-right:4px;"></i>Email</span>
                <span class="info-value">${client.email ? `<a href="mailto:${client.email}">${client.email}</a>` : '—'}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i data-lucide="phone" style="display:inline;width:13px;height:13px;vertical-align:-2px;margin-right:4px;"></i>Téléphone</span>
                <span class="info-value">${client.telephone ? `<a href="tel:${client.telephone}">${client.telephone}</a>` : '—'}</span>
              </div>
              <div class="info-row">
                <span class="info-label"><i data-lucide="map-pin" style="display:inline;width:13px;height:13px;vertical-align:-2px;margin-right:4px;"></i>Adresse</span>
                <span class="info-value">${[client.adresse, client.codePostal, client.ville].filter(Boolean).join(', ') || '—'}</span>
              </div>
              ${client.notes ? `
              <div class="info-row">
                <span class="info-label"><i data-lucide="file-text" style="display:inline;width:13px;height:13px;vertical-align:-2px;margin-right:4px;"></i>Notes</span>
                <span class="info-value" style="white-space:pre-line;">${client.notes}</span>
              </div>` : ''}
            </div>
          </div>

          <!-- Intervention History -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i data-lucide="clock" style="display:inline;width:15px;height:15px;margin-right:6px;vertical-align:-2px;"></i>
                Historique des interventions
              </h3>
              <a href="#/interventions/new?client=${client.id}" class="btn btn-primary btn-sm">
                <i data-lucide="plus"></i>
                Nouvelle
              </a>
            </div>
            ${interventions.length > 0
              ? `<div class="table-wrapper">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Statut</th>
                        <th>Paiement</th>
                        <th>Montant</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${interventions.map(i => `
                        <tr style="cursor:pointer;" onclick="window.location.hash='/interventions/${i.id}/edit'">
                          <td>
                            <span class="text-sm font-medium">${formatDate(i.date)}</span>
                            <br><span class="text-xs text-muted">${i.heure || ''}</span>
                          </td>
                          <td><span class="text-sm">${truncate(i.description, 45)}</span></td>
                          <td>${statutBadge(i.statut)}</td>
                          <td>${paiementBadge(i.statut_paiement)}</td>
                          <td class="font-semibold">${formatCurrency(i.montant)}</td>
                          <td>
                            <button class="btn-icon" onclick="event.stopPropagation();window.location.hash='/interventions/${i.id}/edit'">
                              <i data-lucide="chevron-right"></i>
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>`
              : `<div class="empty-state" style="padding:32px;">
                  <div class="empty-state-icon"><i data-lucide="wrench"></i></div>
                  <p class="empty-state-title">Pas encore d'intervention</p>
                 </div>`
            }
          </div>
        </div>

        <!-- Right: Stats sidebar -->
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <div class="card-body">
              <p class="section-title">Récapitulatif</p>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="text-sm text-muted">Interventions</span>
                  <span class="font-semibold">${interventions.length}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="text-sm text-muted">CA généré</span>
                  <span class="font-semibold text-success">${formatCurrency(paid)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="text-sm text-muted">En attente</span>
                  <span class="font-semibold ${pending > 0 ? 'text-danger' : ''}">${formatCurrency(pending)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <p class="section-title" style="margin-bottom:12px;">Actions rapides</p>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <a href="#/interventions/new?client=${client.id}" class="btn btn-primary w-full">
                  <i data-lucide="plus-circle"></i>
                  Nouvelle intervention
                </a>
                ${client.email ? `<a href="mailto:${client.email}" class="btn btn-secondary w-full">
                  <i data-lucide="mail"></i>
                  Envoyer un email
                </a>` : ''}
                ${client.telephone ? `<a href="tel:${client.telephone}" class="btn btn-secondary w-full">
                  <i data-lucide="phone"></i>
                  Appeler
                </a>` : ''}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  document.getElementById('edit-client-btn')?.addEventListener('click', () => {
    openClientModal(client);
    // After modal closes, re-render if updated
  });
}
