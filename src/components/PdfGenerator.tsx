'use client'

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Download } from 'lucide-react'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'

interface PdfGeneratorProps {
  document: any
  client: any
  profile: any
}

export function PdfGenerator({ document, client, profile }: PdfGeneratorProps) {
  
  const generatePDF = () => {
    const doc = new jsPDF()

    // Configuration
    const title = document.type === 'facture' ? 'FACTURE' : 'DEVIS'
    const isFacture = document.type === 'facture'
    const primaryColor: [number, number, number] = [37, 99, 235] // blue-600

    // --- Header ---
    doc.setFontSize(22)
    doc.setTextColor(...primaryColor)
    doc.text(title, 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Numéro : ${document.numero}`, 14, 28)
    doc.text(`Date d'émission : ${formatDate(document.date_emission)}`, 14, 34)
    if (document.date_echeance) {
      doc.text(`Date ${isFacture ? 'd\'échéance' : 'de validité'} : ${formatDate(document.date_echeance)}`, 14, 40)
    }

    // --- Enterprise Info (Top Left) ---
    doc.setFontSize(11)
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'bold')
    doc.text(profile.nom_societe || 'Mon Entreprise', 14, 55)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(profile.email || '', 14, 61)
    doc.text(profile.telephone || '', 14, 67)

    // --- Client Info (Top Right) ---
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const clientX = 130
    doc.text('Adressé à :', clientX, 55)
    doc.setFont('helvetica', 'normal')
    doc.text(fullName(client), clientX, 61)
    if (client.adresse) doc.text(client.adresse, clientX, 67)
    if (client.code_postal || client.ville) {
      doc.text(`${client.code_postal || ''} ${client.ville || ''}`, clientX, 73)
    }

    // --- Lines Table ---
    const tableBody = document.document_lignes.map((line: any) => [
      line.description,
      line.quantite.toString(),
      formatCurrency(line.prix_unitaire_ht),
      formatCurrency(line.total_ht)
    ])

    // @ts-ignore - jspdf-autotable extends jsPDF but types might complain
    doc.autoTable({
      startY: 90,
      head: [['Description', 'Quantité', 'Prix unitaire HT', 'Total HT']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      }
    })

    // --- Totals ---
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10
    
    doc.setFontSize(10)
    doc.text('Total HT :', 130, finalY)
    doc.text(formatCurrency(document.total_ht), 180, finalY, { align: 'right' })

    const hasTva = document.tva_taux > 0
    if (hasTva) {
      const tvaAmount = document.total_ttc - document.total_ht
      doc.text(`TVA (${document.tva_taux}%) :`, 130, finalY + 6)
      doc.text(formatCurrency(tvaAmount), 180, finalY + 6, { align: 'right' })
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Total TTC :', 130, finalY + 14)
    doc.setTextColor(...primaryColor)
    doc.text(formatCurrency(document.total_ttc), 180, finalY + 14, { align: 'right' })
    doc.setTextColor(40, 40, 40)
    doc.setFont('helvetica', 'normal')

    // --- Footer / Notes ---
    let footerY = finalY + 30
    if (document.notes) {
      doc.setFontSize(9)
      doc.text('Notes / Mentions légales :', 14, footerY)
      doc.text(document.notes, 14, footerY + 6, { maxWidth: 180 })
      footerY += 20
    }

    if (!hasTva) {
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('TVA non applicable, art. 293 B du CGI.', 14, 280)
    }

    if (profile.signature) {
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(profile.signature, 105, 285, { align: 'center' })
    }

    // Save
    doc.save(`${title}_${document.numero}.pdf`)
  }

  return (
    <button onClick={generatePDF} className="btn btn-primary">
      <Download className="w-4 h-4 mr-2" />
      Télécharger PDF
    </button>
  )
}
