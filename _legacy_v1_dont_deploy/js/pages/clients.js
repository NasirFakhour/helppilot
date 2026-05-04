/**
 * HelpPilot — pages/clients.js
 * Client list page with search and filter
 */

import { getClients, deleteClient } from '../store.js';
import { fullName, initials, formatDate, searchFilter, toast, openModal, closeModal } from '../utils.js';

let searchQuery = '';

export function renderClients() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;
  if (pageTitle) pageTitle.textContent = 'Clients';

  renderClientsList();
}

function renderClientsList() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const allClients = getClients();
  const filtered = searchFilter(allClients, searchQuery, ['nom', 'prenom', 'email', 'telephone', 'ville']);

  content.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Clients</h1>
          <p>${allClients.length} client${allClients.length > 1 ? 's' : ''} au total</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" id="new-client-btn">
            <i data-lucide="user-plus"></i>
            Nouveau client
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="filter-bar">
        <div class="search-bar">
          <i data-lucide="search"></i>
          <input
            type="text"
            id="client-search"
            placeholder="Rechercher un client…"
            value="${searchQuery}"
          />
        </div>
      </div>

      <!-- List -->
      <div class="card">
        ${filtered.length > 0
          ? filtered.map(renderClientRow).join('')
          : `<div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="users"></i></div>
              <p class="empty-state-title">${searchQuery ? 'Aucun résultat' : 'Aucun client'}</p>
              <p class="empty-state-desc">${searchQuery ? 'Essayez un autre terme de recherche' : 'Ajoutez votre premier client pour commencer'}</p>
              ${!searchQuery ? '<button class="btn btn-primary mt-4" id="empty-new-client-btn"><i data-lucide="user-plus"></i> Ajouter un client</button>' : ''}
             </div>`
        }
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Bind search
  const searchInput = document.getElementById('client-search');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderClientsList();
  });

  // New client button
  document.getElementById('new-client-btn')?.addEventListener('click', () => openClientModal());
  document.getElementById('empty-new-client-btn')?.addEventListener('click', () => openClientModal());

  // Client row actions
  content.querySelectorAll('[data-client-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.hash = `/clients/${btn.dataset.clientView}`;
    });
  });

  content.querySelectorAll('[data-client-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const clients = getClients();
      const client = clients.find(c => c.id === btn.dataset.clientEdit);
      if (client) openClientModal(client);
    });
  });

}

function renderClientRow(client) {
  const name = fullName(client);
  const ini = initials(client.nom, client.prenom);
  return `
    <div class="client-card" data-client-view="${client.id}">
      <div class="avatar">${ini}</div>
      <div class="client-card-content">
        <div class="client-name">${name}</div>
        <div class="client-email">${client.email || client.telephone || '—'}</div>
        <div class="client-meta">
          ${client.ville ? `<span class="text-xs text-muted"><i data-lucide="map-pin" style="display:inline;width:11px;height:11px;vertical-align:-1px;"></i> ${client.ville}</span>` : ''}
          <span class="text-xs text-muted">Depuis ${formatDate(client.createdAt)}</span>
        </div>
      </div>
      <div style="display:flex;gap:4px;flex-shrink:0;">
        <button class="btn-icon" data-client-edit="${client.id}" title="Modifier">
          <i data-lucide="pencil"></i>
        </button>
      </div>
    </div>
  `;
}

export function openClientModal(existingClient = null) {
  const isEdit = !!existingClient;
  const c = existingClient || {};

  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">${isEdit ? 'Modifier' : 'Nouveau'} client</h2>
      <button class="btn-icon" onclick="document.getElementById('modal-overlay').classList.add('hidden');document.body.style.overflow=''">
        <i data-lucide="x"></i>
      </button>
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

  document.getElementById('client-cancel-btn')?.addEventListener('click', closeModal);

  document.getElementById('client-save-btn')?.addEventListener('click', () => {
    const prenom = document.getElementById('cf-prenom').value.trim();
    const nom    = document.getElementById('cf-nom').value.trim();
    if (!nom && !prenom) {
      toast('Le nom ou prénom est requis', 'error');
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
      const { updateClient } = window.__store || {};
      import('../store.js').then(({ updateClient }) => {
        updateClient(existingClient.id, data);
        toast('Client mis à jour ✓', 'success');
        closeModal();
        renderClientsList();
      });
    } else {
      import('../store.js').then(({ createClient }) => {
        const newClient = createClient(data);
        toast('Client créé avec succès ✓', 'success');
        closeModal();
        window.location.hash = '/clients/' + newClient.id;
      });
    }
  });
}

function confirmDeleteClient(id) {
  const clients = getClients();
  const client = clients.find(c => c.id === id);
  if (!client) return;

  openModal(`
    <div class="modal-header">
      <h2 class="modal-title">Supprimer le client</h2>
      <button class="btn-icon" onclick="document.getElementById('modal-overlay').classList.add('hidden');document.body.style.overflow=''">
        <i data-lucide="x"></i>
      </button>
    </div>
    <div class="modal-body">
      <p>Êtes-vous sûr de vouloir supprimer <strong>${fullName(client)}</strong> ?</p>
      <p class="text-sm text-muted mt-2">Toutes les interventions associées seront également supprimées. Cette action est irréversible.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" id="del-cancel">Annuler</button>
      <button class="btn btn-danger" id="del-confirm">
        <i data-lucide="trash-2"></i>
        Supprimer
      </button>
    </div>
  `);

  document.getElementById('del-cancel')?.addEventListener('click', closeModal);
  document.getElementById('del-confirm')?.addEventListener('click', () => {
    deleteClient(id);
    toast('Client supprimé', 'success');
    closeModal();
    renderClientsList();
  });
}
