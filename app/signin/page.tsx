"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "../../utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function SignIn() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      console.log("Attempting to sign in with username:", username)
      const user = await signIn(username, password)
      console.log("Sign in successful, user data:", user)
      localStorage.setItem("user", JSON.stringify(user))
      toast({
        title: "Signed in",
        description: "You've successfully signed in!",
      })
      console.log("Redirecting to:", user.role === "student" ? "/student/home" : "/teacher/home")
      router.push(user.role === "student" ? "/student/home" : "/teacher/home")
    } catch (error) {
      console.error("Error during sign in:", error)
      let errorMessage = "There was a problem signing in. Please check your credentials and try again."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String(error.message)
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        <form onSubmit={handleSignIn} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}

