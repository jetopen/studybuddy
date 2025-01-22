import { supabase } from "./supabase"
import { addDays } from "date-fns"

export interface Lesson {
  id: string
  title: string
  subject_id: string
  teacher_id: string
}

export interface Subject {
  id: string
  name: string
  suitable_grades: number[]
  teacher_id: string
}

export interface Progress {
  id: string
  user_id: string
  lesson_id: string
  status: "not_started" | "in_progress" | "completed"
  last_updated: string
}

export async function getAllSubjects(): Promise<Subject[]> {
  console.log("Fetching all subjects")
  const { data, error } = await supabase.from("subjects").select("*")

  if (error) {
    console.error("Error fetching subjects:", error)
    throw error
  }

  console.log("Fetched subjects:", data)
  return data || []
}

export async function getSubjectsForGrade(gradeLevel: number): Promise<Subject[]> {
  const { data, error } = await supabase.from("subjects").select("*").contains("suitable_grades", [gradeLevel])

  if (error) {
    console.error("Error fetching subjects:", error)
    throw error
  }

  return data || []
}

export async function getLessonsForSubject(subjectId: string): Promise<Lesson[]> {
  console.log("Fetching lessons for subject:", subjectId)
  const { data, error } = await supabase.from("lessons").select("*").eq("subject_id", subjectId)

  if (error) {
    console.error("Error fetching lessons:", error)
    throw error
  }

  console.log("Fetched lessons:", data)
  return data || []
}

export async function getSubjectsForTeacher(teacherId: string): Promise<Subject[]> {
  console.log("Fetching subjects for teacher:", teacherId)
  const { data, error } = await supabase.from("subjects").select("*").eq("teacher_id", teacherId)

  if (error) {
    console.error("Error fetching subjects for teacher:", error)
    throw error
  }

  console.log("Fetched subjects for teacher:", data)
  return data || []
}

export async function createSubject(name: string, suitableGrades: number[], teacherId: string): Promise<Subject> {
  const { data, error } = await supabase
    .from("subjects")
    .insert({ name, suitable_grades: suitableGrades, teacher_id: teacherId })
    .select()
    .single()

  if (error) {
    console.error("Error creating subject:", error)
    throw error
  }

  return data
}

export async function createLesson(title: string, subjectId: string, teacherId: string): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({ title, subject_id: subjectId, teacher_id: teacherId })
    .select()
    .single()

  if (error) {
    console.error("Error creating lesson:", error)
    throw error
  }

  return data
}

export async function updateProgress(
  userId: string,
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
): Promise<Progress> {
  const { data, error } = await supabase
    .from("progress")
    .upsert(
      { user_id: userId, lesson_id: lessonId, status, last_updated: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" },
    )
    .select()
    .single()

  if (error) {
    console.error("Error updating progress:", error)
    throw error
  }

  return data
}

export async function getProgressForUser(userId: string): Promise<Progress[]> {
  const { data, error } = await supabase.from("progress").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching progress:", error)
    throw error
  }

  return data || []
}

export interface SpacedRepetitionItem {
  id: string
  lesson_id: string
  question: string
  answer: string
}

export interface SpacedRepetitionProgress {
  id: string
  user_id: string
  item_id: string
  ease_factor: number
  interval: number
  next_review: string
}

export async function createSpacedRepetitionItem(
  lessonId: string,
  question: string,
  answer: string,
): Promise<SpacedRepetitionItem> {
  const { data, error } = await supabase
    .from("spaced_repetition_items")
    .insert({ lesson_id: lessonId, question, answer })
    .select()
    .single()

  if (error) {
    console.error("Error creating spaced repetition item:", error)
    throw error
  }

  return data
}

export async function getSpacedRepetitionItemsForLesson(lessonId: string): Promise<SpacedRepetitionItem[]> {
  const { data, error } = await supabase.from("spaced_repetition_items").select("*").eq("lesson_id", lessonId)

  if (error) {
    console.error("Error fetching spaced repetition items:", error)
    throw error
  }

  return data || []
}

export async function getSpacedRepetitionProgressForUser(userId: string): Promise<SpacedRepetitionProgress[]> {
  const { data, error } = await supabase.from("spaced_repetition_progress").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching spaced repetition progress:", error)
    throw error
  }

  return data || []
}

export async function updateSpacedRepetitionProgress(
  userId: string,
  itemId: string,
  easeFactor: number,
  interval: number,
): Promise<SpacedRepetitionProgress> {
  const nextReview = addDays(new Date(), interval)

  const { data, error } = await supabase
    .from("spaced_repetition_progress")
    .upsert({
      user_id: userId,
      item_id: itemId,
      ease_factor: easeFactor,
      interval: interval,
      next_review: nextReview.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating spaced repetition progress:", error)
    throw error
  }

  return data
}

