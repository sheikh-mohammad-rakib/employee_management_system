import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth"

export default async function Home() {
  const auth = await getAuthUser()
  if (!auth) redirect("/login")
  if (auth.role === "EMPLOYEE") redirect("/employee")
  redirect("/admin")
}
