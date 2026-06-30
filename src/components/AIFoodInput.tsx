import { useState } from 'react'
import { estimateCarbs } from '../lib/ai'
import type { BolusResult } from '../lib/bolus'

interface Props {
  onCarbs: (carbs: number | undefined) => void
  onEstimated?: (carbs: number) => BolusResult | null
}

export function AIFoodInput({ onCarbs, onEstimated }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ carbs: number; breakdown: string } | null>(null)
  const [doseResult, setDoseResult] = useState<BolusResult | null>(null)

  async function handleEstimate() {
    if (!description.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const estimate = await estimateCarbs(description.trim())
      setResult(estimate)
      onCarbs(estimate.carbs)
      const dose = onEstimated?.(estimate.carbs) ?? null
      setDoseResult(dose)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setError(msg === 'no_key' ? 'Falta configurar la clave de API. Creá un archivo .env con VITE_GROQ_API_KEY (gratis en console.groq.com)' : msg)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEstimate()
    }
  }

  function clear() {
    setDescription('')
    setResult(null)
    setDoseResult(null)
    setError(null)
    onCarbs(undefined)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={description}
          onChange={e => {
            setDescription(e.target.value)
            if (result) { setResult(null); setDoseResult(null); onCarbs(undefined) }
          }}
          onKeyDown={handleKeyDown}
          placeholder={'Describí lo que comiste...\nEj: 2 empanadas de carne, una banana y un vaso de jugo de naranja'}
          rows={3}
          disabled={loading}
          className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5
                     text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 text-sm
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                     placeholder:text-slate-300 dark:placeholder:text-slate-500 resize-none
                     disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading || !description.trim()}
        className="w-full flex items-center justify-center gap-2
                   bg-violet-600 hover:bg-violet-700 active:bg-violet-800
                   disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed
                   text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analizando...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Estimar carbohidratos con IA
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          {/* Carb breakdown */}
          <div className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3">
            <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Análisis IA</p>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{result.breakdown}</p>
          </div>

          {/* Carbs total */}
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Carbohidratos</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-slate-800 dark:text-slate-100">{result.carbs}</span>
              <span className="text-slate-400 text-sm">g</span>
            </div>
          </div>

          {/* Insulin dose */}
          {doseResult?.type === 'ok' && (
            <div className={`rounded-xl px-4 py-5 ${doseResult.alertaTope ? 'bg-amber-500' : 'bg-blue-950'} text-white`}>
              {doseResult.alertaTope && (
                <p className="text-xs font-semibold text-white/80 mb-1 uppercase tracking-wide">
                  ⚠️ Dosis alta — revisá los datos
                </p>
              )}
              <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Ponete</p>
              <p className="text-6xl font-bold tabular-nums">
                {doseResult.dosisFinal % 1 === 0 ? doseResult.dosisFinal.toFixed(0) : doseResult.dosisFinal.toFixed(1)}
                <span className="text-3xl ml-1 font-normal text-white/60">u</span>
              </p>
              <p className="text-xs text-white/50 mt-2">de insulina rápida</p>
            </div>
          )}

          {doseResult?.type === 'missing_params' && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Completá el ICR en Parámetros para ver la dosis.
              </p>
            </div>
          )}

          {!doseResult && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Seleccioná la insulina para ver la dosis.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={clear}
            className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-1"
          >
            Limpiar y empezar de nuevo
          </button>
        </div>
      )}
    </div>
  )
}
