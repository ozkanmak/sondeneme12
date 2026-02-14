export async function getProfile() {
  try {
    const res = await fetch("/api/student/profile")
    return res
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return { ok: false }
  }
}
