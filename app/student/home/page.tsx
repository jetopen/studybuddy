import { Suspense } from "react"
import StudentDashboard from "./StudentDashboard"

export default function StudentHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentDashboard />
    </Suspense>
  )
}

