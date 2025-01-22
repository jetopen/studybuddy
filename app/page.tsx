import Link from "next/link"
import { Book, ClapperboardIcon as ChalkboardTeacher } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to Virtual Learning</h1>
      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        <Link href="/signup" passHref>
          <Button className="w-full flex items-center justify-center">
            <Book className="mr-2" />
            <span className="text-xl font-semibold">Sign Up</span>
          </Button>
        </Link>
        <Link href="/signin" passHref>
          <Button variant="outline" className="w-full flex items-center justify-center">
            <ChalkboardTeacher className="mr-2" />
            <span className="text-xl font-semibold">Sign In</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

