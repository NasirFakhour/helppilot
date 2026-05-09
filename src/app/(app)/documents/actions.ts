'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDocument(data: any, lines: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Non autorisé" }
  }

  // Generate Numero automatically if not provided
  let numero = data.numero
  if (!numero) {
    const prefix = data.type === 'facture' ? 'FAC' : 'DEV'
    const year = new Date().getFullYear()
    
    // Count existing documents of this type for this year to generate a sequential number
    const startOfYear = new Date(year, 0, 1).toISOString()
    const { count } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', data.type)
      .gte('created_at', startOfYear)

    const seq = ((count || 0) + 1).toString().padStart(4, '0')
    numero = `${prefix}-${year}-${seq}`
  }

  // Insert Document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .insert([{
      user_id: user.id,
      client_id: data.client_id,
      intervention_id: data.intervention_id || null,
      type: data.type,
      numero: numero,
      date_emission: data.date_emission,
      date_echeance: data.date_echeance || null,
      statut: data.statut || 'brouillon',
      total_ht: data.total_ht,
      tva_taux: data.tva_taux,
      total_ttc: data.total_ttc,
      notes: data.notes
    }])
    .select()
    .single()

  if (docError) {
    console.error("Document creation error:", docError)
    return { error: "Erreur lors de la création du document." }
  }

  // Insert Lines
  if (lines && lines.length > 0) {
    const linesToInsert = lines.map((l, index) => ({
      document_id: doc.id,
      description: l.description,
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      total_ht: l.total_ht,
      ordre: index
    }))

    const { error: linesError } = await supabase
      .from('document_lignes')
      .insert(linesToInsert)

    if (linesError) {
      console.error("Document lines error:", linesError)
      // Note: We might want to rollback or handle this, but for MVP we log it.
    }
  }

  revalidatePath('/documents')
  return { success: true, document: doc }
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/documents')
  return { success: true }
}

export async function updateDocumentStatus(id: string, statut: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('documents').update({ statut }).eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/documents')
  return { success: true }
}
