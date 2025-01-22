import { Suspense } from "react"
import TeacherDashboard from "./TeacherDashboard"

export default function TeacherHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeacherDashboard />
    </Suspense>
  )
}

