"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Upload, Camera } from "lucide-react"
import Link from "next/link"
import { ProgressBar } from "../components/ProgressBar"
import Image from "next/image"
import { saveUserInfo, type UserInfo } from "../../utils/userStorage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const calculateGradeLevel = (age: number): number => {
  if (age < 4) return 0 // Preschool
  if (age === 4) return 1 // Kindergarten
  if (age >= 17) return 13 // 12th grade or higher
  return age - 4 // 1st grade starts at age 5
}

function UserInfoForm({ role }: { role: "student" | "teacher" }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [gradeLevel, setGradeLevel] = useState<number | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (role === "student" && age) {
      const calculatedGradeLevel = calculateGradeLevel(Number.parseInt(age))
      setGradeLevel(calculatedGradeLevel)
    }
  }, [role, age])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setProfilePicture(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setProfilePicturePreview(null)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const userInfo: UserInfo = {
      name,
      age: Number.parseInt(age),
      role,
      gradeLevel: role === "student" ? gradeLevel : undefined,
      profilePicture: profilePicturePreview || undefined,
    }
    saveUserInfo(userInfo)
    router.push(role === "student" ? "/student/home" : "/teacher/home")
  }

  return (
    <div className="flex flex-col items-center">
      <ProgressBar progress={50} />
      <Link href="/" className="self-start mb-4 flex items-center text-blue-500 hover:text-blue-600">
        <ArrowLeft className="mr-1" size={16} />
        Back to Selection
      </Link>
      <h1 className="text-2xl font-bold mb-6">User Information</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div
            className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4 cursor-pointer relative group"
            onClick={handleImageClick}
          >
            {profilePicturePreview ? (
              <Image
                src={profilePicturePreview || "/placeholder.svg"}
                alt="Profile picture preview"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Upload size={40} />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            aria-label="Upload profile picture"
          />
          <p className="text-sm text-gray-600">Click to upload profile picture</p>
        </div>
        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="age">Age</Label>
          <Input
            type="number"
            id="age"
            value={age}
            onChange={(e) => {
              const newAge = e.target.value
              setAge(newAge)
              if (role === "student") {
                const newGradeLevel = calculateGradeLevel(Number(newAge))
                setGradeLevel(newGradeLevel)
              }
            }}
            required
          />
          {role === "student" && (
            <p className="mt-1 text-sm text-gray-600">
              Grade Level:{" "}
              {gradeLevel === 0
                ? "Preschool"
                : gradeLevel === 1
                  ? "Kindergarten"
                  : gradeLevel !== null
                    ? `Grade ${gradeLevel - 1}`
                    : "N/A"}
            </p>
          )}
        </div>
        {role === "student" && gradeLevel !== null && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">
              Estimated Grade Level:{" "}
              {gradeLevel === 0 ? "Preschool" : gradeLevel === 1 ? "Kindergarten" : `Grade ${gradeLevel - 1}`}
            </p>
          </div>
        )}
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  )
}

function UserInfoWrapper() {
  const searchParams = useSearchParams()
  const role = searchParams.get("role") as "student" | "teacher"

  return <UserInfoForm role={role} />
}

export default function UserInfo() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserInfoWrapper />
    </Suspense>
  )
}

