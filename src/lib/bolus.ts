/**
 * Insulin bolus calculation logic.
 * All safety rules are enforced here, isolated from the UI.
 */

// ─── Insulin catalogue ────────────────────────────────────────────────────────

export type InsulinType = 'bolus' | 'basal'

export interface Insulin {
  id: string
  name: string
  type: InsulinType
}

export const INSULIN_CATALOGUE: Insulin[] = [
  { id: 'aspart',    name: 'Aspart (NovoRapid)', type: 'bolus' },
  { id: 'lispro',   name: 'Lispro (Humalog)',    type: 'bolus' },
  { id: 'glulisina',name: 'Glulisina (Apidra)',  type: 'bolus' },
]

// ─── Parameters & inputs ─────────────────────────────────────────────────────

/** User-defined personal parameters — deliberately no defaults for medical values. */
export interface BolusParams {
  /** Insulin-to-carb ratio: grams of carbs covered by 1 unit */
  icr: number
  /** Maximum dose before a safety alert is shown (configurable, not a hard block) */
  topeAlerta: number
  /** Rounding step: 0.5 or 1 unit */
  paso: 0.5 | 1
}

export interface BolusInput {
  insulinId: string
  carbohidratos: number // grams
}

// ─── Result variants ─────────────────────────────────────────────────────────

export type BolusResultOk = {
  type: 'ok'
  boloComida: number
  dosisTotal: number  // before rounding
  dosisFinal: number  // after rounding and floor at 0
  alertaTope: boolean
}

export type BolusResultError =
  | { type: 'basal_blocked' }
  | { type: 'missing_params' }

export type BolusResult = BolusResultOk | BolusResultError

// ─── Core calculation ────────────────────────────────────────────────────────

function round(value: number, step: 0.5 | 1): number {
  return Math.round(value / step) * step
}

export function calcularBolo(params: BolusParams, input: BolusInput): BolusResult {
  // Rule 2 — Only rapid-acting (bolus) insulins are calculated
  const insulin = INSULIN_CATALOGUE.find(i => i.id === input.insulinId)
  if (!insulin || insulin.type === 'basal') {
    return { type: 'basal_blocked' }
  }

  // Rule 1 — Params must be fully defined and positive (no defaults)
  if (
    !isFinite(params.icr)        || params.icr <= 0 ||
    !isFinite(params.topeAlerta) || params.topeAlerta <= 0
  ) {
    return { type: 'missing_params' }
  }

  const boloComida = input.carbohidratos / params.icr
  const dosisFinalRaw = Math.max(0, boloComida)
  const dosisFinal = round(dosisFinalRaw, params.paso)

  // Rule 5 — Alert (not block) if above cap
  const alertaTope = dosisFinal > params.topeAlerta

  return {
    type: 'ok',
    boloComida,
    dosisTotal: dosisFinalRaw,
    dosisFinal,
    alertaTope,
  }
}
