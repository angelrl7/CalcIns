import { useState, useEffect, useCallback } from 'react'
import type { BolusParams, BolusInput, BolusResultOk } from './lib/bolus'
import { calcularBolo, type BolusResult } from './lib/bolus'
import {
  loadParams, saveParams,
  loadHistory, saveHistory, addHistoryEntry,
  type HistoryEntry,
} from './lib/storage'
import { ParametersPanel } from './components/ParametersPanel'
import { CalculatorForm } from './components/CalculatorForm'
import { ResultPanel } from './components/ResultPanel'
import { HistoryPanel } from './components/HistoryPanel'

type Tab = 'calc' | 'history'

function isComplete(p: Partial<BolusParams>): p is BolusParams {
  return (
    typeof p.icr === 'number' && p.icr > 0 &&
    typeof p.topeAlerta === 'number' && p.topeAlerta > 0 &&
    (p.paso === 0.5 || p.paso === 1)
  )
}

function isCompleteInput(i: Partial<BolusInput>): i is BolusInput {
  return (
    typeof i.insulinId === 'string' && i.insulinId !== '' &&
    typeof i.carbohidratos === 'number' && i.carbohidratos >= 0
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('calc')
  const [params, setParams] = useState<Partial<BolusParams>>(() => loadParams() ?? {})
  const [input, setInput] = useState<Partial<BolusInput>>({})
  const [result, setResult] = useState<BolusResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [registered, setRegistered] = useState(false)

  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('calcins_theme')
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('calcins_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => { saveParams(params) }, [params])

  const calculate = useCallback(() => {
    if (!isComplete(params)) {
      setResult({ type: 'missing_params' })
      return
    }
    if (!isCompleteInput(input)) return
    setResult(calcularBolo(params, input))
    setRegistered(false)
  }, [params, input])

  function handleRegister(r: BolusResultOk) {
    if (!isCompleteInput(input)) return
    const entry = addHistoryEntry({
      insulinId: input.insulinId,
      carbohidratos: input.carbohidratos,
      dosisFinal: r.dosisFinal,
      boloComida: r.boloComida,
    })
    setHistory(prev => [entry, ...prev])
    setRegistered(true)
  }

  function handleImportHistory(imported: HistoryEntry[]) {
    saveHistory(imported)
    setHistory(imported)
  }

  function handleClearHistory() {
    saveHistory([])
    setHistory([])
  }

  const canCalculate = isComplete(params) && isCompleteInput(input)

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-blue-950 text-white px-4 pt-safe-top pb-3 pt-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">CalcIns</h1>
            <p className="text-blue-300 text-xs">Calculadora de bolo de insulina</p>
          </div>
          <button
            type="button"
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-900 transition-colors"
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {dark ? (
              // Sun icon
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex">
          {(['calc', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2
                ${tab === t
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {t === 'calc' ? 'Calculadora' : 'Historial'}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {tab === 'calc' ? (
          <>
            <ParametersPanel params={params} onChange={setParams} />
            <CalculatorForm input={input} onChange={setInput} />

            <button
              type="button"
              onClick={calculate}
              disabled={!canCalculate}
              className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900
                         disabled:bg-slate-300 dark:disabled:bg-slate-700
                         disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl
                         transition-colors text-base shadow-sm"
            >
              Calcular dosis
            </button>

            {registered && (
              <p className="text-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                ✓ Dosis registrada en el historial
              </p>
            )}

            <ResultPanel result={result} onRegister={handleRegister} />
          </>
        ) : (
          <HistoryPanel
            entries={history}
            onImport={handleImportHistory}
            onClear={handleClearHistory}
          />
        )}
      </main>

      {/* Disclaimer */}
      <footer className="px-4 py-4 pb-safe-bottom max-w-md mx-auto w-full">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
          Esta app es una ayuda personal y no reemplaza al equipo médico.
          Ante valores inesperados, no inyectar y consultar a tu endocrinólogo o diabetólogo.
        </p>
      </footer>
    </div>
  )
}
