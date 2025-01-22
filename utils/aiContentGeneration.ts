import { GoogleGenerativeAI } from "@google/generative-ai"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface Flashcard {
  question: string
  answer: string
}

interface AIMetadata {
  success: boolean
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generateAIContent(
  subjectName: string,
  lessonTitle: string,
  lessonContent: string,
  type: "quiz" | "flashcards",
  count: number,
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables")
  }
  const prompt = getPrompt(subjectName, lessonTitle, lessonContent, type, count)

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON array found in response")
    }

    // Attempt to parse the matched JSON
    const parsedContent = JSON.parse(jsonMatch[0])

    // Validate the structure
    if (!Array.isArray(parsedContent)) {
      throw new Error("Generated content is not an array")
    }

    // Validate each item in the array
    if (type === "quiz") {
      validateQuizContent(parsedContent)
    } else {
      validateFlashcardContent(parsedContent)
    }

    return JSON.stringify(parsedContent)
  } catch (error) {
    console.error("Error generating content:", error)
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function validateQuizContent(content: any[]): asserts content is QuizQuestion[] {
  for (const item of content) {
    if (!item.question || typeof item.question !== "string") {
      throw new Error("Invalid quiz question format: missing or invalid question")
    }
    if (!Array.isArray(item.options) || item.options.length < 2) {
      throw new Error("Invalid quiz options format: must be an array with at least 2 options")
    }
    if (typeof item.correctAnswer !== "number" || item.correctAnswer < 0 || item.correctAnswer >= item.options.length) {
      throw new Error("Invalid correct answer: must be a valid index into options array")
    }
  }
}

function validateFlashcardContent(content: any[]): asserts content is Flashcard[] {
  for (const item of content) {
    if (!item.question || typeof item.question !== "string") {
      throw new Error("Invalid flashcard format: missing or invalid question")
    }
    if (!item.answer || typeof item.answer !== "string") {
      throw new Error("Invalid flashcard format: missing or invalid answer")
    }
  }
}

function getPrompt(
  subjectName: string,
  lessonTitle: string,
  lessonContent: string,
  type: "quiz" | "flashcards",
  count: number,
): string {
  const basePrompt = `You are an expert teacher in ${subjectName}. Your task is to generate educational content for the lesson "${lessonTitle}" based on the provided content.
IMPORTANT: You must respond with ONLY a valid JSON array. Do not include any additional text, explanations, or formatting.
The response should be parseable by JSON.parse() directly.

Subject: ${subjectName}
Lesson: ${lessonTitle}
Lesson content:
${lessonContent}

Number of items to generate: ${count}
`

  if (type === "quiz") {
    return `${basePrompt}

Generate multiple-choice questions in this exact JSON format:
[
  {
    "question": "What is the capital of France?",
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "correctAnswer": 0
  }
]

Requirements:
- Generate exactly ${count} questions
- Each question must have exactly 4 options
- correctAnswer must be a valid index (0-3) pointing to the correct option
- Make questions clear and unambiguous
- Include one definitively correct answer
- Make incorrect options plausible but clearly wrong
- Vary the difficulty level
- Focus on key concepts from the lesson`
  } else {
    return `${basePrompt}

Generate flashcards in this exact JSON format:
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris"
  }
]

Requirements:
- Generate exactly ${count} flashcards
- Each flashcard must have both a question and answer
- Keep questions specific and clear
- Keep answers concise
- Include a mix of definitions, concepts, and applications
- Use clear, student-friendly language`
  }
}

export function parseGeneratedContent(content: string, type: "quiz" | "flashcards"): QuizQuestion[] | Flashcard[] {
  try {
    const parsed = JSON.parse(content)

    // Validate the parsed content
    if (type === "quiz") {
      validateQuizContent(parsed)
    } else {
      validateFlashcardContent(parsed)
    }

    return parsed
  } catch (error) {
    console.error("Error parsing generated content:", error)
    throw new Error(`Failed to parse generated content: ${error instanceof Error ? error.message : "Invalid format"}`)
  }
}

