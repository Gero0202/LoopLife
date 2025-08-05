import { getAuthUser } from "@/app/lib/auth";
import pool from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ genre: string }> }) {
    try {
        const { genre } = await params

        if (!genre) {
            return NextResponse.json(
                { message: "El parametro de genero es obligatorio" }, 
                { status: 400 }
            );
        }

        const currentUser = await getAuthUser()
        const userId = currentUser ? currentUser.user_id : null

        const result = await pool.query(
            `SELECT 
                loops.*, 
                users.username, 
                users.avatar,
                CASE WHEN $2::int IS NOT NULL AND likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_liked_by_current_user
            FROM loops 
            JOIN users ON loops.user_id = users.user_id
            LEFT JOIN likes ON loops.loop_id = likes.loop_id AND likes.user_id = $2
            WHERE loops.genre = $1`,
            [genre, userId]
        )
    

        const loopWithUser = result.rows.map(row => ({
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
            is_liked_by_current_user: row.is_liked_by_current_user,
            user: { 
                username: row.username,
                avatar: row.avatar,
            }
        }));

        return NextResponse.json({ loops: loopWithUser }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { message: "Error al filtrar por genero" },
            { status: 500 }
        )
    }
}