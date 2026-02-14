import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Ensure this is set in .env
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Reclu';

export async function POST(req: Request) {
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: 'OpenRouter API Key not configured' }, { status: 500 });
    }

    try {
        const { job, candidate } = await req.json();

        if (!job || !candidate) {
            return NextResponse.json({ error: 'Missing job or candidate data' }, { status: 400 });
        }

        const calculateDuration = (start: string, end?: string) => {
            const startDate = new Date(start);
            const endDate = end ? new Date(end) : new Date();
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return `${Math.floor(diffDays / 365)} años`;
        };

        const SCORING_PROMPT = `
Eres un experto reclutador con 15 años de experiencia. Evalúa la compatibilidad entre este candidato y la vacante usando criterios objetivos y científicos.

═══════════════════════════════════════════════════════
📋 INFORMACIÓN DE LA VACANTE
═══════════════════════════════════════════════════════

TÍTULO: ${job.title}
EMPRESA: ${job.company?.name || 'Empresa Confidencial'}
INDUSTRIA: ${job.industry || 'No especificada'}
UBICACIÓN: ${job.location || 'Remoto'}
MODALIDAD: ${job.workMode || 'No especificado'} (Remoto/Híbrido/Presencial)

DESCRIPCIÓN:
${job.description}

RESPONSABILIDADES PRINCIPALES:
${job.responsibilities?.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') || 'No especificadas'}

REQUISITOS OBLIGATORIOS:
${job.requiredSkills?.map((s: any) => `- ${s.name} (Nivel: ${s.level})`).join('\n') || 'No especificados'}

REQUISITOS DESEABLES:
${job.preferredSkills?.map((s: any) => `- ${s.name}`).join('\n') || 'No especificados'}

EXPERIENCIA REQUERIDA: ${job.yearsExperience || 0} años
EDUCACIÓN REQUERIDA: ${job.educationLevel || 'No especificada'}
RANGO SALARIAL: ${job.salaryMin} - ${job.salaryMax} ${job.currency}

VALORES DE LA EMPRESA:
${job.company?.values?.join(', ') || 'No especificados'}

═══════════════════════════════════════════════════════
👤 PERFIL DEL CANDIDATO
═══════════════════════════════════════════════════════

NOMBRE: ${candidate.name}
HEADLINE: ${candidate.headline || 'Sin headline'}
UBICACIÓN: ${candidate.location || 'No especificada'}

BIO/RESUMEN:
${candidate.bio || 'Sin biografía'}

EXPERIENCIA LABORAL:
${candidate.experiences?.map((exp: any, i: number) => `
${i + 1}. ${exp.title} en ${exp.company} (${exp.startDate} - ${exp.endDate || 'Presente'})
   Ubicación: ${exp.location}
   Descripción: ${exp.description}
   Duración: ${calculateDuration(exp.startDate, exp.endDate)}
`).join('\n') || 'Sin experiencia registrada'}

EDUCACIÓN:
${candidate.education?.map((edu: any, i: number) => `
${i + 1}. ${edu.degree} en ${edu.fieldOfStudy}
   Institución: ${edu.school}
   Periodo: ${edu.startDate} - ${edu.endDate}
`).join('\n') || 'Sin educación registrada'}

SKILLS DECLARADOS:
${candidate.skills?.map((s: any) => `- ${s.name} (${s.level || 'No especificado'})`).join('\n') || 'Sin skills'}

CERTIFICACIONES:
${candidate.certifications?.map((c: any) => `- ${c.name} (${c.issuedBy}, ${c.year})`).join('\n') || 'Sin certificaciones'}

IDIOMAS:
${candidate.languages?.map((l: any) => `- ${l.name}: ${l.proficiency}`).join('\n') || 'No especificados'}

EXPECTATIVA SALARIAL: ${candidate.expectedSalary || 'No especificada'} ${candidate.currency || ''}
DISPONIBILIDAD: ${candidate.availability || 'No especificada'}

═══════════════════════════════════════════════════════
📊 INSTRUCCIONES DE EVALUACIÓN
═══════════════════════════════════════════════════════

Evalúa al candidato en cada dimensión con escala 0-10 usando estos criterios:

**1. SKILLS MATCH (30% peso)**
- ¿Tiene todos los skills técnicos obligatorios?
- ¿Qué nivel de dominio demuestra en cada skill?
- ¿Cuántos skills deseables posee?
- ¿Hay certificaciones que validen sus skills?

Score: [0-10]
Justificación: [Explicación detallada]

**2. EXPERIENCE LEVEL (25% peso)**
- ¿Cumple con años de experiencia requeridos?
- ¿Ha trabajado en roles similares?
- ¿Experiencia en la misma industria?
- ¿Muestra progresión de carrera ascendente?

Score: [0-10]
Justificación: [Explicación detallada]

**3. EDUCATION MATCH (15% peso)**
- ¿Cumple requisito educativo mínimo?
- ¿Relevancia del campo de estudio?
- ¿Educación continua/certificaciones adicionales?

Score: [0-10]
Justificación: [Explicación detallada]

**4. CULTURAL FIT (10% peso)**
- ¿Alineación con valores de la empresa?
- ¿Compatibilidad de modalidad trabajo (remoto/presencial)?
- ¿Experiencia en tipo de empresa similar (startup/corporativo)?

Score: [0-10]
Justificación: [Explicación detallada]

**5. SALARY ALIGNMENT (8% peso)**
- ¿Expectativa dentro del rango ofrecido?
- ¿Qué tan negociable es la diferencia?

Score: [0-10]
Justificación: [Explicación detallada]

**6. LOCATION & AVAILABILITY (5% peso)**
- ¿Ubicación compatible?
- ¿Disponibilidad de inicio alineada?

Score: [0-10]
Justificación: [Explicación detallada]

**7. CAREER GROWTH (4% peso)**
- ¿Trayectoria de crecimiento positiva?
- ¿Estabilidad laboral adecuada?
- ¿Iniciativa de aprendizaje continuo?

Score: [0-10]
Justificación: [Explicación detallada]

**8. COMMUNICATION (3% peso)**
- ¿Calidad de expresión escrita?
- ¿Profesionalismo en presentación?

Score: [0-10]
Justificación: [Explicación detallada]

═══════════════════════════════════════════════════════
✅ RESPONDE EN FORMATO JSON ESTRICTO
═══════════════════════════════════════════════════════

{
  "scores": {
    "skillsMatch": {
      "score": 8.5,
      "justification": "...",
      "missingSkills": ["AWS"],
      "strongSkills": ["Python", "SQL"]
    },
    // ... all other fields ...
  },
  "overallScore": 82,
  "breakdown": {
    "skillsMatch": 25.5,
    // ...
  },
  "recommendation": "hire/consider/reject",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "suggestions": ["...", "..."],
  "hiringProbability": 75,
  "summary": "..."
}
`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "qwen/qwen3-next-80b-a3b-instruct:free",
                "messages": [
                    { "role": "system", "content": "Eres un asistente de reclutamiento experto. Responde siempre en JSON válido." },
                    { "role": "user", "content": SCORING_PROMPT }
                ],
                "temperature": 0.2, // Low temp for consistent JSON
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const aiContent = data.choices[0].message.content;

        // Parse JSON safely
        let parsedResult;
        try {
            parsedResult = JSON.parse(aiContent);
        } catch (e) {
            console.error("Error parsing AI JSON:", e);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: aiContent }, { status: 500 });
        }

        // Add calculated color code
        const score = parsedResult.overallScore || 0;
        let colorCode = "red";
        if (score > 80) colorCode = "green";
        else if (score > 60) colorCode = "yellow";
        else if (score > 40) colorCode = "orange";

        parsedResult.colorCode = colorCode;

        return NextResponse.json(parsedResult);

    } catch (error: any) {
        console.error("AI Scoring Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
