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
      max_tokens: 300,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Sos un asistente de estimación de carbohidratos para una persona con diabetes.
Dado lo que comió, estimá los gramos totales de carbohidratos.
Respondé SOLO con un JSON válido, sin texto adicional:
{"carbs": número_entero, "breakdown": "explicación breve de cada alimento y su aporte en gramos de carbohidratos"}`,
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
  const text = data.choices[0].message.content.trim()

  let parsed: { carbs: number; breakdown: string }
  try {
    parsed = JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Respuesta inválida de la IA')
    parsed = JSON.parse(match[0])
  }

  return { carbs: Math.round(parsed.carbs), breakdown: parsed.breakdown }
}
