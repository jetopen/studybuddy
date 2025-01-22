"use client"

import { useEffect, useState } from "react"
import { getCurrentUser, getUserRole, signOut, calculateGradeLevel } from "../../../utils/supabase"
import {
  getSubjectsForGrade,
  getLessonsForSubject,
  getProgressForUser,
  updateProgress,
  type Subject,
  type Lesson,
  type Progress,
} from "../../../utils/subjectsData"
import { getAIGeneratedContentForSubject, type AIGeneratedContent } from "../../../utils/lessonContent"
import { ProgressBar } from "../../components/ProgressBar"
import { BookOpen, Video, MessageSquare, User, Search, Menu, CheckCircle, Clock, Circle, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"
import { SpacedRepetitionPractice } from "../../../components/SpacedRepetitionPractice"
import { GeneratedContent } from "../../../components/GeneratedContent"
import { LocaleSelector } from "../../../components/LocaleSelector"

const getGradeLevelDisplay = (gradeLevel: number): string => {
  if (gradeLevel === 0) return "Preschool"
  if (gradeLevel === 1) return "Kindergarten"
  return `Grade ${gradeLevel - 1}`
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<any>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lessons, setLessons] = useState<{ [key: string]: Lesson[] }>({})
  const [progress, setProgress] = useState<{ [key: string]: Progress }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [aiGeneratedContent, setAIGeneratedContent] = useState<{ [key: string]: AIGeneratedContent[] }>({})
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

        const gradeLevel = calculateGradeLevel(currentUser.age)
        setUserRole({ ...userRoleData, grade_level: gradeLevel })

        if (userRoleData.role === "student") {
          const fetchedSubjects = await getSubjectsForGrade(gradeLevel)
          setSubjects(fetchedSubjects)

          const lessonsPromises = fetchedSubjects.map((subject) =>
            getLessonsForSubject(subject.id).then((subjectLessons) => ({ [subject.id]: subjectLessons })),
          )
          const lessonsResults = await Promise.all(lessonsPromises)
          setLessons(Object.assign({}, ...lessonsResults))

          const userProgress = await getProgressForUser(currentUser.id)
          const progressMap = userProgress.reduce(
            (acc, curr) => {
              acc[curr.lesson_id] = curr
              return acc
            },
            {} as { [key: string]: Progress },
          )
          setProgress(progressMap)

          // Fetch AI-generated content for each subject
          const aiContentPromises = fetchedSubjects.map((subject) =>
            getAIGeneratedContentForSubject(subject.id).then((content) => ({ [subject.id]: content })),
          )
          const aiContentResults = await Promise.all(aiContentPromises)
          setAIGeneratedContent(Object.assign({}, ...aiContentResults))
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

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    // TODO: Implement language change logic
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    // TODO: Implement country change logic
  }

  const getProgressStatus = (lessonId: string) => {
    const lessonProgress = progress[lessonId]
    if (!lessonProgress) return "not_started"
    return lessonProgress.status
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500"
      case "in_progress":
        return "text-yellow-500"
      default:
        return "text-gray-400"
    }
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
              <h1 className="text-xl font-semibold text-gray-900">
                Student Dashboard - {getGradeLevelDisplay(userRole.grade_level)}
              </h1>
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
                onClick={() => router.push("/student/edit-profile")}
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
                              onClick={() => router.push(`/student/lesson/${lesson.id}`)}
                            >
                              {lesson.title}
                            </Button>
                            <div className="flex items-center space-x-1">
                              {(() => {
                                const status = getProgressStatus(lesson.id)
                                switch (status) {
                                  case "completed":
                                    return (
                                      <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-xs text-green-500">Completed</span>
                                      </>
                                    )
                                  case "in_progress":
                                    return (
                                      <>
                                        <Clock className="h-4 w-4 text-yellow-500" />
                                        <span className="text-xs text-yellow-500">In Progress</span>
                                      </>
                                    )
                                  default:
                                    return (
                                      <>
                                        <Circle className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs text-gray-400">Not Started</span>
                                      </>
                                    )
                                }
                              })()}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {aiGeneratedContent[subject.id] && aiGeneratedContent[subject.id].length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-md font-semibold mb-2 flex items-center">
                            <Brain className="mr-2 h-4 w-4" />
                            AI-Generated Content
                          </h3>
                          <Accordion type="single" collapsible className="w-full">
                            {aiGeneratedContent[subject.id].map((content) => (
                              <AccordionItem value={content.id} key={content.id}>
                                <AccordionTrigger>
                                  {content.type === "quiz" ? "Quiz" : "Flashcards"} - {content.created_at}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <GeneratedContent content={content.content} type={content.type} />
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
          <section className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                <Video className="mr-2" />
                Live Sessions
              </h2>
              <p className="text-gray-600">No upcoming live sessions.</p>
            </div>
          </section>
          <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
                <MessageSquare className="mr-2" />
                Discussion Forums
              </h2>
              <p className="text-gray-600">No active discussions.</p>
            </div>
          </section>
        </div>
        <section className="bg-white shadow-md rounded-lg overflow-hidden md:col-span-2 lg:col-span-3">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-indigo-600">
              <BookOpen className="mr-2" />
              Spaced Repetition Practice
            </h2>
            {subjects.map((subject) => (
              <Accordion type="single" collapsible key={subject.id}>
                <AccordionItem value={subject.id}>
                  <AccordionTrigger>{subject.name}</AccordionTrigger>
                  <AccordionContent>
                    {lessons[subject.id]?.map((lesson) => (
                      <div key={lesson.id} className="mt-4">
                        <h3 className="text-md font-semibold mb-2">{lesson.title}</h3>
                        <SpacedRepetitionPractice lessonId={lesson.id} userId={user.id} />
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-white shadow-md mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2023 Virtual Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

