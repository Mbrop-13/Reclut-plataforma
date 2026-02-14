import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

const openRouterKey = defineSecret("OPENROUTER_API_KEY");

// Hardcoded context for now, ideally this comes from Firestore
const MOCK_CONTEXT = `
- Analista de Datos at TechCorp LATAM (Ciudad de México): MXN 80000-120000
- Full Stack Developer at Fintech Innovators (Remoto): MXN 90000-140000
- UX/UI Designer at Design Studio MX (Guadalajara): MXN 50000-70000
- Product Manager at AI Labs Colombia (Bogotá): USD 4000-6000
`;

export const evaluateJobPosting = functions.runWith({ secrets: [openRouterKey] }).https.onCall(async (data, context) => {
    // Ensure the user is authenticated
    //   if (!context.auth) {
    //     throw new functions.https.HttpsError(
    //       "unauthenticated",
    //       "The function must be called while authenticated."
    //     );
    //   }

    const { title, description, requirements, salaryMin, salaryMax, currency, location } = data;

    const apiKey = openRouterKey.value();

    if (!apiKey) {
        console.warn("OpenRouter API Key missing in secrets");
        return {
            score: 70,
            salaryAnalysis: "Configuration Error - Running in Mock Mode",
            demandLevel: "Unknown",
            suggestions: ["Configure OpenRouter API Key in Firebase Secrets"]
        };
    }

    const systemPrompt = `You are an expert HR and Recruitment Consultant AI. Your task is to evaluate a job posting draft and compare it with similar market offerings.

Context - Similar Jobs in Data:
${MOCK_CONTEXT}

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

    try {
        // Dynamic import or fetch
        const fetch = (await import("node-fetch")).default;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://reclut.ai",
                "X-Title": "Reclut AI",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "qwen/qwen-2.5-72b-instruct",
                messages: [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API Error: ${response.statusText}`);
        }

        const responseData: any = await response.json();
        const aiContent = responseData.choices[0].message.content;

        return JSON.parse(aiContent);

    } catch (error) {
        console.error("AI Evaluation Error:", error);
        throw new functions.https.HttpsError("internal", "Failed to evaluate job posting.");
    }
});
