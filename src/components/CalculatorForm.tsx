import { type ChangeEvent } from 'react'
import { INSULIN_CATALOGUE, type BolusInput } from '../lib/bolus'
import { FoodSearch } from './FoodSearch'

interface Props {
  input: Partial<BolusInput>
  onChange: (i: Partial<BolusInput>) => void
}

export function CalculatorForm({ input, onChange }: Props) {
  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-4 space-y-4">
      <h2 className="text-base font-semibold text-slate-800">Datos del bolo</h2>

      {/* Insulin selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Insulina rápida</label>
        <select
          value={input.insulinId ?? ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ ...input, insulinId: e.target.value || undefined })}
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-white appearance-none"
        >
          <option value="">— Seleccioná —</option>
          {INSULIN_CATALOGUE.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      </div>

      {/* Food search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ¿Qué comiste?
        </label>
        <FoodSearch
          onChange={(carbs) => onChange({ ...input, carbohidratos: carbs })}
        />
      </div>
    </section>
  )
}
