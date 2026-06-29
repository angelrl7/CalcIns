import type { BolusResult, BolusResultOk } from '../lib/bolus'

interface Props {
  result: BolusResult | null
  onRegister: (r: BolusResultOk) => void
}

function fmt(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)
}

export function ResultPanel({ result, onRegister }: Props) {
  if (!result) return null

  // ── Blocked states ──────────────────────────────────────────────────────────

  if (result.type === 'basal_blocked') {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl px-4 py-4 space-y-1">
        <p className="text-red-800 dark:text-red-300 font-semibold text-sm">Insulina basal seleccionada</p>
        <p className="text-red-700 dark:text-red-400 text-sm">
          La dosis de insulina basal es fija y la indica tu médico. No se puede calcular por comida con esta app.
          Seleccioná una insulina rápida para calcular el bolo.
        </p>
      </div>
    )
  }

  if (result.type === 'missing_params') {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3">
        <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">Parámetros incompletos</p>
        <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
          Completá el ICR y el tope de alerta en el panel de arriba antes de calcular.
        </p>
      </div>
    )
  }

  // ── Ok result ───────────────────────────────────────────────────────────────

  const r = result

  return (
    <div className="space-y-3">
      {/* High-dose alert */}
      {r.alertaTope && (
        <div className="bg-amber-50 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-700 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="text-xl mt-0.5" role="img" aria-label="alerta">⚠️</span>
          <div>
            <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">Dosis más alta de lo habitual</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
              La dosis calculada supera tu tope de alerta. Revisá los datos ingresados antes de inyectar.
            </p>
          </div>
        </div>
      )}

      {/* Dose result card */}
      <div className="bg-blue-950 text-white rounded-xl px-4 py-5">
        <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">Dosis sugerida</p>
        <p className="text-5xl font-bold tabular-nums">
          {fmt(r.dosisFinal)}<span className="text-2xl ml-1 font-normal text-blue-300">u</span>
        </p>
      </div>

      {/* Breakdown */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest px-4 pt-3 pb-1 font-medium">Desglose</p>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-t border-slate-100 dark:border-slate-700">
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Bolo de comida</td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-800 dark:text-slate-200 font-semibold">{fmt(r.boloComida)} u</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
              <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200 font-semibold">Total redondeado</td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-900 dark:text-white font-bold">{fmt(r.dosisFinal)} u</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Register button */}
      <button
        type="button"
        onClick={() => onRegister(r)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white
                   font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        Registrar esta dosis
      </button>
    </div>
  )
}
