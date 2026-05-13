'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const nom = formData.get('nom') as string
  const prenom = formData.get('prenom') as string
  if (!nom && !prenom) throw new Error('Le nom ou prénom est requis')

  const clientData = {
    user_id: user.id,
    nom,
    prenom,
    email: formData.get('email') as string,
    telephone: formData.get('telephone') as string,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    code_postal: formData.get('code_postal') as string,
    siret: formData.get('siret') as string,
    notes: formData.get('notes') as string,
  }

  const { data, error } = await supabase.from('clients').insert(clientData).select().single()
  
  if (error) return { error: error.message }
  
  revalidatePath('/clients')
  redirect(`/clients/${data.id}`)
}

export async function updateClientRecord(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const clientData = {
    nom: formData.get('nom') as string,
    prenom: formData.get('prenom') as string,
    email: formData.get('email') as string,
    telephone: formData.get('telephone') as string,
    adresse: formData.get('adresse') as string,
    ville: formData.get('ville') as string,
    code_postal: formData.get('code_postal') as string,
    siret: formData.get('siret') as string,
    notes: formData.get('notes') as string,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('clients').update(clientData).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function createIntervention(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const data = {
    user_id: user.id,
    client_id: formData.get('client_id') as string,
    date: new Date(formData.get('date') as string).toISOString(),
    heure: formData.get('heure') as string,
    description: formData.get('description') as string,
    montant: parseFloat(formData.get('montant') as string) || 0,
    statut: formData.get('statut') as string,
    priorite: formData.get('priorite') as string || 'normale',
    statut_paiement: formData.get('statut_paiement') as string,
    notes: formData.get('notes') as string,
    notes_technicien: formData.get('notes_technicien') as string,
    materiel: formData.get('materiel') ? JSON.parse(formData.get('materiel') as string) : [],
  }

  const { error } = await supabase.from('interventions').insert(data)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/interventions')
  redirect('/interventions')
}

export async function updateIntervention(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    client_id: formData.get('client_id') as string,
    date: new Date(formData.get('date') as string).toISOString(),
    heure: formData.get('heure') as string,
    description: formData.get('description') as string,
    montant: parseFloat(formData.get('montant') as string) || 0,
    statut: formData.get('statut') as string,
    priorite: formData.get('priorite') as string || 'normale',
    statut_paiement: formData.get('statut_paiement') as string,
    notes: formData.get('notes') as string,
    notes_technicien: formData.get('notes_technicien') as string,
    materiel: formData.get('materiel') ? JSON.parse(formData.get('materiel') as string) : [],
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('interventions').update(data).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/interventions')
  redirect('/interventions')
}

export async function deleteIntervention(id: string) {
  const supabase = await createClient()
  await supabase.from('interventions').delete().eq('id', id)
  revalidatePath('/dashboard')
  revalidatePath('/interventions')
  redirect('/interventions')
}

export async function closeIntervention(id: string, notes_technicien: string, materiel: any[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('interventions').update({
    statut: 'terminee',
    notes_technicien,
    materiel,
    updated_at: new Date().toISOString()
  }).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/interventions')
  revalidatePath(`/interventions/${id}/edit`)
  return { success: true }
}

export async function convertToIntervention(documentId: string) {
  const supabase = await createClient()
  const { data: doc } = await supabase.from('documents').select('*, clients(*)').eq('id', documentId).single()
  if (!doc) return { error: 'Document introuvable' }

  const interventionData = {
    user_id: doc.user_id,
    client_id: doc.client_id,
    description: `Suite au devis ${doc.numero}`,
    montant: doc.total_ttc,
    statut: 'a-planifier',
    statut_paiement: 'non-paye',
    notes: doc.notes
  }

  const { data: iv, error } = await supabase.from('interventions').insert(interventionData).select().single()
  if (error) return { error: error.message }

  await supabase.from('documents').update({ intervention_id: iv.id, statut: 'accepte' }).eq('id', documentId)

  revalidatePath('/interventions')
  revalidatePath('/documents')
  return { success: true, interventionId: iv.id }
}

export async function convertToInvoice(interventionId: string) {
  const supabase = await createClient()
  const { data: iv } = await supabase.from('interventions').select('*, clients(*)').eq('id', interventionId).single()
  if (!iv) return { error: 'Intervention introuvable' }

  // Check if invoice already exists
  const { data: existing } = await supabase.from('documents').select('id').eq('intervention_id', interventionId).eq('type', 'facture').single()
  if (existing) return { error: 'Une facture existe déjà pour cette intervention' }

  // Get next invoice number
  const { data: lastDoc } = await supabase.from('documents').select('numero').eq('type', 'facture').order('numero', { ascending: false }).limit(1).single()
  const nextNum = lastDoc ? `FAC-${parseInt(lastDoc.numero.split('-')[1]) + 1}` : 'FAC-1001'

  const invoiceData = {
    user_id: iv.user_id,
    client_id: iv.client_id,
    intervention_id: iv.id,
    type: 'facture',
    numero: nextNum,
    date_emission: new Date().toISOString(),
    statut: 'brouillon',
    total_ht: iv.montant ? iv.montant / 1.2 : 0,
    tva_taux: 20,
    total_ttc: iv.montant || 0,
    notes: iv.description
  }

  const { data: inv, error } = await supabase.from('documents').insert(invoiceData).select().single()
  if (error) return { error: error.message }

  // Update intervention status
  await supabase.from('interventions').update({ statut: 'facturee' }).eq('id', interventionId)

  revalidatePath('/interventions')
  revalidatePath('/documents')
  return { success: true, invoiceId: inv.id }
}

export async function markRelanceSent(id: string) {
  const supabase = await createClient()
  await supabase.from('interventions').update({ statut_paiement: 'en-attente', updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/relances')
  revalidatePath('/dashboard')
}

export async function markAsPaid(id: string) {
  const supabase = await createClient()
  await supabase.from('interventions').update({ statut_paiement: 'paye', updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/relances')
  revalidatePath('/dashboard')
}

export async function updateSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const data = {
    nom_societe: formData.get('nom_societe') as string,
    siret: formData.get('siret') as string,
    telephone: formData.get('telephone') as string,
    adresse: formData.get('adresse') as string,
    code_postal: formData.get('code_postal') as string,
    ville: formData.get('ville') as string,
    signature: formData.get('signature') as string,
  }

  const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/settings')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit faire au moins 6 caractères' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) return { error: error.message }
  
  return { success: true }
}


export async function generateDemoData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user already has clients to prevent duplicate seeding
  const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    return { error: 'Des données existent déjà. Le chargement de démonstration est bloqué pour protéger vos données.' }
  }

  // Create demo clients
  const { data: clients, error: clientErr } = await supabase.from('clients').insert([
    { user_id: user.id, nom: 'Morel', prenom: 'Philippe', email: 'p.morel@boulangerie-du-coin.fr', telephone: '06 88 12 34 56', ville: 'Lyon' },
    { user_id: user.id, nom: 'Vasseur', prenom: 'Catherine', email: 'c.vasseur@outlook.fr', telephone: '07 23 45 67 89', ville: 'Villeurbanne' },
    { user_id: user.id, nom: 'Girard', prenom: 'Cabinet', email: 'secretariat@girard-avocats.fr', telephone: '04 72 11 22 33', ville: 'Lyon' }
  ]).select()

  if (clientErr || !clients || clients.length < 3) return { error: clientErr?.message || 'Error generating clients' }

  // Create demo interventions
  const today = new Date()
  const subDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() - n); return r; }
  const setTime = (d: Date, h: number, m=0) => { const r = new Date(d); r.setHours(h, m, 0, 0); return r; }

  const ivs = [
    { user_id: user.id, client_id: clients[0].id, date: setTime(today, 14, 0).toISOString(), heure: '14:00', description: 'Mise à jour logiciel de caisse', montant: 65, statut: 'planifiee', priorite: 'normale', statut_paiement: 'non-paye' },
    { user_id: user.id, client_id: clients[2].id, date: setTime(today, 10, 30).toISOString(), heure: '10:30', description: 'Audit sécurité réseau', montant: 150, statut: 'planifiee', priorite: 'urgente', statut_paiement: 'non-paye' },
    { user_id: user.id, client_id: clients[1].id, date: setTime(subDays(today, 10), 15, 0).toISOString(), heure: '15:00', description: 'Installation nouvelle Box internet', montant: 80, statut: 'terminee', priorite: 'normale', statut_paiement: 'non-paye', updated_at: subDays(today, 10).toISOString() },
    { user_id: user.id, client_id: clients[0].id, date: setTime(subDays(today, 25), 11, 0).toISOString(), heure: '11:00', description: 'Dépannage imprimante', montant: 45, statut: 'facturee', priorite: 'basse', statut_paiement: 'non-paye', updated_at: subDays(today, 25).toISOString() },
  ]

  const { error: ivErr } = await supabase.from('interventions').insert(ivs)
  
  if (ivErr) return { error: ivErr.message }

  revalidatePath('/dashboard')
  revalidatePath('/clients')
  revalidatePath('/interventions')
  revalidatePath('/relances')
  return { success: true }
}
