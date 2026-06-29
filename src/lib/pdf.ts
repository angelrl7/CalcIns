import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { INSULIN_CATALOGUE } from './bolus'
import type { HistoryEntry } from './storage'

function insulinName(id: string): string {
  return INSULIN_CATALOGUE.find(i => i.id === id)?.name ?? id
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  )
}

async function loadLogoBase64(): Promise<string> {
  const response = await fetch('/icons/icon-192.png')
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function exportHistoryPDF(entries: HistoryEntry[]): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14

  // ── Logo ────────────────────────────────────────────────────────────────────
  let logoBase64: string | null = null
  try {
    logoBase64 = await loadLogoBase64()
  } catch {
    // Logo is optional — continue without it
  }

  const logoSize = 18
  const logoX = margin
  const logoY = 10
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize)
  }

  // ── Header text ─────────────────────────────────────────────────────────────
  const textX = logoBase64 ? logoX + logoSize + 4 : margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)   // slate-900
  doc.text('CalcIns', textX, logoY + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) // slate-500
  doc.text('Historial de dosis de insulina', textX, logoY + 13)

  // Export date — right aligned
  const exportDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  doc.text(`Generado: ${exportDate}`, pageWidth - margin, logoY + 7, { align: 'right' })
  doc.text(
    `${entries.length} registro${entries.length !== 1 ? 's' : ''}`,
    pageWidth - margin,
    logoY + 13,
    { align: 'right' },
  )

  // ── Divider ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240) // slate-200
  doc.setLineWidth(0.4)
  doc.line(margin, logoY + logoSize + 2, pageWidth - margin, logoY + logoSize + 2)

  // ── Table ───────────────────────────────────────────────────────────────────
  autoTable(doc, {
    startY: logoY + logoSize + 8,
    margin: { left: margin, right: margin },
    head: [['Fecha y hora', 'Insulina', 'Carbos (g)', 'Dosis (u)']],
    body: entries.map(e => [
      fmtDate(e.timestamp),
      insulinName(e.insulinId),
      String(e.carbohidratos),
      e.dosisFinal % 1 === 0 ? String(e.dosisFinal) : e.dosisFinal.toFixed(1),
    ]),
    headStyles: {
      fillColor: [30, 58, 138],  // blue-900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],   // slate-800
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: { cellWidth: 42 },
      2: { halign: 'center' },
      3: { halign: 'center', fontStyle: 'bold' },
    },
  })

  // ── Disclaimer ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY: number = (doc as any).lastAutoTable?.finalY ?? 200
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text(
    'Esta app es una herramienta de apoyo personal y no reemplaza al equipo médico.',
    pageWidth / 2,
    tableEndY + 10,
    { align: 'center' },
  )

  // ── Save ────────────────────────────────────────────────────────────────────
  doc.save(`calcins-historial-${new Date().toISOString().slice(0, 10)}.pdf`)
}
