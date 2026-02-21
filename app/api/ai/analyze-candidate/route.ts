import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { userProfile, jobDescription } = await req.json()

        if (!userProfile || !jobDescription) {
            return NextResponse.json({ error: 'Perfil o descripción faltante' }, { status: 400 })
        }

        const apiKey = process.env.OPENROUTER_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
        }

        const prompt = `
Eres un experto analista de reclutamiento de Recursos Humanos. 
Tengo la siguiente descripción de una oferta de empleo y el perfil de un candidato.

DESCRIPCIÓN DE LA OFERTA:
${JSON.stringify(jobDescription, null, 2)}

PERFIL DEL CANDIDATO:
${JSON.stringify(userProfile, null, 2)}

Por favor, analiza la compatibilidad del candidato con la oferta. Devuelve tu respuesta EXACTAMENTE en el siguiente formato JSON, sin texto adicional ni bloques de markdown (solo las llaves {} y su contenido):
{
  "matchPercentage": 85,
  "strengths": ["Fuerte 1", "Fuerte 2", "Fuerte 3"],
  "gaps": ["Brecha 1", "Brecha 2"],
  "recommendation": "Un párrafo breve con un consejo claro para la entrevista o el CV del candidato enfocado en esta vacante específica."
}
`

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000', // Update with actual domain if needed
                'X-Title': 'Reclut Platform',
            },
            body: JSON.stringify({
                model: 'qwen/qwen3-235b-a22b-thinking-2507', // Requested by user
                messages: [
                    { role: 'system', content: 'You are a helpful HR assistant that output strictly JSON.' },
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
        console.error('Error analyzing candidate:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
