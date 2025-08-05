import { getAuthUser, requireRole } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { NextResponse } from "next/server";


interface RouteParams {
    params: Promise<{
        id: string
    }>
}


export async function GET(req: Request, { params }: RouteParams) {
    try {
        const { id } = await params
        const userId = parseInt(id, 10)
        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "El ID es invalido para traer loops de user" },
                { status: 400 }
            )
        }

        const currentUser = await getAuthUser()

        const result = await pool.query(
            `SELECT 
          l.loop_id,
          l.user_id,
          l.title,
          l.description,
          l.rating,
          l.genre,
          l.mood,
          l.audio_url,
          l.likes,
          l.comments,
          l.created_at,
          u.username,
          u.avatar,
          CASE 
            WHEN $1::int IS NOT NULL AND li.user_id IS NOT NULL THEN TRUE
            ELSE FALSE
            END AS is_liked_by_current_user
            FROM loops l
            JOIN users u ON l.user_id = u.user_id
            LEFT JOIN likes li ON l.loop_id = li.loop_id AND li.user_id = $1
            WHERE l.user_id = $2
            ORDER BY l.created_at DESC`,
            [currentUser ? currentUser.user_id : null, userId]
        )


        const loops = result.rows.map(row => ({
            loop_id: row.loop_id,
            user_id: row.user_id,
            title: row.title,
            description: row.description,
            rating: row.rating,
            genre: row.genre,
            mood: row.mood,
            audio_url: row.audio_url,
            likes: row.likes,
            comments: row.comments,
            created_at: row.created_at,
            user: {
                username: row.username,
                avatar: row.avatar,
            },
            is_liked_by_current_user: row.is_liked_by_current_user
        }))

        return NextResponse.json({ loops }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { message: "Error interno del servidor al traer los loops ded un usuario" },
            { status: 500 }
        )
    }
}