import { GoogleGenAI, Type } from "@google/genai";
import { CVProfile, CVType, JobCriteria } from "../types";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateCVs = async (criteria: JobCriteria): Promise<CVProfile[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Dynamic instruction based on user preferences
  const sectionInstruction = `
    Include the following optional sections:
    ${criteria.includeSummary ? "- Professional Summary (Must be engaging)" : "- Do NOT include a summary."}
    ${criteria.includeHobbies ? "- Hobbies/Interests" : "- Do NOT include hobbies."}
  `;

  const toneInstruction = `The tone of the writing should be: ${criteria.tone}.`;

  const prompt = `
    You are an expert HR simulator. Based on the following job requirements, generate 3 distinct CV profiles.
    
    Job Title: ${criteria.jobTitle}
    Context: ${criteria.context}
    Required Experience: ${criteria.yearsExperience} years.
    
    CRITICAL INSTRUCTIONS FOR IDENTITY VS LANGUAGE:
    1. Cultural Identity: The profiles must originate from the region: **${criteria.region}**. Use realistic names, university names, and location data that strongly reflect this region.
    2. Output Language: The CV content (summary, skills, descriptions, role titles) MUST be written in **${criteria.language}**.
    
    ${toneInstruction}
    ${sectionInstruction}

    1. Profile 1 (Best Fit): Perfectly matches skills, experience, and tone. High performer.
    2. Profile 2 (Random/Average Fit): Has some relevant skills but maybe different industry background or slightly under/over qualified.
    3. Profile 3 (Bad Fit but Charismatic): Clearly lacks the technical hard skills or specific experience, but the description shows they are a "nice guy", resourceful, funny, or very soft-skill oriented (the "social butterfly" who tries hard).

    Ensure the data is realistic.
  `;

  // Schema definition for structured output
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      // Enable Thinking Mode for deeper reasoning on "Best Fit" vs "Bad Fit" nuances
      thinkingConfig: {
        thinkingBudget: 2048
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            typeLabel: { type: Type.STRING, enum: ["BEST_FIT", "RANDOM_FIT", "BAD_FIT"] },
            fullName: { type: Type.STRING },
            title: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            hobbies: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    }
  });

  const rawData = JSON.parse(response.text || "[]");

  // Map raw data to our internal types
  return rawData.map((profile: any) => {
    let cvType = CVType.RANDOM_FIT;
    if (profile.typeLabel === "BEST_FIT") cvType = CVType.BEST_FIT;
    if (profile.typeLabel === "BAD_FIT") cvType = CVType.BAD_FIT_CHARMING;

    return {
      id: generateId(),
      type: cvType,
      fullName: profile.fullName,
      title: profile.title,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      summary: profile.summary || "",
      skills: profile.skills,
      hobbies: profile.hobbies || [],
      experience: profile.experience,
      education: profile.education,
      generatedAt: Date.now(),
      tone: criteria.tone
    } as CVProfile;
  });
};