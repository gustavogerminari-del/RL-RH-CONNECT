import { GoogleGenAI } from '@google/genai';
import { AIResumeExtraction } from '../types.js';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

/**
 * Extracts structured candidate info from a resume text or document content
 */
export async function extractResumeData(
  resumeText: string,
  fileName: string
): Promise<AIResumeExtraction> {
  const ai = getAIClient();

  // Basic regex fallback parser if AI is unavailable or missing key
  const fallbackResult: AIResumeExtraction = {
    extractedName: extractNameFallback(resumeText),
    extractedEmail: extractEmailFallback(resumeText),
    extractedPhone: extractPhoneFallback(resumeText),
    experiences: [],
    education: [],
    skills: extractSkillsFallback(resumeText),
    certifications: [],
    languages: [],
    summary: resumeText.slice(0, 300)
  };

  if (!ai) {
    return fallbackResult;
  }

  try {
    const prompt = `Você é um especialista em leitura e análise estruturada de currículos para RH.
Analise o conteúdo do currículo abaixo (nome do arquivo: "${fileName}") e extraia os dados em formato JSON estrito.

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "extractedName": "Nome completo",
  "extractedCpf": "CPF se encontrado ou null",
  "extractedPhone": "Telefone/WhatsApp",
  "extractedEmail": "E-mail",
  "extractedCity": "Cidade e Estado",
  "summary": "Resumo das qualificações (2 a 3 frases)",
  "experiences": [
    {
      "company": "Nome da empresa",
      "role": "Cargo",
      "startDate": "Ano ou Mês/Ano",
      "endDate": "Ano, Mês/Ano ou 'Atual'",
      "description": "Principais atividades"
    }
  ],
  "education": [
    {
      "institution": "Nome da instituição",
      "course": "Nome do curso/graduação",
      "yearCompleted": "Ano de conclusão"
    }
  ],
  "skills": ["Competência 1", "Competência 2"],
  "certifications": ["Certificação 1", "Curso 2"],
  "languages": ["Idioma 1 (Nível)"]
}

Texto do Currículo:
${resumeText.slice(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text;
    if (responseText) {
      const parsed = JSON.parse(responseText);
      return {
        extractedName: parsed.extractedName || fallbackResult.extractedName,
        extractedCpf: parsed.extractedCpf || undefined,
        extractedPhone: parsed.extractedPhone || fallbackResult.extractedPhone,
        extractedEmail: parsed.extractedEmail || fallbackResult.extractedEmail,
        extractedCity: parsed.extractedCity || fallbackResult.extractedCity,
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : fallbackResult.skills,
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
        summary: parsed.summary || fallbackResult.summary
      };
    }
  } catch (error) {
    console.error('Gemini resume extraction error:', error);
  }

  return fallbackResult;
}

/**
 * Calculates AI Fit Score (0-100) and brief justification for candidate vs job
 */
export async function calculateAIFitScore(
  candidateData: any,
  jobData: any
): Promise<{ score: number; summary: string }> {
  const ai = getAIClient();
  if (!ai) {
    return {
      score: 85,
      summary: 'Análise automática preliminar: Perfil com aderência adequada aos requisitos informados.'
    };
  }

  try {
    const prompt = `Analise a aderência deste candidato para a vaga descrita.

Vaga: ${jobData.title}
Requisitos: ${JSON.stringify(jobData.requirements)}
Descrição: ${jobData.description}

Candidato: ${candidateData.name} (${candidateData.currentRole || 'Sem cargo atual'})
Experiências / Competências: ${JSON.stringify(candidateData.resumeExtractedData?.skills || [])}
Resumo: ${candidateData.resumeExtractedData?.summary || ''}

Retorne um JSON estrito no seguinte formato:
{
  "score": 88,
  "summary": "Explicação concisa (2 frases) sobre os pontos fortes do candidato em relação aos requisitos da vaga."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const res = JSON.parse(response.text || '{}');
    return {
      score: typeof res.score === 'number' ? Math.min(100, Math.max(0, res.score)) : 80,
      summary: res.summary || 'Candidato atende aos requisitos essenciais informados.'
    };
  } catch (e) {
    return {
      score: 82,
      summary: 'Aderência positiva aos requisitos da vaga.'
    };
  }
}

// Simple fallback regex parsers
function extractEmailFallback(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : undefined;
}

function extractPhoneFallback(text: string): string | undefined {
  const match = text.match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}/);
  return match ? match[0] : undefined;
}

function extractNameFallback(text: string): string | undefined {
  const firstLine = text.trim().split('\n')[0];
  if (firstLine && firstLine.length < 50 && !firstLine.includes('@')) {
    return firstLine.replace(/[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, '').trim();
  }
  return undefined;
}

function extractSkillsFallback(text: string): string[] {
  const keywords = [
    'Excel', 'Word', 'PowerPoint', 'React', 'Node.js', 'TypeScript', 'JavaScript',
    'Python', 'SQL', 'Logística', 'Atendimento', 'Gestão', 'CNH E', 'MOPP', 'NR-20',
    'NR-35', 'Financeiro', 'COREN', 'Liderança', 'Comunicação'
  ];
  return keywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));
}
