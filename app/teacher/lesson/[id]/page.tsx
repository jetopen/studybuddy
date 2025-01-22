"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "../../../../utils/supabase"
import {
  getMaterialsForLesson,
  getQuizzesForLesson,
  createMaterial,
  createQuiz,
  type Material,
  type Quiz,
} from "../../../../utils/lessonContent"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, BookOpen, CheckCircle, Play, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function TeacherLessonPage({ params }: { params: { id: string } }) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // New material form states
  const [newMaterialTitle, setNewMaterialTitle] = useState("")
  const [newMaterialContent, setNewMaterialContent] = useState("")
  const [newMaterialType, setNewMaterialType] = useState<"text" | "video" | "document">("text")

  // New quiz form states
  const [newQuizTitle, setNewQuizTitle] = useState("")
  const [newQuizDescription, setNewQuizDescription] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const currentUser = await getCurrentUser()

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

  const handleAddMaterial = async () => {
    try {
      const newMaterial = await createMaterial(
        params.id,
        newMaterialTitle,
        newMaterialContent,
        newMaterialType,
        materials.length,
      )
      setMaterials([...materials, newMaterial])
      setNewMaterialTitle("")
      setNewMaterialContent("")
      setNewMaterialType("text")
      toast({
        title: "Success",
        description: "Material added successfully.",
      })
    } catch (error) {
      console.error("Error adding material:", error)
      toast({
        title: "Error",
        description: "Failed to add material.",
        variant: "destructive",
      })
    }
  }

  const handleAddQuiz = async () => {
    try {
      const newQuiz = await createQuiz(params.id, newQuizTitle, newQuizDescription)
      setQuizzes([...quizzes, newQuiz])
      setNewQuizTitle("")
      setNewQuizDescription("")
      toast({
        title: "Success",
        description: "Quiz added successfully.",
      })
      router.push(`/teacher/quiz/${newQuiz.id}/edit`)
    } catch (error) {
      console.error("Error adding quiz:", error)
      toast({
        title: "Error",
        description: "Failed to add quiz.",
        variant: "destructive",
      })
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <BookOpen className="mr-2" /> Learning Materials
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                  <DialogDescription>Add learning material to this lesson.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select onValueChange={(value: "text" | "video" | "document") => setNewMaterialType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    {newMaterialType === "text" ? (
                      <Textarea
                        id="content"
                        value={newMaterialContent}
                        onChange={(e) => setNewMaterialContent(e.target.value)}
                      />
                    ) : (
                      <Input
                        id="content"
                        value={newMaterialContent}
                        onChange={(e) => setNewMaterialContent(e.target.value)}
                        placeholder={newMaterialType === "video" ? "Video URL" : "Document URL"}
                      />
                    )}
                  </div>
                </div>
                <Button onClick={handleAddMaterial}>Add Material</Button>
              </DialogContent>
            </Dialog>
          </div>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <CheckCircle className="mr-2" /> Quizzes
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Quiz</DialogTitle>
                  <DialogDescription>Create a new quiz for this lesson.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quiz-title">Title</Label>
                    <Input id="quiz-title" value={newQuizTitle} onChange={(e) => setNewQuizTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quiz-description">Description</Label>
                    <Textarea
                      id="quiz-description"
                      value={newQuizDescription}
                      onChange={(e) => setNewQuizDescription(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddQuiz}>Create Quiz</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push(`/teacher/quiz/${quiz.id}/edit`)}>Edit Quiz</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

