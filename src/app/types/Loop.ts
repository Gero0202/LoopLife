export interface Loop{
    loop_id: number
    user_id: number
    title: string
    description: string
    genre: string
    rating: number
    mood: string
    audio_url: string
    likes: number
    comments: number
    created_at: string
    updated_at: string
    user: {
        username: string
        avatar: string
    }
    is_liked_by_current_user?: boolean
}