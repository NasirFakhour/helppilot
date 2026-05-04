/**
 * HelpPilot — pages/login.js
 */

import { login } from '../store.js';
import { toast } from '../utils.js';

export function renderLogin(onSuccess) {
  const screen = document.getElementById('login-page');
  if (!screen) return;

  screen.innerHTML = `
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-icon">HP</div>
        <span class="login-logo-text">HelpPilot</span>
      </div>

      <h1 class="login-title">Bon retour 👋</h1>
      <p class="login-subtitle">Connectez-vous pour accéder à votre espace</p>

      <form id="login-form" novalidate>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" for="login-email">Adresse email</label>
          <input
            type="email"
            id="login-email"
            class="form-control"
            placeholder="vous@example.fr"
            value="demo@helppilot.fr"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" for="login-password">Mot de passe</label>
          <input
            type="password"
            id="login-password"
            class="form-control"
            placeholder="••••••••"
            value="demo1234"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-full btn-lg" id="login-submit">
          <i data-lucide="log-in"></i>
          Se connecter
        </button>
      </form>

      <p class="login-demo-note">
        Mode démo — utilisez n'importe quels identifiants
      </p>
    </div>
  `;

  if (window.lucide) lucide.createIcons({ context: screen });

  const form = document.getElementById('login-form');
  const submitBtn = document.getElementById('login-submit');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) {
      toast('Veuillez saisir votre email', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner" style="width:18px;height:18px;border-width:2px;"></span> Connexion…';

    setTimeout(() => {
      login(email, password);
      toast('Connecté avec succès !', 'success');
      onSuccess?.();
    }, 600);
  });
}
