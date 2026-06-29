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
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Historial
          {entries.length > 0 && (
            <span className="ml-2 text-xs text-slate-400 dark:text-slate-500 font-normal">{entries.length} entradas</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportHistoryJSON(entries)}
            disabled={entries.length === 0}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            JSON
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={entries.length === 0 || exportingPdf}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {exportingPdf ? '…' : 'PDF'}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600
                       text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-colors"
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
              className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900
                         text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950
                         transition-colors"
            >
              Borrar
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">Sin registros todavía</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {entries.map(e => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-slate-400 dark:text-slate-500">{fmtDate(e.timestamp)}</span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-300 tabular-nums">{fmt(e.dosisFinal)} u</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{insulinName(e.insulinId)}</p>
              <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span>CHO: <strong className="text-slate-700 dark:text-slate-300">{e.carbohidratos}</strong> g</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
