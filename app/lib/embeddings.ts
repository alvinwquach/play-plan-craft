"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for text using OpenAI's text-embedding-3-small model
 * @param text - The text to embed
 * @returns Vector embedding (1536 dimensions)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Create a searchable summary from lesson plan data
 * @param data - Lesson plan fields to summarize
 * @returns Concatenated string for embedding
 */
export async function createLessonSummary(data: {
  title: string;
  subject: string;
  gradeLevel: string;
  learningIntention?: string;
  successCriteria?: string[];
  theme?: string | null;
}): Promise<string> {
  const parts = [
    data.title,
    data.subject.toLowerCase().replace(/_/g, " "),
    data.gradeLevel.toLowerCase().replace(/_/g, " "),
    data.learningIntention || "",
    data.theme ? data.theme.toLowerCase().replace(/_/g, " ") : "",
    ...(data.successCriteria || []),
  ];

  return parts.filter(Boolean).join(" ");
}
