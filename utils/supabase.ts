import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(
  username: string,
  password: string,
  fullName: string,
  age: number,
  role: "student" | "teacher",
) {
  const { data, error } = await supabase
    .from("users")
    .insert({ username, password, full_name: fullName, age, role })
    .select()
    .single()

  if (error) {
    console.error("Error during sign up:", error)
    throw error
  }

  return data
}

export async function signIn(username: string, password: string) {
  console.log("Attempting to sign in with username:", username)
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .eq("password", password)
    .maybeSingle()

  if (error) {
    console.error("Supabase error during sign in:", error)
    throw error
  }

  if (!data) {
    console.log("No user found with the provided credentials")
    throw new Error("Invalid credentials")
  }

  console.log("User found:", data)

  // Set the user cookie
  document.cookie = `user=${JSON.stringify(data)}; path=/; max-age=86400; secure; samesite=strict`

  return data
}

export async function signOut() {
  localStorage.removeItem("user")
  console.log("User signed out")
}

export async function getCurrentUser() {
  const userString = localStorage.getItem("user")
  if (!userString) {
    console.log("No user found in localStorage")
    return null
  }
  const user = JSON.parse(userString)
  console.log("Current user:", user)
  return user
}

export async function getUserRole(userId: string) {
  const { data, error } = await supabase.from("users").select("role, age").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user role:", error)
    throw error
  }

  return data
}

export function calculateGradeLevel(age: number): number {
  if (age < 5) return 0 // Preschool
  if (age === 5) return 1 // Kindergarten
  if (age >= 18) return 13 // 12th grade or higher
  return age - 5 // 1st grade starts at age 6
}

