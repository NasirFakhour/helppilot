export function formatDate(dateStr?: string | null, opts = {}): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', ...opts })
}

export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function formatCurrency(amount?: number | null): string {
  if (amount == null || isNaN(amount)) return '0 €'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(amount)
}

export function initials(nom?: string | null, prenom?: string | null): string {
  const n = (nom || '').trim()
  const p = (prenom || '').trim()
  if (!n && !p) return '?'
  return ((p[0] || '') + (n[0] || '')).toUpperCase()
}

export function fullName(client?: { nom?: string | null, prenom?: string | null } | null): string {
  if (!client) return '—'
  return [client.prenom, client.nom].filter(Boolean).join(' ')
}

export function truncate(str?: string | null, max = 60): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}
