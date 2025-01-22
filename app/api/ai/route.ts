import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the environment variables")
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY is not configured",
        metadata: { success: false },
      },
      { status: 500 },
    )
  }

  const { prompt, type } = await req.json()

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to find and validate JSON in the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in response")
    }

    // Verify the matched content is valid JSON
    try {
      JSON.parse(jsonMatch[0])
    } catch (e) {
      throw new Error("Response contains invalid JSON")
    }

    return NextResponse.json({
      result: jsonMatch[0],
      metadata: {
        success: true,
      },
    })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate content",
        metadata: { success: false },
      },
      { status: 500 },
    )
  }
}

