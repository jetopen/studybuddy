"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signUp, calculateGradeLevel } from "../../utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export default function SignUp() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [age, setAge] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await signUp(username, password, fullName, Number(age), role)
      localStorage.setItem("user", JSON.stringify(user))
      toast({
        title: "Account created",
        description: "You've successfully signed up!",
      })
      router.push(role === "student" ? "/student/home" : "/teacher/home")
    } catch (error) {
      console.error("Error signing up:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem creating your account.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
            {role === "student" && age && (
              <p className="mt-1 text-sm text-gray-600">
                Grade Level:{" "}
                {calculateGradeLevel(Number(age)) === 0
                  ? "Preschool"
                  : calculateGradeLevel(Number(age)) === 1
                    ? "Kindergarten"
                    : `Grade ${calculateGradeLevel(Number(age)) - 1}`}
              </p>
            )}
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup defaultValue="student" onValueChange={(value) => setRole(value as "student" | "teacher")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher">Teacher</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
}

