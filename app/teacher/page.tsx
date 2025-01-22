import Link from "next/link"
import { ArrowLeft, BookOpen, Video, Users } from "lucide-react"
import { ProgressBar } from "../components/ProgressBar"

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col items-center">
      <ProgressBar progress={100} />
      <Link href="/" className="self-start mb-4 flex items-center text-green-500 hover:text-green-600">
        <ArrowLeft className="mr-1" size={16} />
        Back to Selection
      </Link>
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <button className="flex items-center justify-center p-4 bg-green-100 text-green-800 rounded-lg shadow hover:bg-green-200 transition-colors">
          <BookOpen className="mr-2" />
          <span>Manage Courses</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-lg shadow hover:bg-blue-200 transition-colors">
          <Video className="mr-2" />
          <span>Schedule Live Sessions</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-purple-100 text-purple-800 rounded-lg shadow hover:bg-purple-200 transition-colors">
          <Users className="mr-2" />
          <span>Student Management</span>
        </button>
      </div>
    </div>
  )
}

