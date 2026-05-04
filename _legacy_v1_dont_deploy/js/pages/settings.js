/**
 * HelpPilot — pages/settings.js
 * App settings page
 */

import { getSettings, updateSettings, resetToDemo } from '../store.js';
import { toast, openModal, closeModal } from '../utils.js';

export function renderSettings() {
  const content = document.getElementById('page-content');
  const pageTitle = document.getElementById('page-title');
  if (!content) return;
  if (pageTitle) pageTitle.textContent = 'Paramètres';

  renderSettingsContent();
}

function renderSettingsContent() {
  const content = document.getElementById('page-content');
  if (!content) return;

  const s = getSettings();

  content.innerHTML = `
    <div class="animate-fade-in" style="max-width:700px;">
      <div class="page-header">
        <div class="page-header-left">
          <h1>Paramètres</h1>
          <p>Configurez votre espace HelpPilot</p>
        </div>
      </div>

      <!-- Société -->
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <h3 class="card-title">
            <i data-lucide="building-2" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
            Mon entreprise
          </h3>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:16px;">
          <div class="form-group">
            <label class="form-label" for="s-societe">Nom de la société</label>
            <input type="text" id="s-societe" class="form-control"
              value="${s.nom_societe || ''}" placeholder="InfoTech Service" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="s-email">Email expéditeur</label>
              <input type="email" id="s-email" class="form-control"
                value="${s.email_expediteur || ''}" placeholder="contact@masociete.fr" />
            </div>
            <div class="form-group">
              <label class="form-label" for="s-tel">Téléphone société</label>
              <input type="tel" id="s-tel" class="form-control"
                value="${s.telephone_societe || ''}" placeholder="04 78 00 11 22" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="s-signature">Signature email</label>
            <textarea id="s-signature" class="form-control" rows="4"
              placeholder="Cordialement,\nVotre nom\nVotre société">${s.signature_email || ''}</textarea>
            <p class="form-hint">Utilisée dans les rappels et relances automatiques</p>
          </div>
        </div>
      </div>

      <!-- Email Templates -->
      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <h3 class="card-title">
            <i data-lucide="bell" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
            Modèle de rappel (avant intervention)
          </h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label" for="s-rappel">Texte du rappel</label>
            <textarea id="s-rappel" class="form-control" rows="6">${s.modele_rappel || ''}</textarea>
          </div>
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);padding:12px 16px;margin-top:12px;">
            <p class="text-xs font-semibold text-muted" style="margin-bottom:6px;">Variables disponibles</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${['{{prenom}}','{{nom}}','{{date}}','{{heure}}','{{adresse}}','{{signature}}'].map(v =>
                `<code style="font-size:11px;background:var(--color-card);border:1px solid var(--color-border);border-radius:4px;padding:2px 6px;">${v}</code>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div class="card-header">
          <h3 class="card-title">
            <i data-lucide="send" style="display:inline;width:16px;height:16px;margin-right:6px;vertical-align:-2px;"></i>
            Modèle de relance (paiement)
          </h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label" for="s-relance">Texte de la relance</label>
            <textarea id="s-relance" class="form-control" rows="6">${s.modele_relance || ''}</textarea>
          </div>
          <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius);padding:12px 16px;margin-top:12px;">
            <p class="text-xs font-semibold text-muted" style="margin-bottom:6px;">Variables disponibles</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${['{{prenom}}','{{nom}}','{{date}}','{{description}}','{{montant}}','{{signature}}'].map(v =>
                `<code style="font-size:11px;background:var(--color-card);border:1px solid var(--color-border);border-radius:4px;padding:2px 6px;">${v}</code>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Save -->
      <div style="display:flex;justify-content:flex-end;gap:12px;margin-bottom:24px;">
        <button class="btn btn-secondary" id="settings-cancel-btn">Annuler</button>
        <button class="btn btn-primary" id="settings-save-btn">
          <i data-lucide="save"></i>
          Enregistrer les paramètres
        </button>
      </div>

    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: content });

  // Save
  document.getElementById('settings-save-btn')?.addEventListener('click', () => {
    const data = {
      nom_societe:        document.getElementById('s-societe').value.trim(),
      email_expediteur:   document.getElementById('s-email').value.trim(),
      telephone_societe:  document.getElementById('s-tel').value.trim(),
      signature_email:    document.getElementById('s-signature').value.trim(),
      modele_rappel:      document.getElementById('s-rappel').value.trim(),
      modele_relance:     document.getElementById('s-relance').value.trim(),
    };
    updateSettings(data);
    toast('Paramètres enregistrés ✓', 'success');
  });

  // Cancel
  document.getElementById('settings-cancel-btn')?.addEventListener('click', renderSettingsContent);
}
