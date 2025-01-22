"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "../../../../utils/supabase"
import { updateProgress, getLessonsForSubject } from "../../../../utils/subjectsData"
import { getMaterialsForLesson, getQuizzesForLesson, type Material, type Quiz } from "../../../../utils/lessonContent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, CheckCircle, Play } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateProgress as updateProgressSupabase } from "../../../../utils/supabase" // Import the updateProgress function

export default function LessonPage({ params }: { params: { id: string } }) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [user, setUser] = useState(null) // Add user state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser) // Set the user state

        if (!currentUser) {
          toast({
            title: "Error",
            description: "No user found. Please sign in.",
            variant: "destructive",
          })
          router.push("/signin")
          return
        }

        const [fetchedMaterials, fetchedQuizzes] = await Promise.all([
          getMaterialsForLesson(params.id),
          getQuizzesForLesson(params.id),
        ])

        setMaterials(fetchedMaterials)
        setQuizzes(fetchedQuizzes)

        // Update progress when the lesson is viewed
        updateLessonProgress()
      } catch (error) {
        console.error("Error fetching lesson content:", error)
        toast({
          title: "Error",
          description: "Failed to load lesson content.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const updateLessonProgress = async () => {
    if (user && materials.length > 0) {
      try {
        await updateProgress(user.id, params.id, "in_progress")
        toast({
          title: "Progress Updated",
          description: "Your progress has been updated.",
        })
      } catch (error) {
        console.error("Error updating progress:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <BookOpen className="mr-2" /> Learning Materials
          </h2>
          <div className="space-y-4">
            {materials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription>
                    {material.type === "video" && <Play className="inline mr-2" />}
                    {material.type === "document" && <BookOpen className="inline mr-2" />}
                    {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {material.type === "text" && <div className="prose">{material.content}</div>}
                  {material.type === "video" && (
                    <div className="aspect-video">
                      <iframe
                        src={material.content}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {material.type === "document" && (
                    <Button onClick={() => window.open(material.content, "_blank")}>View Document</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <CheckCircle className="mr-2" /> Quizzes
          </h2>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push(`/student/quiz/${quiz.id}`)}>Start Quiz</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

