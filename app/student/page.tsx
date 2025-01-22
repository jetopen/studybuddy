import Link from "next/link"
import { ArrowLeft, BookOpen, Video, MessageSquare } from "lucide-react"
import { ProgressBar } from "../components/ProgressBar"

export default function StudentDashboard() {
  return (
    <div className="flex flex-col items-center">
      <ProgressBar progress={100} />
      <Link href="/" className="self-start mb-4 flex items-center text-blue-500 hover:text-blue-600">
        <ArrowLeft className="mr-1" size={16} />
        Back to Selection
      </Link>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <button className="flex items-center justify-center p-4 bg-blue-100 text-blue-800 rounded-lg shadow hover:bg-blue-200 transition-colors">
          <BookOpen className="mr-2" />
          <span>My Courses</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-green-100 text-green-800 rounded-lg shadow hover:bg-green-200 transition-colors">
          <Video className="mr-2" />
          <span>Live Sessions</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow hover:bg-yellow-200 transition-colors">
          <MessageSquare className="mr-2" />
          <span>Discussion Forums</span>
        </button>
      </div>
    </div>
  )
}

