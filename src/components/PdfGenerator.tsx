'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download } from 'lucide-react'
import { formatCurrency, formatDate, fullName } from '@/lib/utils'

interface PdfGeneratorProps {
  document: any
  client: any
  profile: any
}

export function PdfGenerator({ document, client, profile }: PdfGeneratorProps) {
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF()

      // Configuration
      const title = document.type === 'facture' ? 'FACTURE' : 'DEVIS'
      const isFacture = document.type === 'facture'
      const primaryColor: [number, number, number] = [37, 99, 235] // blue-600

      // --- Header: Centered Title ---
      doc.setFontSize(26)
      doc.setTextColor(...primaryColor)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 105, 25, { align: 'center' })
      
      // Divider
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.5)
      doc.line(80, 30, 130, 30)

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(`Numéro : ${document.numero || ''}`, 105, 38, { align: 'center' })
      doc.text(`Date d'émission : ${formatDate(document.date_emission)}`, 105, 44, { align: 'center' })
      if (document.date_echeance) {
        doc.text(`Date ${isFacture ? 'd\'échéance' : 'de validité'} : ${formatDate(document.date_echeance)}`, 105, 50, { align: 'center' })
      }

      // --- Enterprise Info (Left) ---
      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.setFont('helvetica', 'bold')
      const entY = 70
      doc.text(profile?.nom_societe || 'Mon Entreprise', 14, entY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      let currentY = entY + 6
      
      if (profile?.adresse) {
        doc.text(profile.adresse, 14, currentY)
        currentY += 6
      }
      if (profile?.code_postal || profile?.ville) {
        doc.text(`${profile.code_postal || ''} ${profile.ville || ''}`, 14, currentY)
        currentY += 6
      }
      if (profile?.telephone) {
        doc.text(`Tél : ${profile.telephone}`, 14, currentY)
        currentY += 6
      }
      if (profile?.siret) {
        doc.text(`SIRET : ${profile.siret}`, 14, currentY)
      }

      // --- Client Info (Right) ---
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      const clientX = 120
      doc.text('Client :', clientX, entY)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      let clY = entY + 6
      
      if (client) {
        doc.text(fullName(client), clientX, clY)
        clY += 6
        if (client.adresse) {
          doc.text(client.adresse, clientX, clY)
          clY += 6
        }
        if (client.code_postal || client.ville) {
          doc.text(`${client.code_postal || ''} ${client.ville || ''}`, clientX, clY)
          clY += 6
        }
        if (client.telephone) {
          doc.text(`Tél : ${client.telephone}`, clientX, clY)
          clY += 6
        }
        if (client.siret) {
          doc.text(`SIRET : ${client.siret}`, clientX, clY)
        }
      }

      // --- Lines Table ---
      const lines = document.document_lignes || []
      const tableBody = lines.map((line: any) => [
        line.description || '',
        (line.quantite || 0).toString(),
        formatCurrency(line.prix_unitaire_ht || 0),
        formatCurrency(line.total_ht || 0)
      ])

      autoTable(doc, {
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
      const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 150
    
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
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error)
      alert('Une erreur est survenue lors de la création du PDF.')
    }
  }

  return (
    <button onClick={generatePDF} className="btn btn-primary">
      <Download className="w-4 h-4 mr-2" />
      Télécharger PDF
    </button>
  )
}
