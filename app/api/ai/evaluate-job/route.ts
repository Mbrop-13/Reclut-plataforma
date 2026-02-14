import { NextResponse } from 'next/server';
import { EMPLEOS } from '@/lib/mock-data';

export const runtime = 'edge'; // Optional: Use edge runtime for lower latency if compatible

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, requirements, salaryMin, salaryMax, currency, location } = body;

        // 1. Find Similar Jobs Context from "Database" (Mock Data)
        // Simple logic: partial match on title or some tags if we had them in input
        const similarJobs = EMPLEOS.filter(job =>
            job.titulo.toLowerCase().includes(title.toLowerCase()) ||
            job.descripcion.toLowerCase().includes(title.toLowerCase())
        ).slice(0, 3); // Top 3 similar

        const similarJobsContext = similarJobs.map(job =>
            `- ${job.titulo} at ${job.empresa} (${job.ubicacion}): ${job.currency} ${job.salaryMin}-${job.salaryMax}`
        ).join('\n');

        // 2. Construct Prompt
        const systemPrompt = `You are an expert HR and Recruitment Consultant AI. Your task is to evaluate a job posting draft and compare it with similar market offerings.

Context - Similar Jobs in Database:
${similarJobsContext || "No exact matches found in local database."}

Target Audience:
- Role: ${title}
- Location: ${location}
- Salary: ${currency} ${salaryMin} - ${salaryMax}

Analyze the following job description for clarity, attractiveness, and competitiveness.
Return ONLY a JSON object with this structure:
{
  "score": number (0-100),
  "salaryAnalysis": string (short phrase comparison vs market),
  "demandLevel": string ("Low", "Medium", "High", "Very High"),
  "suggestions": string[] (max 3 actionable improvements)
}`;

        const userPrompt = `Job Content:
Description: ${description}
Requirements: ${requirements}`;

        // 3. Call OpenRouter API
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.warn("OPENROUTER_API_KEY is missing. Returning mock response.");
            // Fallback for development/testing without key
            return NextResponse.json({
                score: 75,
                salaryAnalysis: "Market Average (Mock)",
                demandLevel: "Medium (Mock)",
                suggestions: ["Add more perks (Mock)", "Clarify remote policy (Mock)"]
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://reclut.ai", // Required by OpenRouter
                "X-Title": "Reclut AI", // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "qwen/qwen-2.5-72b-instruct", // Using a reliable Qwen model supported by OpenRouter
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", errorText);
            throw new Error(`OpenRouter API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiContent = data.choices[0].message.content;

        // Parse JSON safely
        let parsedResult;
        try {
            parsedResult = JSON.parse(aiContent);
        } catch (e) {
            console.error("Failed to parse AI response JSON", aiContent);
            // Fallback or attempt partial parsing/cleaning
            parsedResult = {
                score: 0,
                salaryAnalysis: "Error parsing analysis",
                demandLevel: "Unknown",
                suggestions: ["Could not generate specific suggestions due to format error."]
            };
        }

        return NextResponse.json(parsedResult);

    } catch (error) {
        console.error("Evaluation Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
