import { useAuth } from "../context/AuthContext"

export function useLikeLoop() {
  const { currentUser } = useAuth()

  async function toggleLike(loopId: number, currentIsLiked: boolean): Promise<"liked" | "unliked" | "unauthorized" | "error"> {
    if (!currentUser) return "unauthorized"

    try {
      const method = currentIsLiked ? "DELETE" : "POST"
      const res = await fetch(`/api/loops/${loopId}/likes`, {
        method,
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) throw new Error("Request failed")
      return currentIsLiked ? "unliked" : "liked"

    } catch (err) {
      return "error"
    }
  }

  return { toggleLike }
}


