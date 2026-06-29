import { useRef, useState, type ChangeEvent } from 'react'
import type { HistoryEntry } from '../lib/storage'
import { exportHistoryJSON, importHistoryJSON } from '../lib/storage'
import { exportHistoryPDF } from '../lib/pdf'
import { INSULIN_CATALOGUE } from '../lib/bolus'

interface Props {
  entries: HistoryEntry[]
  onImport: (entries: HistoryEntry[]) => void
  onClear: () => void
}

function insulinName(id: string): string {
  return INSULIN_CATALOGUE.find(i => i.id === id)?.name ?? id
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function fmt(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
}

export function HistoryPanel({ entries, onImport, onClear }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [exportingPdf, setExportingPdf] = useState(false)

  async function handleExportPDF() {
    setExportingPdf(true)
    try {
      await exportHistoryPDF(entries)
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importHistoryJSON(file)
      onImport(data)
    } catch (err) {
      alert(`No se pudo importar: ${err instanceof Error ? err.message : 'error desconocido'}`)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-base font-semibold text-slate-800">
          Historial
          {entries.length > 0 && (
            <span className="ml-2 text-xs text-slate-400 font-normal">{entries.length} entradas</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHistoryJSON(entries)}
            disabled={entries.length === 0}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600
                       hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={entries.length === 0 || exportingPdf}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600
                       hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {exportingPdf ? '…' : 'PDF'}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600
                       hover:bg-slate-50 transition-colors"
          >
            Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
          />
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Borrar todo el historial? Esta acción no se puede deshacer.')) onClear()
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600
                         hover:bg-red-50 transition-colors"
            >
              Borrar
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">Sin registros todavía</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map(e => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-slate-400">{fmtDate(e.timestamp)}</span>
                <span className="text-lg font-bold text-blue-900 tabular-nums">{fmt(e.dosisFinal)} u</span>
              </div>
              <p className="text-xs text-slate-500">{insulinName(e.insulinId)}</p>
              <div className="flex gap-4 mt-1 text-xs text-slate-500">
                <span>CHO: <strong className="text-slate-700">{e.carbohidratos}</strong> g</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
