"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserInfo, saveUserInfo, type UserInfo } from "../../../utils/userStorage"
import { ProgressBar } from "../../components/ProgressBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera } from "lucide-react"
import Image from "next/image"

const calculateGradeLevel = (age: number): number => {
  if (age < 4) return 0 // Preschool
  if (age === 4) return 1 // Kindergarten
  if (age >= 17) return 13 // 12th grade or higher
  return age - 4 // 1st grade starts at age 5
}

export default function EditProfile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const router = useRouter()

  useEffect(() => {
    const info = getUserInfo()
    setUserInfo(info)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (userInfo) {
      saveUserInfo(userInfo)
      router.push("/student/home")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && userInfo) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserInfo({ ...userInfo, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!userInfo) return <div>Loading...</div>

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ProgressBar progress={100} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/student/home")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Image
                    src={userInfo.profilePicture || "/placeholder.svg"}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                  </label>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={userInfo.age}
                  onChange={(e) => {
                    const newAge = Number(e.target.value)
                    const newGradeLevel = calculateGradeLevel(newAge)
                    setUserInfo({ ...userInfo, age: newAge, gradeLevel: newGradeLevel })
                  }}
                  required
                />
                <p className="text-sm text-gray-600">
                  Grade Level:{" "}
                  {calculateGradeLevel(userInfo.age) === 0
                    ? "Preschool"
                    : calculateGradeLevel(userInfo.age) === 1
                      ? "Kindergarten"
                      : `Grade ${calculateGradeLevel(userInfo.age) - 1}`}
                </p>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

