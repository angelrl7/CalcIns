export interface CarbEstimate {
  carbs: number
  breakdown: string
}

export async function estimateCarbs(description: string): Promise<CarbEstimate> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  if (!apiKey) throw new Error('no_key')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 600,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Sos un asistente de estimación de carbohidratos para una persona con diabetes.
Dado lo que comió, estimá los gramos totales de carbohidratos.
Respondé SOLO con JSON: {"carbs": número_entero, "breakdown": "lista breve de cada alimento con sus gramos de CHO"}`,
        },
        { role: 'user', content: description },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Error ${response.status}`)
  }

  const data = await response.json() as { choices: { message: { content: string } }[] }
  const text = data.choices[0]?.message?.content?.trim()
  if (!text) throw new Error('La IA no devolvió respuesta')

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) throw new Error('No se pudo interpretar la respuesta de la IA')
    parsed = JSON.parse(match[0])
  }

  const obj = parsed as Record<string, unknown>
  const carbs = Number(obj.carbs)
  if (!isFinite(carbs) || carbs < 0) throw new Error('La IA devolvió un valor de carbohidratos inválido')

  let breakdown: string
  if (typeof obj.breakdown === 'string') {
    breakdown = obj.breakdown
  } else if (Array.isArray(obj.breakdown)) {
    breakdown = obj.breakdown
      .map((item: unknown) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          const name = o.food ?? o.name ?? o.alimento ?? o.item ?? ''
          const g = o.carbs ?? o.carbohidratos ?? o.grams ?? o.g ?? ''
          return `${name}: ${g}g`
        }
        return String(item)
      })
      .join(', ')
  } else {
    breakdown = String(obj.breakdown ?? '')
  }

  return { carbs: Math.round(carbs), breakdown }
}
