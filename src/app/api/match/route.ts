import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const OutputSchema = z.object({
  // --- Profile Ingestion ---
  profileSummary: z.object({
    careerIntent: z.string().describe('A one-sentence summary of the candidate\'s likely career intent and trajectory based on their resume.'),
    coreDomain: z.string().describe('The primary professional domain (e.g., "Frontend Engineering", "Data Science", "DevOps").'),
    seniorityLevel: z.string().describe('Estimated seniority: Junior, Mid-Level, Senior, Lead, or Principal.'),
    yearsOfExperience: z.number().describe('Estimated total years of professional experience.'),
  }).describe('Deep understanding of the candidate\'s profile, intent, and career context.'),

  // --- Dynamic Matching ---
  fitScore: z.number().describe('JSO Fit Score between 0 and 100.'),
  identifiedSkills: z.array(z.string()).describe('Skills from the JD that the candidate possesses.'),
  missingRequirements: z.array(z.string()).describe('Critical skills/requirements from the JD the candidate is missing.'),

  // --- Gap Analysis ---
  gapAnalysis: z.array(z.object({
    gap: z.string().describe('The specific skill or qualification gap.'),
    severity: z.enum(['Critical', 'Moderate', 'Minor']).describe('How much this gap impacts the candidate\'s fit.'),
    recommendation: z.string().describe('A concrete, actionable suggestion to close this gap (e.g., a specific certification, course, or project).'),
  })).describe('Actionable gap analysis with fix recommendations.'),

  // --- Bidirectional Value ---
  candidateInsight: z.string().describe('A paragraph explaining why this candidate would be a strong hire from the HR/Consultant perspective, highlighting unique value.'),

  // --- Reasoning ---
  reasoning: z.string().describe('A transparent paragraph explaining the Fit Score logic, major overlaps, and gaps.'),
});

const systemPrompt = `You are the JSO Career Intelligence Agent — an advanced AI agent embedded in a recruitment platform. You operate with four core capabilities:

1. PROFILE INGESTION
You don't just "read" a resume. You deeply understand the candidate's career intent, context, trajectory, and domain expertise. From the raw resume text, you infer:
- Their core professional domain
- Estimated seniority level (Junior / Mid-Level / Senior / Lead / Principal)
- Years of experience
- A one-sentence career intent summary

2. GAP ANALYSIS
You identify precisely what the candidate is missing for this specific role. For each gap, you assess its severity (Critical, Moderate, Minor) and provide an immediate, actionable fix — such as a specific certification (e.g., "AWS Solutions Architect Associate"), a technology to learn, or a project to build.

3. DYNAMIC MATCHING
You calculate a "JSO Fit Score" (0-100) based on:
- Skill overlap between the resume and the JD
- Experience level alignment
- Domain relevance
- Career intent alignment with the role
You list all identified matching skills and all missing requirements.

4. BIDIRECTIONAL VALUE
You don't just help the candidate. You also write a short insight paragraph from the HR Consultant's perspective: why this candidate stands out, what unique value they bring, and whether they are worth interviewing despite any gaps.

ETHICAL GUARDRAILS:
- Analyze strictly based on professional qualifications. Never assume age, gender, race, or background.
- Be transparent in your reasoning. Explain exactly why the score was given.
- Never automatically reject a candidate. Empower human decision-making.
- Always provide constructive, actionable feedback.`;

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescriptionText, privacyFirst } = await req.json();

    if (!resumeText || !jobDescriptionText) {
      return new Response(JSON.stringify({ error: 'Resume text and Job Description are both required.' }), { status: 400 });
    }

    let processedResume = resumeText;
    if (privacyFirst) {
      processedResume = `[PII Scrubbed — Names, emails, and phone numbers have been anonymized] ${processedResume}`;
    }

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      headers: {
        'HTTP-Referer': 'https://jso-job-matching-agent.vercel.app',
        'X-Title': 'JSO Career Intelligence Agent',
      },
    });

    const { object } = await generateObject({
      model: openrouter('nvidia/nemotron-3-nano-30b-a3b:free'),
      schema: OutputSchema,
      system: systemPrompt,
      prompt: `Perform a full intelligence analysis on the following candidate and job description.\n\n=== CANDIDATE RESUME ===\n${processedResume}\n\n=== TARGET JOB DESCRIPTION ===\n${jobDescriptionText}`,
    });

    return new Response(JSON.stringify(object), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Agent processing failed. Ensure Ollama is running.' }), { status: 500 });
  }
}
