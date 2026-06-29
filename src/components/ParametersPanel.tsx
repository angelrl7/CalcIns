import { useState, type ChangeEvent } from 'react'
import type { BolusParams } from '../lib/bolus'

interface Props {
  params: Partial<BolusParams>
  onChange: (p: Partial<BolusParams>) => void
}

interface FieldDef {
  key: keyof BolusParams
  label: string
  unit: string
  hint: string
  min: number
  step: number
}

const FIELDS: FieldDef[] = [
  { key: 'icr',        label: 'ICR — Ratio insulina:carbohidratos', unit: 'g/u', hint: 'Gramos de hidratos cubiertos por 1 unidad', min: 1, step: 1 },
  { key: 'topeAlerta', label: 'Tope de alerta de dosis',            unit: 'u',   hint: 'Muestra aviso si se supera este valor',      min: 1, step: 1 },
]

export function ParametersPanel({ params, onChange }: Props) {
  const [open, setOpen] = useState(false)

  function handleChange(key: keyof BolusParams, value: string) {
    if (key === 'paso') {
      const paso = parseFloat(value) as 0.5 | 1
      onChange({ ...params, paso })
      return
    }
    const num = value === '' ? undefined : parseFloat(value)
    onChange({ ...params, [key]: num })
  }

  const allSet = FIELDS.every(f => {
    const v = params[f.key]
    return v !== undefined && v !== null && !isNaN(v as number) && (v as number) > 0
  }) && params.paso !== undefined

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-base font-semibold text-slate-800 dark:text-slate-100">Parámetros personales</span>
          {allSet
            ? <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">configurados</span>
            : <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">incompletos</span>
          }
        </span>
        <svg
          className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-4 pb-5 pt-3 space-y-4">
          <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            Estos valores los define tu endocrinólogo o diabetólogo. No los modifiques sin indicación médica.
          </p>

          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                {f.label}
                <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal">({f.unit})</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{f.hint}</p>
              <input
                type="number"
                inputMode="decimal"
                min={f.min}
                step={f.step}
                value={params[f.key] === undefined ? '' : String(params[f.key])}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(f.key, e.target.value)}
                placeholder="—"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5
                           text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder:text-slate-300 dark:placeholder:text-slate-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Paso de redondeo
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Según tu lapicera o bomba de insulina</p>
            <div className="flex gap-3">
              {(['0.5', '1'] as const).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleChange('paso', v)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors
                    ${String(params.paso) === v
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-blue-400'
                    }`}
                >
                  {v === '0.5' ? '½ unidad' : '1 unidad'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
