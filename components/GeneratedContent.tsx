import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface Flashcard {
  question: string
  answer: string
}

interface GeneratedContentProps {
  content: string
  type: "quiz" | "flashcards"
  onSave?: (content: QuizQuestion[] | Flashcard[]) => void
}

export function GeneratedContent({ content, type, onSave }: GeneratedContentProps) {
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({})
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})

  try {
    const parsedContent = JSON.parse(content)

    if (type === "quiz") {
      return (
        <div className="space-y-4">
          {parsedContent.map((question: QuizQuestion, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <CardDescription>{question.question}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedAnswers[index]?.toString()}
                  onValueChange={(value) => {
                    setSelectedAnswers({
                      ...selectedAnswers,
                      [index]: Number.parseInt(value),
                    })
                  }}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={optionIndex.toString()} id={`q${index}-o${optionIndex}`} />
                      <Label htmlFor={`q${index}-o${optionIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {showAnswers[index] && (
                  <div className="mt-4 text-green-600">Correct answer: {question.options[question.correctAnswer]}</div>
                )}
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowAnswers({ ...showAnswers, [index]: !showAnswers[index] })}
                >
                  {showAnswers[index] ? "Hide Answer" : "Show Answer"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    } else {
      return (
        <div className="space-y-4">
          {parsedContent.map((flashcard: Flashcard, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">Flashcard {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Question:</h4>
                    <p>{flashcard.question}</p>
                  </div>
                  {showAnswers[index] ? (
                    <div>
                      <h4 className="font-medium">Answer:</h4>
                      <p>{flashcard.answer}</p>
                    </div>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswers({ ...showAnswers, [index]: !showAnswers[index] })}
                  >
                    {showAnswers[index] ? "Hide Answer" : "Show Answer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }
  } catch (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to parse generated content. Please try again.</p>
        </CardContent>
      </Card>
    )
  }
}

