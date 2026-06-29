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
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-950 text-white px-4 pt-safe-top pb-3 pt-3">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold tracking-tight">CalcIns</h1>
          <p className="text-blue-300 text-xs">Calculadora de bolo de insulina</p>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex">
          {(['calc', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2
                ${tab === t
                  ? 'text-blue-700 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
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
              className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-slate-300
                         disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl
                         transition-colors text-base shadow-sm"
            >
              Calcular dosis
            </button>

            {registered && (
              <p className="text-center text-emerald-700 text-sm font-medium">
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
        <p className="text-xs text-slate-400 text-center leading-relaxed">
          Esta app es una ayuda personal y no reemplaza al equipo médico.
          Ante valores inesperados, no inyectar y consultar a tu endocrinólogo o diabetólogo.
        </p>
      </footer>
    </div>
  )
}
