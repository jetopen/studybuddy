import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createSpacedRepetitionItem } from "../utils/subjectsData"

interface CreateSpacedRepetitionItemProps {
  lessonId: string
  onItemCreated: () => void
}

export function CreateSpacedRepetitionItem({ lessonId, onItemCreated }: CreateSpacedRepetitionItemProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSpacedRepetitionItem(lessonId, question, answer)
      setQuestion("")
      setAnswer("")
      onItemCreated()
      toast({
        title: "Success",
        description: "Spaced repetition item created successfully.",
      })
    } catch (error) {
      console.error("Error creating spaced repetition item:", error)
      toast({
        title: "Error",
        description: "Failed to create spaced repetition item.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="question">Question</Label>
        <Input id="question" value={question} onChange={(e) => setQuestion(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="answer">Answer</Label>
        <Textarea id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      </div>
      <Button type="submit">Create Item</Button>
    </form>
  )
}

