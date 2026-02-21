import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { draftJob, marketJobs } = await req.json()

        if (!draftJob) {
            return NextResponse.json({ error: 'Oferta borrador faltante' }, { status: 400 })
        }

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
        }

        const prompt = `
Eres un experto consultor de Talento y Adquisición. 
Una empresa está redactando una nueva oferta de empleo. Aquí te paso su "Borrador" y un array con "Ofertas del Mercado" similares para que las compares.

BORRADOR DE LA EMPRESA:
${JSON.stringify(draftJob, null, 2)}

OFERTAS SIMILARES EN EL MERCADO COMPETITIVO:
${JSON.stringify(marketJobs, null, 2)}

Tu objetivo es analizar el borrador comparándolo con el mercado y proveer feedback accionable para que la empresa consiga mejores candidatos.
Devuelve EXACTAMENTE un objeto JSON con esta estructura (sin bloques markdown \`\`\`json):
{
  "competitivenessScore": 75, // del 1 al 100 indicando qué tan atractiva es comparada al resto
  "salaryComparison": "Breve frase comparando el salario con la media.",
  "missingBenefits": ["Beneficio 1 que la competencia da y tú no", "Beneficio 2"],
  "descriptionFeedback": "Crítica constructiva a la descripción y requerimientos",
  "improvementTips": ["Tip de mejora 1", "Tip de mejora 2"]
}
`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Reclut Platform',
            },
            body: JSON.stringify({
                model: 'qwen/qwen-2.5-72b-instruct',
                messages: [
                    { role: 'system', content: 'You are an HR Market Analyst that output strictly JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('OpenRouter Error:', errorData)
            return NextResponse.json({ error: 'Error del proveedor de IA' }, { status: response.status })
        }

        const data = await response.json()
        const content = data.choices[0].message.content
        const start = content.indexOf('{')
        const end = content.lastIndexOf('}')
        if (start === -1 || end === -1) throw new Error("No JSON found")
        const jsonStr = content.substring(start, end + 1)
        const parsedContent = JSON.parse(jsonStr)

        return NextResponse.json(parsedContent)
    } catch (error) {
        console.error('Error analyzing posting:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
