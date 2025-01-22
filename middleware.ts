import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const user = req.cookies.get("user")?.value

  // If the user is not signed in and the current path is not / or /signin or /signup,
  // redirect the user to /
  if (!user && !["/", "/signin", "/signup"].includes(req.nextUrl.pathname)) {
    console.log("Middleware: Redirecting to / due to no user")
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If the user is signed in and the current path is /, /signin, or /signup,
  // redirect the user to their respective dashboard
  if (user && ["/", "/signin", "/signup"].includes(req.nextUrl.pathname)) {
    const userData = JSON.parse(user)
    console.log("Middleware: Redirecting signed-in user to dashboard")
    return NextResponse.redirect(new URL(userData.role === "student" ? "/student/home" : "/teacher/home", req.url))
  }

  console.log("Middleware: Allowing request to proceed")
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

