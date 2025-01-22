import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  getSpacedRepetitionItemsForLesson,
  getSpacedRepetitionProgressForUser,
  updateSpacedRepetitionProgress,
  type SpacedRepetitionItem,
  type SpacedRepetitionProgress,
} from "../utils/subjectsData"

interface SpacedRepetitionPracticeProps {
  lessonId: string
  userId: string
}

export function SpacedRepetitionPractice({ lessonId, userId }: SpacedRepetitionPracticeProps) {
  const [items, setItems] = useState<SpacedRepetitionItem[]>([])
  const [progress, setProgress] = useState<SpacedRepetitionProgress[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedItems, fetchedProgress] = await Promise.all([
          getSpacedRepetitionItemsForLesson(lessonId),
          getSpacedRepetitionProgressForUser(userId),
        ])
        setItems(fetchedItems)
        setProgress(fetchedProgress)
      } catch (error) {
        console.error("Error fetching spaced repetition data:", error)
        toast({
          title: "Error",
          description: "Failed to load spaced repetition items.",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [lessonId, userId])

  const handleResponse = async (quality: number) => {
    const currentItem = items[currentItemIndex]
    const currentProgress = progress.find((p) => p.item_id === currentItem.id) || {
      user_id: userId,
      item_id: currentItem.id,
      ease_factor: 2.5,
      interval: 0,
    }

    const newEaseFactor = Math.max(
      1.3,
      currentProgress.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    )
    const newInterval = quality < 3 ? 1 : Math.round(currentProgress.interval * currentProgress.ease_factor)

    try {
      await updateSpacedRepetitionProgress(userId, currentItem.id, newEaseFactor, newInterval)
      setShowAnswer(false)
      setCurrentItemIndex((currentItemIndex + 1) % items.length)
    } catch (error) {
      console.error("Error updating spaced repetition progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress.",
        variant: "destructive",
      })
    }
  }

  if (items.length === 0) {
    return <p>No spaced repetition items available for this lesson.</p>
  }

  const currentItem = items[currentItemIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spaced Repetition Practice</CardTitle>
        <CardDescription>Review and reinforce your knowledge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="font-semibold">{currentItem.question}</p>
          {showAnswer ? (
            <>
              <p>{currentItem.answer}</p>
              <div className="flex justify-between">
                <Button onClick={() => handleResponse(0)}>Again</Button>
                <Button onClick={() => handleResponse(3)}>Good</Button>
                <Button onClick={() => handleResponse(5)}>Easy</Button>
              </div>
            </>
          ) : (
            <Button onClick={() => setShowAnswer(true)}>Show Answer</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

