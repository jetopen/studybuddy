"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, getUserRole, signOut } from "../../../utils/supabase"
import {
  getSubjectsForTeacher,
  getLessonsForSubject,
  createSubject,
  createLesson,
  type Subject,
  type Lesson,
} from "../../../utils/subjectsData"
import { generateAIContent } from "../../../utils/aiContentGeneration"
import { ProgressBar } from "../../components/ProgressBar"
import { BookOpen, Video, Users, User, Search, Menu, CheckCircle, Circle, Clock, Plus, Brain } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { CreateSpacedRepetitionItem } from "../../../components/CreateSpacedRepetitionItem"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GeneratedContent } from "../../../components/GeneratedContent"
import {
  saveAIGeneratedContent,
  getAIGeneratedContentForLesson,
  type AIGeneratedContent,
} from "../../../utils/lessonContent"
import { LocaleSelector } from "../../../components/LocaleSelector"

export default function TeacherDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<{ [key: string]: Lesson[] }>({})
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectGrades, setNewSubjectGrades] = useState<number[]>([])
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [lessonContent, setLessonContent] = useState("")
  const [contentType, setContentType] = useState<"quiz" | "flashcards">("quiz")
  const [contentCount, setContentCount] = useState(5)
  const [generatedContent, setGeneratedContent] = useState("")
  const [aiGeneratedContent, setAIGeneratedContent] = useState<AIGeneratedContent[]>([])
  const [language, setLanguage] = useState("en")
  const [country, setCountry] = useState("US")
  const router = useRouter()

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

        setUser(currentUser)

        const userRoleData = await getUserRole(currentUser.id)
        if (!userRoleData) {
          toast({
            title: "Error",
            description: "Unable to fetch user role.",
            variant: "destructive",
          })
          return
        }

        setUserRole(userRoleData)

        if (userRoleData.role === "teacher") {
          // Fetch subjects specific to this teacher
          const fetchedSubjects = await getSubjectsForTeacher(currentUser.id)
          setSubjects(fetchedSubjects)

          // Fetch lessons for each subject
          const lessonsPromises = fetchedSubjects.map((subject) =>
            getLessonsForSubject(subject.id).then((subjectLessons) => ({ [subject.id]: subjectLessons })),
          )
          const lessonsResults = await Promise.all(lessonsPromises)
          setLessons(Object.assign({}, ...lessonsResults))
        } else {
          toast({
            title: "Error",
            description: "Invalid user role for this dashboard.",
            variant: "destructive",
          })
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading the dashboard.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleCreateSubject = async () => {
    if (user && newSubjectName && newSubjectGrades.length > 0) {
      try {
        const newSubject = await createSubject(newSubjectName, newSubjectGrades, user.id)
        setSubjects((prev) => [...prev, newSubject])
        setNewSubjectName("")
        setNewSubjectGrades([])
        toast({
          title: "Success",
          description: "New subject created successfully.",
        })
      } catch (error) {
        console.error("Error creating subject:", error)
        toast({
          title: "Error",
          description: "Failed to create new subject. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleCreateLesson = async () => {
    if (user && selectedSubject && newLessonTitle) {
      try {
        const newLesson = await createLesson(newLessonTitle, selectedSubject.id, user.id)
        setLessons((prev) => ({
          ...prev,
          [selectedSubject.id]: [...(prev[selectedSubject.id] || []), newLesson],
        }))
        setNewLessonTitle("")
        setSelectedSubject(null)
        toast({
          title: "Success",
          description: "New lesson created successfully.",
        })
      } catch (error) {
        console.error("Error creating lesson:", error)
        toast({
          title: "Error",
          description: "Failed to create new lesson. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleGenerateContent = async () => {
    if (!selectedLesson || !lessonContent) {
      toast({
        title: "Error",
        description: "Please select a lesson and provide lesson content.",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedLessonObj = Object.values(lessons)
        .flat()
        .find((lesson) => lesson.id === selectedLesson)
      if (!selectedLessonObj) {
        throw new Error("Selected lesson not found")
      }

      const selectedSubjectObj = subjects.find((subject) => subject.id === selectedLessonObj.subject_id)
      if (!selectedSubjectObj) {
        throw new Error("Subject for selected lesson not found")
      }

      const content = await generateAIContent(
        selectedSubjectObj.name,
        selectedLessonObj.title,
        lessonContent,
        contentType,
        contentCount,
      )
      if (!content) {
        throw new Error("No content generated")
      }

      const savedContent = await saveAIGeneratedContent(selectedSubjectObj.id, selectedLesson, contentType, content)
      setAIGeneratedContent((prev) => [savedContent, ...prev])
      setGeneratedContent(content)
      toast({
        title: "Success",
        description: `${contentType === "quiz" ? "Quiz" : "Flashcards"} generated and saved successfully.`,
      })
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (selectedLesson) {
      getAIGeneratedContentForLesson(selectedLesson)
        .then((content) => setAIGeneratedContent(content))
        .catch((error) => {
          console.error("Error fetching AI-generated content:", error)
          toast({
            title: "Error",
            description: "Failed to fetch AI-generated content.",
            variant: "destructive",
          })
        })
    }
  }, [selectedLesson])

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // TODO: Implement language change logic
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    // TODO: Implement country change logic
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-xl font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">No user found. Please sign in.</p>
          <Button className="mt-4" onClick={() => router.push("/signin")}>
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ProgressBar progress={100} />
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LocaleSelector onLanguageChange={handleLanguageChange} onCountryChange={handleCountryChange} />
              <div className="relative hidden md:block">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <div
                className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => router.push("/teacher/edit-profile")}
              >
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  signOut()
                  router.push("/")
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-3">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
                <BookOpen className="mr-2" />
                My Subjects and Lessons
              </h2>
              <Accordion type="multiple" className="w-full">
                {subjects.map((subject) => (
                  <AccordionItem value={subject.id} key={subject.id}>
                    <AccordionTrigger className="text-left">
                      <span className="font-medium">{subject.name}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-4">
                        {lessons[subject.id]?.map((lesson) => (
                          <li key={lesson.id} className="text-sm text-gray-600 flex items-center justify-between">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-normal"
                              onClick={() => router.push(`/teacher/lesson/${lesson.id}`)}
                            >
                              {lesson.title}
                            </Button>
                            <div>
                              <Button variant="ghost" size="sm" className="text-gray-400">
                                <Circle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-yellow-500">
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-500">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Plus className="mr-2 h-4 w-4" /> Add Lesson
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="lesson-title" className="text-right">
                                Title
                              </Label>
                              <Input
                                id="lesson-title"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedSubject(subject)
                              handleCreateLesson()
                            }}
                          >
                            Create Lesson
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="grades" className="text-right">
                        Grades
                      </Label>
                      <Input
                        id="grades"
                        value={newSubjectGrades.join(", ")}
                        onChange={(e) => setNewSubjectGrades(e.target.value.split(",").map(Number))}
                        className="col-span-3"
                        placeholder="Enter grades separated by commas"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateSubject}>Create Subject</Button>
                </DialogContent>
              </Dialog>
            </div>
          </section>
          <section className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                <Video className="mr-2" />
                Live Sessions
              </h2>
              <p className="text-gray-600">No upcoming live sessions.</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Schedule Session
              </Button>
            </div>
          </section>
          <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
                <Users className="mr-2" />
                Student Management
              </h2>
              <p className="text-gray-600">No students assigned yet.</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Assign Students
              </Button>
            </div>
          </section>
        </div>
      </main>
      <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-3 mt-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-600">
            <Brain className="mr-2" />
            Generate AI Content
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-select">Select Lesson</Label>
              <Select onValueChange={(value) => setSelectedLesson(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectGroup key={subject.id}>
                      <SelectLabel>{subject.name}</SelectLabel>
                      {lessons[subject.id]?.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson-content">Lesson Content</Label>
              <Textarea
                id="lesson-content"
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Enter the lesson content here..."
                rows={5}
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={(value: "quiz" | "flashcards") => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="content-count">Number of Items</Label>
                <Input
                  id="content-count"
                  type="number"
                  value={contentCount}
                  onChange={(e) => setContentCount(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
            </div>
            <Button onClick={handleGenerateContent}>Generate Content</Button>
          </div>
          {generatedContent && (
            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Generated Content:</h3>
              <GeneratedContent
                content={generatedContent}
                type={contentType}
                onSave={async (content) => {
                  // Content is already saved, so we don't need to do anything here
                  toast({
                    title: "Success",
                    description: "Content is already saved.",
                  })
                }}
              />
            </div>
          )}
          {aiGeneratedContent.length > 0 && (
            <div className="mt-8">
              <h3 className="text-md font-semibold mb-2">Previously Generated Content:</h3>
              <Accordion type="single" collapsible className="w-full">
                {aiGeneratedContent.map((content, index) => (
                  <AccordionItem value={content.id} key={content.id}>
                    <AccordionTrigger>
                      {content.type === "quiz" ? "Quiz" : "Flashcards"} -{" "}
                      {new Date(content.created_at).toLocaleString()}
                    </AccordionTrigger>
                    <AccordionContent>
                      <GeneratedContent content={content.content} type={content.type} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>
      <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-3">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-600">
            <BookOpen className="mr-2" />
            Create Spaced Repetition Items
          </h2>
          {subjects.map((subject) => (
            <Accordion type="single" collapsible key={subject.id}>
              <AccordionItem value={subject.id}>
                <AccordionTrigger>{subject.name}</AccordionTrigger>
                <AccordionContent>
                  {lessons[subject.id]?.map((lesson) => (
                    <div key={lesson.id} className="mt-4">
                      <h3 className="text-md font-semibold mb-2">{lesson.title}</h3>
                      <CreateSpacedRepetitionItem
                        lessonId={lesson.id}
                        onItemCreated={() => {
                          toast({
                            title: "Success",
                            description: "Spaced repetition item created successfully.",
                          })
                        }}
                      />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </section>
      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2023 Virtual Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

