export interface UserInfo {
  name: string
  age: number
  role: "student" | "teacher"
  gradeLevel?: number
  profilePicture?: string
}

export function saveUserInfo(userInfo: UserInfo) {
  localStorage.setItem("userInfo", JSON.stringify(userInfo))
}

export function getUserInfo(): UserInfo | null {
  const userInfo = localStorage.getItem("userInfo")
  return userInfo ? JSON.parse(userInfo) : null
}

