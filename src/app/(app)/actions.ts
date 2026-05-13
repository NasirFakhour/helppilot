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
    statut_paiement: formData.get('statut_paiement') as string,
    notes: formData.get('notes') as string,
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
    statut_paiement: formData.get('statut_paiement') as string,
    notes: formData.get('notes') as string,
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
    { user_id: user.id, client_id: clients[0].id, date: setTime(today, 14, 0).toISOString(), heure: '14:00', description: 'Mise à jour logiciel de caisse', montant: 65, statut: 'planifiee', statut_paiement: 'non-paye' },
    { user_id: user.id, client_id: clients[2].id, date: setTime(today, 10, 30).toISOString(), heure: '10:30', description: 'Audit sécurité réseau', montant: 150, statut: 'planifiee', statut_paiement: 'non-paye' },
    { user_id: user.id, client_id: clients[1].id, date: setTime(subDays(today, 10), 15, 0).toISOString(), heure: '15:00', description: 'Installation nouvelle Box internet', montant: 80, statut: 'terminee', statut_paiement: 'non-paye', updated_at: subDays(today, 10).toISOString() },
    { user_id: user.id, client_id: clients[0].id, date: setTime(subDays(today, 25), 11, 0).toISOString(), heure: '11:00', description: 'Dépannage imprimante', montant: 45, statut: 'terminee', statut_paiement: 'non-paye', updated_at: subDays(today, 25).toISOString() },
  ]

  const { error: ivErr } = await supabase.from('interventions').insert(ivs)
  
  if (ivErr) return { error: ivErr.message }

  revalidatePath('/dashboard')
  revalidatePath('/clients')
  revalidatePath('/interventions')
  revalidatePath('/relances')
  return { success: true }
}
