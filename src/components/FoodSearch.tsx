import { useState } from 'react'
import { FOOD_DATABASE, type Food } from '../lib/foods'

interface SelectedFood {
  food: Food
  portions: number
}

interface Props {
  onChange: (carbs: number | undefined) => void
}

export function FoodSearch({ onChange }: Props) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selected, setSelected] = useState<SelectedFood[]>([])

  const results = query.trim().length > 0
    ? FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 7)
    : []

  function notify(next: SelectedFood[]) {
    const total = next.reduce((sum, s) => sum + s.food.carbsPerPortion * s.portions, 0)
    onChange(next.length === 0 ? undefined : Math.round(total))
  }

  function addFood(food: Food) {
    const existing = selected.find(s => s.food.id === food.id)
    const next = existing
      ? selected.map(s => s.food.id === food.id ? { ...s, portions: s.portions + 1 } : s)
      : [...selected, { food, portions: 1 }]
    setSelected(next)
    notify(next)
    setQuery('')
    setShowResults(false)
  }

  function changePortions(id: string, delta: number) {
    const next = selected
      .map(s => s.food.id === id ? { ...s, portions: s.portions + delta } : s)
      .filter(s => s.portions > 0)
    setSelected(next)
    notify(next)
  }

  function removeFood(id: string) {
    const next = selected.filter(s => s.food.id !== id)
    setSelected(next)
    notify(next)
  }

  function clearAll() {
    setSelected([])
    onChange(undefined)
  }

  const totalCarbs = selected.reduce((sum, s) => sum + s.food.carbsPerPortion * s.portions, 0)

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true) }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Buscá un alimento..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-slate-300"
        />
        {showResults && results.length > 0 && (
          <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden">
            {results.map(food => (
              <button
                key={food.id}
                type="button"
                onMouseDown={() => addFood(food)}
                className="w-full px-3 py-2.5 text-left flex items-center justify-between gap-2
                           hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{food.name}</p>
                  <p className="text-xs text-slate-400">{food.portionLabel}</p>
                </div>
                <span className="text-xs font-semibold text-blue-700 shrink-0">
                  {food.carbsPerPortion}g CHO
                </span>
              </button>
            ))}
          </div>
        )}
        {showResults && query.trim().length > 0 && results.length === 0 && (
          <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 px-3 py-3">
            <p className="text-sm text-slate-400">Sin resultados para "{query}"</p>
          </div>
        )}
      </div>

      {/* Selected foods */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map(({ food, portions }) => (
            <div
              key={food.id}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{food.name}</p>
                <p className="text-xs text-slate-500">{food.portionLabel}</p>
              </div>

              {/* Portions counter */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => changePortions(food.id, -1)}
                  className="w-7 h-7 rounded-md bg-white border border-slate-300 text-slate-600
                             font-bold text-base flex items-center justify-center
                             hover:bg-slate-100 active:bg-slate-200"
                >
                  −
                </button>
                <span className="text-sm font-mono w-5 text-center text-slate-800">{portions}</span>
                <button
                  type="button"
                  onClick={() => changePortions(food.id, +1)}
                  className="w-7 h-7 rounded-md bg-white border border-slate-300 text-slate-600
                             font-bold text-base flex items-center justify-center
                             hover:bg-slate-100 active:bg-slate-200"
                >
                  +
                </button>
              </div>

              <span className="text-sm font-semibold text-blue-700 w-12 text-right shrink-0">
                {food.carbsPerPortion * portions}g
              </span>

              <button
                type="button"
                onClick={() => removeFood(food.id)}
                className="text-slate-300 hover:text-red-400 text-lg leading-none ml-1 shrink-0"
                aria-label="Eliminar"
              >
                ×
              </button>
            </div>
          ))}

          {/* Total */}
          <div className="bg-blue-950 text-white rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-blue-300">Total carbohidratos</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold tabular-nums">{Math.round(totalCarbs)}</span>
              <span className="text-blue-300 text-sm">g</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-blue-400 hover:text-blue-200 underline ml-1"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
