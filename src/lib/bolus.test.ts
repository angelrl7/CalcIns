import { describe, it, expect } from 'vitest'
import { calcularBolo, type BolusParams, type BolusInput } from './bolus'

const BASE_PARAMS: BolusParams = {
  icr: 10,        // 1u per 10g carbs
  topeAlerta: 15,
  paso: 0.5,
}

const BASE_INPUT: BolusInput = {
  insulinId: 'aspart',
  carbohidratos: 40,
}

// ─── Rule 2: Only known rapid insulins are allowed ───────────────────────────

describe('Rule 2 — only rapid insulins allowed', () => {
  it('allows calculation for all rapid-acting insulins', () => {
    const rapidIds = ['aspart', 'lispro', 'glulisina']
    rapidIds.forEach(id => {
      const result = calcularBolo(BASE_PARAMS, { ...BASE_INPUT, insulinId: id })
      expect(result.type).toBe('ok')
    })
  })

  it('blocks an unknown insulin id', () => {
    const result = calcularBolo(BASE_PARAMS, { ...BASE_INPUT, insulinId: 'unknown_xyz' })
    expect(result.type).toBe('basal_blocked')
  })
})

// ─── Rule 1: Missing / invalid params ────────────────────────────────────────

describe('Rule 1 — missing or invalid params', () => {
  it('blocks when ICR is zero', () => {
    const result = calcularBolo({ ...BASE_PARAMS, icr: 0 }, BASE_INPUT)
    expect(result.type).toBe('missing_params')
  })

  it('blocks when ICR is negative', () => {
    const result = calcularBolo({ ...BASE_PARAMS, icr: -5 }, BASE_INPUT)
    expect(result.type).toBe('missing_params')
  })

  it('blocks when topeAlerta is zero', () => {
    const result = calcularBolo({ ...BASE_PARAMS, topeAlerta: 0 }, BASE_INPUT)
    expect(result.type).toBe('missing_params')
  })
})

// ─── Rule 5: High-dose alert ─────────────────────────────────────────────────

describe('Rule 5 — high dose alert', () => {
  it('sets alertaTope when dose exceeds topeAlerta', () => {
    // 200g / ICR 10 = 20u → above topeAlerta 15
    const result = calcularBolo(BASE_PARAMS, { ...BASE_INPUT, carbohidratos: 200 })
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.alertaTope).toBe(true)
    }
  })

  it('does NOT set alertaTope for a normal dose', () => {
    // 40g / ICR 10 = 4u → well under topeAlerta 15
    const result = calcularBolo(BASE_PARAMS, BASE_INPUT)
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.alertaTope).toBe(false)
    }
  })

  it('does NOT block calculation when alertaTope is true', () => {
    const result = calcularBolo(BASE_PARAMS, { ...BASE_INPUT, carbohidratos: 200 })
    expect(result.type).toBe('ok')
  })
})

// ─── Rule 4 extended: Total dose never negative ───────────────────────────────

describe('Rule 4 — total dose never negative', () => {
  it('returns 0 for 0 carbohidratos', () => {
    const result = calcularBolo(BASE_PARAMS, { ...BASE_INPUT, carbohidratos: 0 })
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.dosisFinal).toBe(0)
    }
  })
})

// ─── Rule 6: Transparent breakdown ───────────────────────────────────────────

describe('Rule 6 — transparent breakdown', () => {
  it('returns all breakdown fields', () => {
    const result = calcularBolo(BASE_PARAMS, BASE_INPUT)
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(typeof result.boloComida).toBe('number')
      expect(typeof result.dosisTotal).toBe('number')
      expect(typeof result.dosisFinal).toBe('number')
    }
  })

  it('calculates a known scenario correctly', () => {
    // ICR 10, carbos 50g → boloComida = 5u, dosisFinal = 5u
    const result = calcularBolo(BASE_PARAMS, { insulinId: 'aspart', carbohidratos: 50 })
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.boloComida).toBeCloseTo(5)
      expect(result.dosisFinal).toBeCloseTo(5)
    }
  })
})

// ─── Rounding step ───────────────────────────────────────────────────────────

describe('Rounding step', () => {
  it('rounds to 0.5 when paso is 0.5', () => {
    // 43g / ICR 10 = 4.3u → rounded to 4.5
    const result = calcularBolo({ ...BASE_PARAMS, paso: 0.5 }, { ...BASE_INPUT, carbohidratos: 43 })
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.dosisFinal).toBeCloseTo(4.5)
      expect(result.dosisFinal % 0.5).toBeCloseTo(0)
    }
  })

  it('rounds to whole units when paso is 1', () => {
    // 43g / ICR 10 = 4.3u → rounded to 4
    const result = calcularBolo({ ...BASE_PARAMS, paso: 1 }, { ...BASE_INPUT, carbohidratos: 43 })
    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.dosisFinal % 1).toBeCloseTo(0)
    }
  })
})
