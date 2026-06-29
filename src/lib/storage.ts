import type { BolusParams } from './bolus'

// ─── Parameters ───────────────────────────────────────────────────────────────

const PARAMS_KEY = 'calcins_params'

/** Returns undefined when no params have been saved yet (intentional: no defaults). */
export function loadParams(): Partial<BolusParams> | undefined {
  try {
    const raw = localStorage.getItem(PARAMS_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as Partial<BolusParams>
  } catch {
    return undefined
  }
}

export function saveParams(params: Partial<BolusParams>): void {
  localStorage.setItem(PARAMS_KEY, JSON.stringify(params))
}

// ─── History ──────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'calcins_history'

export interface HistoryEntry {
  id: string
  timestamp: string  // ISO 8601
  insulinId: string
  carbohidratos: number
  dosisFinal: number
  boloComida: number
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry {
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  }
  const entries = loadHistory()
  saveHistory([newEntry, ...entries])
  return newEntry
}

export function exportHistoryJSON(entries: HistoryEntry[]): void {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `calcins-historial-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importHistoryJSON(file: File): Promise<HistoryEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as HistoryEntry[]
        if (!Array.isArray(data)) throw new Error('El archivo no contiene un array de entradas.')
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.readAsText(file)
  })
}
